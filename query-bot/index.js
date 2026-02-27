const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/db');
const webhookRouter = require('./src/routes/webhook');
const { LOG_FILE } = require('./src/utils/logger');
const Event = require('./src/models/Event');
const { isConnected } = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => res.send('Query Bot API is Live 🚀'));
app.use('/webhook', webhookRouter);

// Export the app for Vercel
module.exports = app;

// Only listen if running locally
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}...`);
    });
}
