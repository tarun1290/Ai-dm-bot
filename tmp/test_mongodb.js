const mongoose = require('mongoose');

const uri = "mongodb+srv://amanraj5687_db_user:axMyo759PrdOxEpY@querybot.wxojyis.mongodb.net/";

async function testConnection() {
    console.log("Testing connection to MongoDB Atlas...");
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("SUCCESS: Connected to MongoDB Atlas!");
        await mongoose.connection.close();
    } catch (err) {
        console.error("FAILURE: Could not connect to MongoDB Atlas.");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.name === 'MongooseServerSelectionError') {
            console.log("This literally means your IP is probably not whitelisted!");
        }
    }
}

testConnection();
