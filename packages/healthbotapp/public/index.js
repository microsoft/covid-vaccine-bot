/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

const defaultLocale = 'en-US';

const params = new URLSearchParams(location.search);
const locale = params.get("locale") || navigator.language;

function requestChatBot(loc) {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", initBotConversation);
    var path = "/chatBot?locale=" + locale;

    if (loc) {
        path += "&lat=" + loc.lat + "&long=" + loc.long;
    }
    if (params.has('userId')) {
        path += "&userId=" + params.get('userId');
    }
    if (params.has('userName')) {
        path += "&userName=" + params.get('userName');
    }
    if (params.has('region')) {
        path += '&region=' + params.get('region');
    }
    oReq.open("POST", path);
    oReq.send();
}

function chatRequested() {
    // const params = new URLSearchParams(location.search);
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
    var lat = tokenPayload.location && tokenPayload.location.lat ? tokenPayload.location.lat : null;
    var long = tokenPayload.location && tokenPayload.location.long ? tokenPayload.location.long : null;
    var user = {
        id: tokenPayload.userId,
        name: tokenPayload.userName,
        locale: tokenPayload.locale
    };
    var domain = undefined;
    if (tokenPayload.directLineURI) {
        domain =  "https://" +  tokenPayload.directLineURI + "/v3/directline";
    }
    var botConnection = window.WebChat.createDirectLine({
        token: tokenPayload.connectorToken,
        domain: domain
    });
    var styleOptions = {
        botAvatarImage: 'https://docs.microsoft.com/en-us/azure/bot-service/v4sdk/media/logo_bot.svg?view=azure-bot-service-4.0',
        // botAvatarInitials: '',
        // userAvatarImage: '',
        hideSendBox: true,
        botAvatarInitials: 'Bot',
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
                        locale: user.locale,
                        value: {
                            // must use for authenticated conversation.
                            jsonWebToken: jsonWebToken,

                            // Use the following activity to proactively invoke a bot scenario
                            triggeredScenario: {
                                trigger: "c19_entry",
                                args: {
                                    preamble: 'bing',
                                    countryRegion: params.get("countryRegion") || null,
                                    adminDistrict: params.get("adminDistrict") || null,
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
		
    startChat(user, {
			directLine: botConnection,
			styleOptions: styleOptions,
			store: store,
			userID: user.id,
			username: user.name,
			locale: user.locale
	});
}

function startChat(user, webchatOptions) {
    var botContainer = document.getElementById('webchat');
    window.WebChat.renderWebChat(webchatOptions, botContainer);
}
