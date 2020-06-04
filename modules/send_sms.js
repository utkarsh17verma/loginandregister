const accountSid = 'AC76e4dbf35278b086dff96b9dc6cc1034';
const authToken = '221ae31a7e56974c9902dffe4f8b12fe';
const client = require('twilio')(accountSid, authToken);


function sendSMS(body,to) {
  client.messages
    .create({
      body: body,
      from: '+12028582099',
      to: to
    })
    .then(message => console.log(message.sid));
};


module.exports = {
    send: sendSMS
};