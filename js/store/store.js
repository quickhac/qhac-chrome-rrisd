// dependencies: none

'use strict';

// Crypt is short for CRappY encryPTion. Not really, but that's basically what
// this is: 2x Base64+ROT13. It's not by any means strong, but it should be
// be enough to at least stall the average script kiddie in their quest to
// get somebody's login information.
var Crypt = (function (Crypt, undefined) {

	function rot13 (str) {
		return str.replace(/[a-zA-Z]/g, function(c){
			return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
		});
	}

	Crypt.encrypt = function (str) {
		return btoa(rot13(btoa(rot13(str))));
	}

	Crypt.decrypt = function (str) {
		return rot13(atob(rot13(atob(str))));
	}

	return Crypt;

})(Crypt || {});

// Store currently stores all user data in the extension's localStorage. To
// access the Store from an injected script, you have to use the message passing
// APIs defined in ../background.js. (See ../logon.js or ../header.js for
// examples of message passing.) This is because the localStorage on those pages
// with injected scripts will only be able to access the localStorage of the
// site instead of the extension. Extenstion pages such as ../html/options.html
// and ../html/background.html are able to import Store and access the storage
// directly.
var Store = (function (Store, undefined) {

	var DEFAULT_OPTIONS = {
		notifications: true,
		notificationInterval: 60
	};

	// possible states:
	//     0: not logged in
	//     1: unconfirmed credentials
	//     2: needs select student
	//     3: logged in
	if (localStorage.getItem('state') == null) {
		localStorage.setItem('state', '0');
	}

	Store.setCredentials = function (username, password) {
		localStorage.setItem('credentials',
			Crypt.encrypt(JSON.stringify({
				username: Crypt.encrypt(username),
				password: Crypt.encrypt(password) })));
	}

	Store.getCredentials = function () {
		var c = localStorage.getItem('credentials');
		if (c == null) return null;
		c = JSON.parse(Crypt.decrypt(c));
		return {
			username: Crypt.decrypt(c.username),
			password: Crypt.decrypt(c.password)
		}
	}

	Store.setAccountName = function (name) {
		localStorage.setItem('accountName', name);
	}

	Store.getAccountName = function () {
		return localStorage.getItem('accountName');
	}

	Store.clearCredentials = function () {
		localStorage.removeItem('credentials');
	}

	Store.setStudents = function (students) {
		localStorage.setItem('students', JSON.stringify(students));
	}

	Store.getStudents = function () {
		return JSON.parse(localStorage.getItem('students'));
	}

	Store.setStudent = function (student) {
		localStorage.setItem('student', JSON.stringify(student));
	}

	Store.getStudent = function () {
		return JSON.parse(localStorage.getItem('student'));
	}

	Store.setAssignments = function (data, markingPeriod, studentId) {
		localStorage.setItem('assignments-' + studentId, JSON.stringify(data));
		localStorage.setItem('markingPeriod-' + studentId, markingPeriod);
		localStorage.setItem('lastUpdated-' + studentId, +new Date);
	}

	Store.getAssignments = function (studentId) {
		return JSON.parse(localStorage.getItem('assignments-' + studentId));
	}

	Store.getMarkingPeriod = function (studentId) {
		return localStorage.getItem('markingPeriod-' + studentId);
	}

	Store.getLastUpdated = function (studentId) {
		return localStorage.getItem('lastUpdated-' + studentId);
	}

	Store.setState = function (state) {
		localStorage.setItem('state', state);
	}

	Store.getState = function () {
		return localStorage.getItem('state');
	}

	Store.setOptions = function (options) {
		localStorage.setItem('options', JSON.stringify(options));
	}

	Store.setOptionProp = function () {
		var opts = Store.getOptions();
		[].slice.call(arguments).forEach(function (kv) {
			opts[kv[0]] = kv[1];
		});
		Store.setOptions(opts);
	}

	Store.getOptions = function () {
		var storedOpts = localStorage.getItem('options');
		return JSON.parse(storedOpts) || DEFAULT_OPTIONS;
	}

	Store.logout = function () {
		localStorage.clear(); // ah screw it there are too many things
	}
	
	return Store;

})(Store || {});