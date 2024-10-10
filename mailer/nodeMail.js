// Import the nodemailer
const nodemailer = require("nodemailer");

// Load environment variables from .env file
require("dotenv").config();

const sendMail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.PASS_USER
        }
    });

    const mailOption = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text 
    }

    // send the email
    try {
        await transporter.sendMail(mailOption);
        console.log("Mail sent to:", to);
    } catch (error) {
        console.error("Error sending email:", error.message);
        throw error; // Re-throw to handle in calling function
    }
}

module.exports = sendMail