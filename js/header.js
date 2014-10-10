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
					{name: RetrieveUtils.getSelectedStudent(document.body), studentId: 'none'}]});
			}
		}

		// qHAC login process has already been completed, but we don't know if this is the account
		// that is logged into qHAC
		else {
			// only declare that the user is logged in if the account name matches what's in Store
			chrome.extension.sendMessage({type: 'storeGet', method: 'getAccountName'}, function (name) {
				if (name === accountName) {
					chrome.extension.sendMessage({type: 'declareLoggedIn'});
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

	chrome.extension.sendMessage({type: 'delayUpdate'});
	
});