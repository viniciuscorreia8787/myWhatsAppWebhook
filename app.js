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

  // Check if request body contains object named "messages"
  const messagesObject = req.body && req.body.entry && req.body.entry[0] && req.body.entry[0].changes && req.body.entry[0].changes[0] && req.body.entry[0].changes[0].value && req.body.entry[0].changes[0].value.messages;
  if (messagesObject) {

    //Example object structure:
    //   {
    //   "object": "whatsapp_business_account",
    //   "entry": [
    //     {
    //       "id": "1882513740000000",
    //       "changes": [
    //         {
    //           "value": {
    //             "messaging_product": "whatsapp",
    //             "metadata": {
    //               "display_phone_number": "15550000000",
    //               "phone_number_id": "843764110000000"
    //             },
    //             "contacts": [
    //               {
    //                 "profile": {
    //                   "name": "Vinicius"
    //                 },
    //                 "wa_id": "5511999999999"
    //               }
    //             ],
    //             "messages": [
    //               {
    //                 "from": "5511999999999",
    //                 "id": "wamid.HBgNNTUxMTk5MzA5NDgyMBUCABIYFjNFQjAyMEU5M0E0RTQzRUM2NjJEMUQA",
    //                 "timestamp": "1757193553",
    //                 "text": {
    //                   "body": "Teste sete =S"
    //                 },
    //                 "type": "text"
    //               }
    //             ]
    //           },
    //           "field": "messages"
    //         }
    //       ]
    //     }
    //   ]
    // }

    res.write('Processing message...\n');

    const waAccessToken = process.env.WA_ACCESS_TOKEN;
    const url = `https://graph.facebook.com/v22.0/843764115476151/messages`;
    const headers = {
      'Authorization': `Bearer ${waAccessToken}`,
      'Content-Type': 'application/json'
    };

    const data = {
      'messaging_product': 'whatsapp',
      'to': '5511993094820',
      'type': 'template',
      'template': {
        'name': 'hello_world',
        'language': {
          'code': 'en_US'
        }
      }
    };

    fetch(url, { method: 'POST', headers, body: JSON.stringify(data) })
      .then(response => response.json())
      .then(data => console.log(`Response received ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`))
      .catch(error => console.error(error));

    res.end('\n'.repeat(100) + '\n\n');  // corrected newline at the end
  }
  res.status(200).end();
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
