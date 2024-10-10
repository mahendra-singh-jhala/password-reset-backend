// Import the express
const express = require("express");

// Import jsonwebtoken for generating secure tokens
const jwt = require('jsonwebtoken');

// Import the User model database interactions
const User = require("../models/userModels");

// Import bcrypt for hashing passwords
const bcrypt = require('bcrypt');

// Import the mailer to sendmail
const sendMail = require("../mailer/nodeMail")

// creating a router
const router = express.Router();

require("dotenv").config();

// Route for user registration
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                error: "Username or email already exists"
            });
        }
        
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({username, email, password: hashPassword });
        await newUser.save();
        res.status(201).json({
            message: "User registered successfully"
        });
    } catch (error) {
        res.status(400).json({
            error: "User registered failed"
        })
    }
})

// Route for initiating a password reset
router.post("/password-reset", async (req, res) => {
    // Destructure email from request body
    const { email } = req.body;

    try {
        // Check if user exists with the provided email
        const user = await User.findOne({email: email });

        // If user is not found, return an error response
        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        // Generate a random token for password reset, Token expires in 1 hour
        const token = jwt.sign({ userId: user._id}, process.env.SECRET_KEY, { expiresIn: "1hr" })
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        // Save the updated user document to the database
        await user.save();

        // Create a password reset link using the generated token
        const restlink = `https://old-password-reset.netlify.app/reset-password/${token}`

        // Send the reset link to the user's email (to, subject, text)
        await sendMail(user.email, "Password Reset", `Reset Your Password: ${restlink}`)

        // Respond with a success message
        res.status(200).json({
            message: `Password reset link sent to your email ${user.email}`
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error. Please try again later.'
        });
    }
});


// Route for resetting the password
router.post("/reset-password/:token", async (req, res) => {
    // Get the new password from the request body
    const { password } = req.body;

    // Get the token from the request parameters
    const { token } = req.params;

    // Verify the token
    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY)

        // Find the user by ID in the decoded token
        const user = await User.findById(decode.userId)

        // If no user is found, return an error response
        if (!user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        // Check if the token has expired
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                error: 'Token has expired.'
            });
        }

        // Hash the new password using bcrypt before saving it
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Save the updated user document to the database
        await user.save();

        // Send a success response indicating that the password has been reset
        res.status(200).json({
            message: 'Password reset successful.'
        });

    } catch (error) {
        res.status(400).json({
            error: 'Invalid or expired token.'
        });
    }
})

module.exports = router;