const axios = require('axios');

const WEBHOOK_URL = 'https://preneglectful-unshivered-denis.ngrok-free.dev/api/webhook';

async function testWebhook() {
    console.log(`Testing Webhook connectivity: ${WEBHOOK_URL}`);
    try {
        // Test GET (Verification)
        console.log('--- Testing Verification (GET) ---');
        const verifyRes = await axios.get(WEBHOOK_URL, {
            params: {
                'hub.mode': 'subscribe',
                'hub.verify_token': 'query_bot_token_123',
                'hub.challenge': 'CHALLENGE_ACCEPTED'
            }
        });
        if (verifyRes.data === 'CHALLENGE_ACCEPTED') {
            console.log('✅ Webhook Verification: SUCCESS');
        } else {
            console.log('❌ Webhook Verification: FAILED (Wrong response)');
        }

        // Test POST (Simulation)
        console.log('\n--- Testing Messaging Event (POST) ---');
        const postRes = await axios.post(WEBHOOK_URL, {
            object: 'instagram',
            entry: [{
                id: '17841460161632234',
                time: Date.now(),
                messaging: [{
                    sender: { id: 'TEST_SENDER_ID' },
                    recipient: { id: '17841460161632234' },
                    timestamp: Date.now(),
                    message: { text: 'Test Connectivity' }
                }]
            }]
        });
        if (postRes.status === 200) {
            console.log('✅ Webhook Message Handling: SUCCESS (Server returned 200 OK)');
        } else {
            console.log(`❌ Webhook Message Handling: FAILED (Status: ${postRes.status})`);
        }

    } catch (error) {
        console.error('❌ Connection Error:', error.response?.data || error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('👉 Tip: Is your dashboard server running?');
        } else if (error.message.includes('404')) {
            console.log('👉 Tip: Check if the /api/webhook route is correctly defined in the dashboard.');
        } else if (error.message.includes('403')) {
            console.log('👉 Tip: Check if VERIFY_TOKEN matches in .env');
        }
    }
}

testWebhook();
