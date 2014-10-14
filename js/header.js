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
					chrome.extension.sendMessage({type: 'storeSet', method: 'setStudents', data: [students]}, function () {
						readyToSaveAssignmentData();
					});

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
				readyToSaveAssignmentData();
			}
		}

		// qHAC login process has already been completed, but we don't know if this is the account
		// that is logged into qHAC
		else {
			// only declare that the user is logged in if the account name matches what's in Store
			chrome.extension.sendMessage({type: 'storeGet', method: 'getAccountName'}, function (name) {
				if (name === accountName) {
					readyToSaveAssignmentData();
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
	var assignments, markingPeriod,
		dataLoaded = false,
		readyToSave = false;

	var callback = function (asgs, mp) {
		assignments = asgs;
		markingPeriod = mp;
		dataLoaded = true;
		if (readyToSave)
			readyToSaveAssignmentData();
		callback = function () {}
	}

	// If when we started loading this page, we were at state 2, we would have
	// to load the student picker before we can get the student ID of the student
	// whose grades we want to save. (This is required to identify the grades
	// inside localStorage.) Thus, to avoid a race condition where we cannot
	// save the assignment data due to the student picker not having been loaded,
	// we need to make a second callback that is called after page load when we
	// can ensure that the student list will be in Store. When both callbacks
	// have been called, we can save our assignment data.
	window.readyToSaveAssignmentData = function () {
		readyToSave = true;
		if (!dataLoaded)
			return;

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

		window.readyToSaveAssignmentData = function () {}
	}

	return function (assignments, markingPeriod) {
		callback(assignments, markingPeriod);
	}
})();