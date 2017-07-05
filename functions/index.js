'use stric'

const functions = require('firebase-functions');
const base64url = require('base64url');
const PubSub = require('@google-cloud/pubsub')

exports.helloWorld = functions.https.onRequest((request, response) => {
	console.log("get trigger");
	if(request.method === "POST"){
		console.log("request body : %O", request.body);
		var key = request.body['key']
		var json = JSON.stringify(request.body);
		var base64json = base64url(json);
		console.log(key);
		console.log(base64json);
		if(!base64json || 0 === base64json.length || !key || 0 === key.length){
			response.status(400).end();
		} else {
			var data = {
				key : key,
				value : base64json
			};
			var instance = PubSub({
				projectId: 'semiotic-karma-172203',
				keyFilename: './firebase-admin-sdk-key.json'
			});
			instance.topic('hello_topic').publish(data, function(err, messageId){
				if(err){
					console.log(err);
					response.status(500).end();
				} else {
					response.status(200).send(messageId);
				}
			});
		}
	} else {
		response.status(202).end();
	}
});

