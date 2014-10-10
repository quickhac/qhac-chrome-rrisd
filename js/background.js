'use strict';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.type) {
		case 'declareLoggedIn':
			Retrieve.declareLoggedIn();
			sendResponse(true);
			break;
		case 'declareLoggedOut':
			Retrieve.declareLoggedOut();
			sendResponse(true);
			break;
		case 'delayUpdate':
			// TODO: delay background update if needed
			sendResponse(true);
			break;
		case 'storeGet':
			sendResponse(Store[request.method]());
			break;
		case 'storeSet':
			Store[request.method].apply(null, request.data);
			sendResponse(true);
			break;
		default:
			sendResponse(false);
	}
});