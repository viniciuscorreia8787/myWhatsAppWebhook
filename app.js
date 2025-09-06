// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/', (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));
  res.write('Processing message...\n');

  const childProcess = require('child_process');  // Added this line here, not in the main execution block

  // Removed unnecessary require statement
  childProcess.execSync(
    `curl -i -X POST 'https://graph.facebook.com/v22.0/843764115476151/messages' -H 'Authorization: Bearer ${process.env.WA_ACCESS_TOKEN}' -H 'Content-Type: application/json' -d '{"messaging_product": "whatsapp", "to": "5511993094820", "type": "template", "template": {"name": "hello_world", "language": {"code": "en_US"}}'`
  );

  res.end('\n'.repeat(100) + '\n\n');  // corrected newline at the end

  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
