const mongoose = require('mongoose')
const dotenv = require("dotenv").config()

const URL = process.env.DB_URL;

const Database = async() => {
    try {
        await mongoose.connect(URL, {})
        console.log("Successfully.......... Connected to Database")
    } catch (error) {
        console.error("Database connection failed:", error.message)
    }
}

module.exports = Database; 