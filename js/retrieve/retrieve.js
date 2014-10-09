// dependencies: JQuery

'use strict';

var RetrieveUtils = (function (RetrieveUtils, undefined) {
	
	// constants
	var parser = new DOMParser();

	// methods
	RetrieveUtils.parseDoc = function (data) {
		return parser.parseFromString(data, 'text/html');
	}

	return RetrieveUtils;

})(RetrieveUtils || {});

var Validate = (function (Validate, undefined) {

	Validate.postLogin = function (data) {
		return data.indexOf('Logoff') != -1;
	}

	Validate.assignments = function (data) {
		return data.indexOf('action="Assignments.aspx"') != -1;
	}

	Validate.picker = function (data) {
		return data.indexOf('id="StudentPicker"') != -1;
	}

	return Validate;

})(Validate || {});

var Retrieve = (function (Retrieve, undefined) {

	// constants
	Retrieve.LOGIN_FORM_URL =
		'https://accesscenter.roundrockisd.org/HomeAccess/Account/LogOn?ReturnUrl=%2fhomeaccess%2f';
	Retrieve.ASSIGNMENTS_URL =
		'https://accesscenter.roundrockisd.org/HomeAccess/Content/Student/Assignments.aspx';
	Retrieve.STUDENT_PICKER_URL =
		'https://accesscenter.roundrockisd.org/HomeAccess/Frame/StudentPicker';
	Retrieve.SESSION_TIMEOUT = 9 * 60 * 1000; // 9 minutes * 60 sec/min * 1000 ms/s


	// instance variables
	var lastSuccessfulRequestTime = 0,
		username, password, student;

	/**
	 * Resolves the promise after ensuring that we are currently logged into HAC
	 */
	function ensureLoggedIn () {
		return new Promise(function (resolve, reject) {
			if (username == null || password == null)
				reject(new Error('not logged in'));
			else if (+new Date - lastSuccessfulRequestTime > Retrieve.SESSION_TIMEOUT)
				Retrieve.login(username, password).done(resolve).fail(reject);
			else
				resolve();
		});
	}

	/**
	 * true iff the document has a student picker on it
	 */
	function hasPicker (doc) {
		return !$('.sg-banner-chooser > .sg-button', doc).length;
	}

	/**
	 * Returns the currently selected student's name
	 */
	function getSelectedStudent (doc) {
		return $('.sg-banner-chooser > .sg-banner-text').text().trim();
	}

	/**
	 * Logs into HAC with the given credentials
	 * returns: ES6 Promise
	 */
	Retrieve.login = function (u, p) {
		return new Promise(function (resolve, reject) {
			$.ajax(Retrieve.LOGIN_FORM_URL, {
				type: 'POST',
				data: {
					Database: '10',
					'LogOnDetails.UserName': u,
					'LogOnDetails.Password': p
				}
			}).done(function (data) {
				if (!Validate.postLogin(data)) {
					reject(new Error('Invalid page'));
					return;
				}

				lastSuccessfulRequestTime = +new Date;
				username = u;
				password = p;
				var doc = RetrieveUtils.parseDoc(data);
				resolve({
					hasPicker: hasPicker(doc),
					selectedStudent: getSelectedStudent(doc)
				});
			}).fail(reject);
		});
	}

	/**
	 * Gets the assignments page, logging back in if necessary
	 * returns: ES6 Promise
	 */
	Retrieve.assignments = function () {
		return new Promise(function (resolve, reject) {
			ensureLoggedIn().then(get, reject);

			function get () {
				 $.ajax(Retrieve.ASSIGNMENTS_URL, { type: 'GET' })
				  .done(function (data) {
				  	if (!Validate.assignments(data)) {
				  		reject(new Error('Invalid page'));
				  		return;
				  	}

				 	lastSuccessfulRequestTime = +new Date;
				 	var doc = RetrieveUtils.parseDoc(data);
				 	resolve({
				 		courses: Parser.parse(doc),
				 		mpInfo: Parser.getMarkingPeriodInfo(doc),
				 		aspState: Parser.getASPState(doc)
				 	});
				 }).fail(reject);
			}
		});
	}

	/**
	 * Gets a list of students under the current account
	 */
	Retrieve.studentPicker = function () {
		return new Promise(function (resolve, reject) {
			ensureLoggedIn().then(get, reject);

			function get () {
				$.ajax(Retrieve.STUDENT_PICKER_URL, {
					type: 'GET',
					data: { '_': +new Date }
				}).done(function (data) {
					if (!Validate.picker(data)) {
						reject(new Error('Invalid page'));
						return;
					}

				 	var doc = RetrieveUtils.parseDoc(data);

				 	resolve([].map.call($('.sg-student-picker-row', doc),
				 			function (row) {
				 		var $row = $(row);
				 		return {
				 			name: $row.find('.sg-picker-student-name').text(),
				 			studentId: $row.find('[name=studentId]').val()
				 		};
				 	}));
				 }).fail(reject);
			}
		})
	}

	Retrieve.declareLoggedOut = function () {
		lastSuccessfulRequestTime = 0;
	}

	Retrieve.declareLoggedIn = function () {
		lastSuccessfulRequestTime = +new Date;
	}

	return Retrieve;

})(Retrieve || {});