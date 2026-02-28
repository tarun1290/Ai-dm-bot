const http = require('http');

const payload = JSON.stringify({
    object: 'instagram',
    entry: [
        {
            id: '17841460161632234', 
            time: Date.now(),
            changes: [
                {
                    field: 'comments',
                    value: {
                        from: { id: '999999999', username: 'test_user' },
                        id: 'test_comment_' + Date.now(),
                        text: 'hello testing bot'
                    }
                }
            ]
        }
    ]
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

const req = http.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error sending webhook:', error.message);
});

req.write(payload);
req.end();
