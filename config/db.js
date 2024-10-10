// Import the mongoose 
const mongoose = require("mongoose");

// Load environment variables from .env file
require("dotenv").config();

// connection build to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Database is connected")
    } catch (error) {
        console.error("MongoDB Database Not Connected" , error.message)
    }
}

module.exports = connectDB;