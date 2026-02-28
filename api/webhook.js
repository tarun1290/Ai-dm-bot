// Vercel Serverless Function — routes all /webhook requests to the Express app
const app = require('../query-bot/index.js');

module.exports = app;
