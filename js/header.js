// dependencies: jQuery, RetrieveUtils, React

'use strict';

$(function() {
	// add font awesome lock icon to logoff button
	$('.sg-menu-element-logoff > a').addClass('fa icon-lock');

	// replace navbar images with font awesome icons
	var icons = ['icon-home', 'icon-calendar', 'icon-book', 'icon-bar-chart', 'icon-edit'];
	var navItems = $('.sg-hac-menu-options > div');
	for (var i = 0; i < 5; i++) {
		var currItem = navItems.eq(i);
		var currImage = currItem.children('img');
		currImage.after('<i class="fa ' + icons[i] + '"></i>');
		currImage.remove();
	}

	// rename 'Grades' nav menu item to 'Reports' for clarity
	$('#hac-Grades span').text('Reports');

	// add extension cred to footer
	$('.sg-hac-copyright').html('© 2014 SunGard K-12 Education. Enhanced with QuickHAC.<br>QuickHAC is not affiliated with Round Rock ISD or SunGard.');

	Retrieve.declareLoggedIn(); // don't worry about auth, we're on a page

	chrome.extension.sendMessage({type: 'storeGet', method: 'getState'}, function (state) {
		var accountName = RetrieveUtils.getAccountName(document.body),
			pickerContainer;

		if (state === '1') {
			// complete the login process
			state = '2';
			chrome.extension.sendMessage({type: 'storeSet', method: 'setAccountName', data: [accountName]});
			chrome.extension.sendMessage({type: 'storeSet', method: 'setState', data: [state]});
			chrome.extension.sendMessage({type: 'declareLoggedIn'});
		}

		// we can either continue from state 1, or, if the credentials were confirmed
		// but the user has not selected a student to display, we can start from state 2
		if (state === '2') {
			// set state based on presence of student picker
			if (RetrieveUtils.hasPicker(document.body)) {
				// prepare container to store the student picker
				pickerContainer = document.createElement('div');
				pickerContainer.classList.add('q-picker', 'unrendered');
				
				$(document.body).prepend(pickerContainer);

				Retrieve.studentPicker().then(function (students) {
					// save data
					chrome.extension.sendMessage({type: 'declareLoggedIn'});
					chrome.extension.sendMessage({type: 'storeSet', method: 'setStudents', data: [students]});

					// render the student picker
					React.renderComponent(StudentPicker.Picker({
						students: students,
						submitFn: select
					}), pickerContainer, function () {
						window.setTimeout(function () {
							pickerContainer.classList.remove('unrendered');
						}, 250);
					})
				}, function (err) {
					alert('Something went wrong in QuickHAC! ' + err.message);
					debugger;
				});
			} else {
				// if there is no student picker, complete login and use some special values
				chrome.extension.sendMessage({type: 'storeSet', method: 'setState', data: ['3']});
				chrome.extension.sendMessage({type: 'storeSet', method: 'setStudents', data: [[]]});
				chrome.extension.sendMessage({type: 'storeSet', method: 'setStudent', data: [
					{name: RetrieveUtils.getSelectedStudent(document.body), studentId: 'default'}]});
			}
		}

		// qHAC login process has already been completed, but we don't know if this is the account
		// that is logged into qHAC
		else {
			// only declare that the user is logged in if the account name matches what's in Store
			chrome.extension.sendMessage({type: 'storeGet', method: 'getAccountName'}, function (name) {
				if (name === accountName) {
					chrome.extension.sendMessage({type: 'declareLoggedIn'});
					// declare the currently logged in student name if we are
					// logged into the right account
					chrome.extension.sendMessage({type: 'declareLoggedInStudentName',
						data: RetrieveUtils.getSelectedStudent(document.body)});
				} else {
					chrome.extension.sendMessage({type: 'declareLoggedOut'});
				}	
			})
		}})

	// select a student; save it and set state accordingly
	function select (student) {
		// save data
		chrome.extension.sendMessage({type: 'storeSet', method: 'setStudent', data: [student]});
		chrome.extension.sendMessage({type: 'storeSet', method: 'setState', data: ['3']});

		// remove modal
		$('.q-picker').get(0).classList.add('unrendered');
		window.setTimeout(function () { // fadeout
			$('.q-picker').remove();
		}, 200);
	}

	// make sure background updates don't interfere with the user's session
	chrome.extension.sendMessage({type: 'delayUpdate'});
	
});

// let an iframe on the page save the assignment data to Store through this page;
// we need to get the id of the student by parsing this page before we can know
// where to save the assignments
// The assignment data can only be saved once per page load, since the user may
// navigate to different marking periods after loading the page, but we don't
// necessarily want to store all of that information.
var saveAssignmentData = (function () {
	var callback = function (assignments, markingPeriod) {
		var hasPicker = RetrieveUtils.hasPicker(document.body),
			selectedStudent = RetrieveUtils.getSelectedStudent(document.body);

		// if there are multiple students under the logged in account, we need to find the right
		// student ID to save the assignment under
		if (hasPicker) {
			chrome.extension.sendMessage({type: 'storeGet', method: 'getStudents'}, function (students) {
				var studentId = students.filter(function (s) { return s.name === selectedStudent; })[0].studentId;
				chrome.extension.sendMessage({type: 'storeSet', method: 'setAssignments',
					data: [assignments, markingPeriod, studentId]});
			});
		} else {
			chrome.extension.sendMessage({type: 'storeSet', method: 'setAssignments',
				data: [assignments, markingPeriod, 'default']});
		}

		callback = function () {}
	}

	return function (assignments, markingPeriod) {
		callback(assignments, markingPeriod);
	}
})();