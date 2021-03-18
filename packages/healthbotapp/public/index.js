/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

var params = new URLSearchParams(location.search);
var locale = params.get("locale") || navigator.language || 'en-us';
var chatBotEndpoint = "/chatbot"// ?locale=" + locale;
var lat = null;
var long = null;

function requestChatBot(loc) {
	lat = loc ? loc.lat : null;
	long = loc ? loc.long : null;
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", initBotConversation);
	oReq.open("POST", chatBotEndpoint);
	oReq.send();
}

function chatRequested() {
	if (params.has('shareLocation')) {
		getUserLocation(requestChatBot);
	}
	else {
		requestChatBot();
	}
}

function getUserLocation(callback) {
	navigator.geolocation.getCurrentPosition(
		function(position) {
			callback({
				lat: position.coords.latitude,
				long: position.coords.longitude
			});
		},
		function(error) {
			// user declined to share location
			console.log("could not use location api:" + error.message);
			callback();
		});
}

function initBotConversation() {
    if (this.status >= 400) {
        alert(this.statusText);
        return;
    }
    // extract the data from the JWT
		var jsonWebToken = this.response;
		var tokenPayload = JSON.parse(atob(jsonWebToken.split('.')[1]));
    var domain = undefined;
		var preamble = 'bing'
		var channel = (params.get('channel') || 'webchat').toLowerCase();

		if (params.has('preamble')) {
			preamble = params.get('preamble')
		}
    if (tokenPayload.directLineURI) {
			domain =  "https://" +  tokenPayload.directLineURI + "/v3/directline";
    }
    var botConnection = window.WebChat.createDirectLine({
        token: tokenPayload.connectorToken,
        domain: domain
    });
    var styleOptions = {
			// botAvatarImage: "https://docs.microsoft.com/en-us/azure/bot-service/v4sdk/media/logo_bot.svg?view=azure-bot-service-4.0",
			// userAvatarImage: '',
			/* 
			* Hide the sendbox for web based chats.
			* Show the sendbox when testing the SMS channel.
			*/
			hideSendBox: channel === 'webchat',
			botAvatarInitials: 'MITRE',
			userAvatarInitials: 'You',
			backgroundColor: '#F8F8F8'
		};

    var store = window.WebChat.createStore({}, function(store) { return function(next) { return function(action) {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
					store.dispatch({
						type: 'DIRECT_LINE/POST_ACTIVITY',
						meta: {method: 'keyboard'},
						payload: {
							activity: {
								type: "invoke",
								name: "InitConversation",
								locale: locale,
								value: {
									// must use for authenticated conversation.
									jsonWebToken: jsonWebToken,

									// Use the following activity to proactively invoke a bot scenario
									triggeredScenario: {
										trigger: "c19_entry",
										args: {
												preamble: preamble,
												countryRegion: params.get("countryRegion") || null,
												adminDistrict: params.get("adminDistrict") || null,
												channel: channel,
												lat: lat,
												long: long
										}
									}
								}
							}
						}
					});
        }
        else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
					if (action.payload && action.payload.activity && action.payload.activity.type === "event" && action.payload.activity.name === "ShareLocationEvent") {
						// share
						getUserLocation(function (location) {
								store.dispatch({
										type: 'WEB_CHAT/SEND_POST_BACK',
										payload: { value: JSON.stringify(location) }
								});
						});
					}
        }
        return next(action);
    }}});

    startChat({
			directLine: botConnection,
			styleOptions: styleOptions,
			store: store,
			userID: tokenPayload.userId,
			username: tokenPayload.userName,
			locale: locale
	});
}

function startChat(webchatOptions) {
    var botContainer = document.getElementById('webchat');
    window.WebChat.renderWebChat(webchatOptions, botContainer);
}
