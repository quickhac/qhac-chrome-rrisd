'use strict';

// Listen for messages from other pages and injected scripts to get and set data
// as well as modify the persistent state of the extension.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.type) {
		// usage: { type: 'declareLoggedIn' }
		// returns: true
		case 'declareLoggedIn':
			Retrieve.declareLoggedIn();
			sendResponse(true);
			break;
		// usage: { type: 'declareLoggedOut' }
		// returns: true
		case 'declareLoggedOut':
			Retrieve.declareLoggedOut();
			sendResponse(true);
			break;
		// usage: { type: 'declareLoggedInStudentName', data: {string}}
		// returns: true
		case 'declareLoggedInStudentName':
			Retrieve.declareLoggedInStudentName(request.data);
			sendResponse(true);
			break;
		// usage: { type: 'delayUpdate' }
		// returns: true
		// If the extension is about to do a background update within the next
		// few minutes, this will make it update later. This is desirable when
		// the user is currently interacting with Home Access Center using the
		// web interface; doing a background update might log the user out or
		// mess with the user's session if they are checking grades for an
		// account other than the one that's logged into QuickHAC.
		case 'delayUpdate':
			// TODO: delay background update if needed
			sendResponse(true);
			break;
		// usage: { type: 'storeGet', method: {string} }
		// Calls the method with the specified name on Store and returns
		// whatever Store returns.
		case 'storeGet':
			sendResponse(Store[request.method]());
			break;
		// usage: { type: 'storeSet', method: {string}, data: {any[]} }
		// Calls the method with the specified name and the specified arguments
		// in an array using apply().
		// returns: true
		case 'storeSet':
			Store[request.method].apply(null, request.data);
			sendResponse(true);
			break;
		// usage: { type: 'createTab', url: {string}}
		// Opens a new tab to the specified URL. This is useful because injected
		// scripts cannot access the chrome.tabs API.
		case 'createTab':
			chrome.tabs.create({url: chrome.extension.getURL(request.url)});
			sendResponse(true);
			break;
		// usage: { type: 'logout' }
		// Deletes all stored user information from Store and the current
		// QuickHAC background state.
		// returns: true
		case 'logout':
			Retrieve.declareLoggedOut();
			Retrieve.setCredentials(undefined, undefined);
			sendResponse(true);
			break;
		// If the message type requested is not implemented, don't return anything.
		default:
	}
});