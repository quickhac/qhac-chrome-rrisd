// dependencies: JQuery, RetrieveUtils

'use strict';

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
	Retrieve.HOME_VIEW_URL =
		'/HomeAccess/Classes/Classwork';
	Retrieve.SESSION_TIMEOUT = 9 * 60 * 1000; // 9 minutes * 60 sec/min * 1000 ms/s


	// instance variables
	var lastSuccessfulRequestTime = 0,
		username, password, student;

	/**
	 * Resolves the promise after ensuring that we are currently logged into HAC
	 */
	function ensureLoggedIn () {
		return new Promise(function (resolve, reject) {
			if (lastSuccessfulRequestTime === 0 && (username == null || password == null))
				reject(new Error('not logged in'));
			else if (+new Date - lastSuccessfulRequestTime > Retrieve.SESSION_TIMEOUT)
				Retrieve.login(username, password).done(resolve).fail(reject);
			else
				resolve();
		});
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
				student = RetrieveUtils.getSelectedStudent(doc);
				var doc = RetrieveUtils.parseDoc(data);
				resolve({
					hasPicker: RetrieveUtils.hasPicker(doc),
					selectedStudent: student
				});
			}).fail(reject);
		});
	}

	/**
	 * Sets the information to log in with
	 */
	Retrieve.setCredentials = function (u, p) {
		username = u;
		password = p;
		lastSuccessfulRequestTime = 0;
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

	/**
	 * Selects a student via the student picker by student object
	 */
	Retrieve.selectStudent = function (s) {
		return new Promise(function (resolve, reject) {
			ensureLoggedIn().then(get, reject);

			function get () {
				$.ajax(Retrieve.STUDENT_PICKER_URL, {
					type: 'POST',
					data: {
						'studentId': s.studentId,
						'url': Retrieve.HOME_VIEW_URL}})
					.done(function (data) {
						if (!Validate.postLogin(data)) {
							reject(new Error('Invalid page'));
							return;
						}

						student = s.name;
						resolve();
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

	Retrieve.declareLoggedInStudentName = function (name) {
		student = name;
	}

	return Retrieve;

})(Retrieve || {});