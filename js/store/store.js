// dependencies: none

'use strict';

// lol
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

var Store = (function (Store, undefined) {

	// init
	if (localStorage.getItem('state') != null) {
		localStorage.setItem('state', '0');
	}

	Store.setCredentials = function (username, password) {
		localStorage.setItem('credentials',
			Crypt.encrypt(JSON.stringify({
				username: Crypt.encrypt(username),
				password: Crypt.encrypt(password) })));
	}

	Store.getCredentials = function () {
		var c = JSON.parse(Crypt.decrypt(localStorage.getItem('credentials')));
		return {
			username: Crypt.decrypt(c.username),
			password: Crypt.decrypt(c.password)
		}
	}

	Store.setStudent = function (student) {
		localStorage.setItem('student', student);
	}

	Store.getStudent = function () {
		return localStorage.getItem('student');
	}

	Store.setAssignments = function (data) {
		localStorage.setItem('assignments', JSON.stringify(data));
	}

	Store.getAssignments = function () {
		return localStorage.getItem('assignments');
	}

	Store.setLoggedInState = function (state) {
		localStorage.setItem('state', state);
	}

	Store.getLoggedInState = function () {
		return localStorage.getItem('state');
	}
	
	return Store;

})(Store || {});