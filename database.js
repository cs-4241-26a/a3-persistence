require('dotenv').config()
const mongoose = require( 'mongoose' )

const connectDB = async() => {
    try {
        const uri = process.env.MONGODB_URI
        await mongoose.connect(uri)
        console.log("Connected to MongoDB")
    }
    catch (err) {
        console.error("Failed to Connect to MongoDB, Error:", err)
        process.exit(1)
    }
}

module.exports = connectDB