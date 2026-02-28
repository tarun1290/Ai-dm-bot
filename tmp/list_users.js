const mongoose = require('mongoose');

const uri = "mongodb+srv://amanraj5687_db_user:axMyo759PrdOxEpY@querybot.wxojyis.mongodb.net/test?retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema({
  clerkId: String,
  instagramUsername: String,
  isConnected: Boolean,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkUsers() {
    console.log("Connecting to MongoDB...");
    try {
        await mongoose.connect(uri);
        console.log("SUCCESS: Connected!");
        
        const users = await User.find({ isConnected: true });
        console.log("Connected Users found:", users.length);
        
        users.forEach(u => {
            console.log(`ClerkID: ${u.clerkId}, IG Username: ${u.instagramUsername}`);
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}

checkUsers();
