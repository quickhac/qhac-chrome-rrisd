// dependencies: jQuery

'use strict';

var RetrieveUtils = (function (RetrieveUtils, undefined) {
	
	// constants
	var parser = new DOMParser();

	// methods
	RetrieveUtils.parseDoc = function (data) {
		return parser.parseFromString(data, 'text/html');
	}

	/**
	 * true iff the document has a student picker on it
	 */
	RetrieveUtils.hasPicker = function (doc) {
		return !!$('.sg-banner-chooser > .sg-button', doc).length;
	}

	/**
	 * Returns the currently selected student's name
	 */
	RetrieveUtils.getSelectedStudent = function (doc) {
		return $('.sg-banner-chooser > .sg-banner-text', doc).text().trim();
	}

	/**
	 * Returns the name of the account on the page
	 */
	RetrieveUtils.getAccountName = function (doc) {
		return $('.sg-menu-element-identity > span').text().trim();
	}

	return RetrieveUtils;

})(RetrieveUtils || {});