/**
 * This sample shows how to connect a Akkroo webhook to a Lambda function via API Gateway, transform it, and pass the result onto a endpoint of your choosing.
 * Loosely inspired by this: https://github.com/box/samples/tree/master/box-node-webhook-to-lambda-sample
 */

'use strict';

var https = require('https');

// Set this to the receiving URL endpoint of your service
const exportURL = 'https://example.com/endpoint';

/**
 *  YOUR CODE GOES HERE!!!
 *
 */
 
/**
 * For a sample Akkroo Event Registrations Webhook JSON Payload
 * see full set of parameters & example payloads here:
 * http://docs.akkroo.com/developers/webhooks/
 */
 
function handleWebhookEvent(webhookEvent) {
    let message = ``; // `${JSON.stringify(webhookEvent, null, 2)}`;
    
    // No support for encrypted payloads yet (better to use HTTPS anyway rather than this)
    if (webhookEvent.payloadEncrypted && webhookEvent.payloadEncrypted == true) {
        return { statusCode: 426, body: `Upgrade Required` };
    }
    
    // webhookEvent.type = `registrations`
    // webhookEvent.method = `create` | `update` | `delete`
    // webhookEvent.payloadEncrypted = true | false
    // webhookEvent.timestamp =
    // webhookEvent.hash = // Only used when payloadEncrypted 
    

    // In this example we just loop through the payload and create a comma seperated list of payload IDs
    // but  you probably will want to loop through the values of the question responses, transform then pass those
    
    webhookEvent.payload.forEach( function (payloadItem) {
        
        /*
        payloadItem.id
        payloadItem.resource.id
        payloadItem.resource.values
        payloadItem.resource.timeArrived
        payloadItem.resource.isCheckIn
        payloadItem.resource.source
        payloadItem.resource.APIClient
        payloadItem.resource.valueValidationErrors = [];
        payloadItem.resource.companyID
        payloadItem.resource.eventID
        payloadItem.resource.lastModified
        payloadItem.resource.created
        payloadItem.resource.emailIndex
        */
    
        message += `${payloadItem.id}, `;
        
        
    });

    console.log(`Akkroo payload IDs: ${message}`);
    
    return { statusCode: 200, body: message };
}


exports.handler = (event, context, callback) => {
    console.log(`Original Event: ${JSON.stringify(event, null, 2)}`);

    /* #TODO Validate the request comes from Akkroo
    if ( ) {
        const response = { statusCode: 403, body: 'Message authenticity not verified' };
        console.log(`Response: ${JSON.stringify(response, null, 2)}`);
        callback(null, response);
        return;
    }
    */

    if (!event.body) {
        const response = { statusCode: 403, body: 'Missing request body' };
        console.log(`Response: ${JSON.stringify(response, null, 2)}`);
        callback(null, response);
        return;
    }

    // Parse the message body from the Lambda proxy
    const body = JSON.parse(event.body);
    console.log(`Event body: ${JSON.stringify(body, null, 2)}`);

    // Handle the webhook event
    const response = handleWebhookEvent(body);
    console.log(`Response: ${JSON.stringify(response, null, 2)}`);
    
    // Send the data out to the configured endpoint
    console.log('Start request to ' + exportURL)
    
    https.get(exportURL, function(res) {
        console.log("Got response: " + res.statusCode);
        callback(null, 'Generic success message');
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        callback(new Error('Generic failure message'));
    });
    
    console.log('End request to ' + exportURL);
    
    callback(null, response);
};
