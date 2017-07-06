'use stric'

const functions = require('firebase-functions');
const base64url = require('base64url');
const PubSub = require('@google-cloud/pubsub')

// 別プロジェクトのPUBSUBにPUBLISHする例
// https trigger (ここではOmiseのWebhook) をうけとり、指定ProjectのPubsubへPUBLISH
// firebase projectのFirebaseサービスアカウントに、指定Project側のIAMにPUBSUBの権限付きで追加する必要が有ると思う
exports.publishOtherProjectPubsub = functions.https.onRequest((request, response) => {
	if(request.method === "POST"){
		console.log("request body : %O", request.body);
		var json = JSON.stringify(request.body);
		var base64json = base64url(json);
		console.log(base64json);
		if(!base64json || 0 === base64json.length) {
			response.status(400).end();
		} else {
			var instance = PubSub({
				projectId: 'semiotic-karma-172203',
				keyFilename: './firebase-admin-sdk-key.json'
			});
			instance.topic('hello_topic').publish(base64json, function(err, messageId){
				if(err){
					console.log(err);
					response.status(500).end();
				} else {
					response.status(200).send(messageId);
				}
			});
		}
	} else {
		response.status(400).end();
	}
});


//// 同一Project内のPubsubにPushする
//exports.publishProjectPubsub = functions.https.onRequest((request, response) => {
//});
