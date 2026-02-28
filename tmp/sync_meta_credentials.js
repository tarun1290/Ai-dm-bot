const mongoose = require('mongoose');

const uri = "mongodb+srv://amanraj5687_db_user:axMyo759PrdOxEpY@querybot.wxojyis.mongodb.net/test?retryWrites=true&w=majority";

const clerkId = "user_3ACX4acTMnEMLsM8buj61g3OxK0";
const accessToken = "EAAL7mXBItg8BQ1uMKKZCmTR8SCH5gdzumaFDcj4mxNL4m3MFqOsk78ZA57hJK6tFVf2UsgyHCyxYWezHpegkpTP8yd2HsTAcwyooIxBGhZAmh9CYEqbbDZAuzUbZAptC1jw50Qw9lSm1ZCZCeB50uL6GZAFegzbLAJSOxPWTx7Qt4HUuqCcjL6YX2szVfcJZCb2PyJ0SKrwLekgKLIHomm7XDuRYZD";
const businessId = "17841460161632234";
const username = "doteyelabs";

const UserSchema = new mongoose.Schema({
  clerkId: String,
  instagramAccessToken: String,
  instagramBusinessId: String,
  instagramUsername: String,
  isConnected: Boolean,
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function syncAccount() {
    console.log("Connecting to MongoDB...");
    try {
        await mongoose.connect(uri);
        console.log("SUCCESS: Connected!");
        
        await User.findOneAndUpdate(
            { clerkId: clerkId },
            {
                instagramAccessToken: accessToken,
                instagramBusinessId: businessId,
                instagramUsername: username,
                isConnected: true
            },
            { upsert: true }
        );
        
        console.log("SUCCESS: Synced account for", username);
        await mongoose.connection.close();
    } catch (err) {
        console.error("FAILURE:", err.message);
    }
}

syncAccount();
