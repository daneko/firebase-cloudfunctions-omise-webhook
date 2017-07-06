/*
https://firebase.google.com/docs/reference/functions/functions.pubsub の辺り見てもpublish「する」のはなさそう…?
*/
'use stric'

const functions = require('firebase-functions');
const base64url = require('base64url');
const PubSub = require('@google-cloud/pubsub')

// 別プロジェクトのPUBSUBにPUBLISHする例
// https triggerをうけとり、指定ProjectのPubsubへPUBLISH
// firebase projectのFirebaseサービスアカウントに、指定Project側のIAMにPUBSUBの権限付きで追加する必要が有ると思う
exports.publishOtherProjectPubsub = functions.https.onRequest((request, response) => {
	if(request.method === "POST"){
		jsonToBase64(request.body, (err, data) => {
			if(err){
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
		});
	} else {
		response.status(400).end();
	}
});


// 同一Project内のPubsubにPushする
exports.publishProjectPubsub = functions.https.onRequest((request, response) => {
	if(request.method === "POST"){
		if(request.body){
			var instance = PubSub();
			instance.topic('test-topic').publish(request.body, function(err, messageId){
				if(err){
					console.log(err);
					response.status(500).end();
				} else {
					response.status(200).send(messageId);
				}
			});
		} else {
			response.status(400).end();
		}
	} else {
		response.status(400).end();
	}
});

// 同一Project内のPubsubにpublishされたものを受け取る
// https://github.com/firebase/functions-samples/tree/master/quickstarts/pubsub-helloworld
// これは結局push subscriberとして登録される
// pubsub自体にログはなさそう？なので受信したことだけでもpublishするFunctionと並列に並べておけば良さそう（同一Project内なら）
exports.pubsubEventTrigger = functions.pubsub.topic('test-topic').onPublish(event => {
	const pubSubMessage = event.data;
	console.log("row pubsub message : " + JSON.stringify(pubSubMessage));
	const messageBody = pubSubMessage.data ? base64url.decode(pubSubMessage.data) : null;
	console.log("get : " + JSON.stringify(messageBody));
});



// callback = function(err, data)
// js docの書き方忘れた
function jsonToBase64(json, callback){
	console.log("request json : " + json);
	var jsonStr = JSON.stringify(json);
	var base64json = base64url(jsonStr);
	console.log(base64json);
	if(!base64json || 0 === base64json.length) {
		callback( new Error("convert error"), null);
	} else {
		callback( null, base64json);
	}
}
