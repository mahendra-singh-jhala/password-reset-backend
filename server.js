// Import require bodule
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRoutes = require("./router/userRouter");
const cors = require("cors")

// Load environment variables from .env file
require("dotenv").config();

const app = express();

// contect to the mongodb database
connectDB();

// middleware to parser JSON
app.use(bodyParser.json())

// cors is used to fix cross origin issue
app.use(cors());

// routes
app.use("/api/users", userRoutes);

// start Server
PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})
