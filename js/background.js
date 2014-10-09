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
		default:
			sendResponse(false);
	}
});