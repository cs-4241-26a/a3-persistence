const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_URI);

let db;

async function connectDB() {
    await client.connect();

    db = client.db("a3database");

    console.log("Connected to MongoDB");
}

function getDB() {
    return db;
}

module.exports = {
    connectDB,
    getDB
};