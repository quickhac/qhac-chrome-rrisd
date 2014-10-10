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

	var state = Store.getState(),
		accountName = RetrieveUtils.getAccountName(document.body),
		pickerContainer;

	Retrieve.declareLoggedIn(); // don't worry about auth, we're on a page

	if (state === '1') {
		// complete the login process
		Store.setAccountName(accountName);
		chrome.runtime.sendMessage({type: 'declareLoggedOut'});
		Store.setState(state = '2'); // continue
	}

	// we can either continue from state 1, or, if the credentials were confirmed
	// but the user has not selected a student to display, we can start from state 2
	if (state === '2') {
		// set state based on presence of student picker
		if (RetrieveUtils.hasPicker(document.body)) {
			Store.setState('2');

			// prepare container to store the student picker
			pickerContainer = document.createElement('div');
			pickerContainer.classList.add('q-picker', 'unrendered');
			
			$(document.body).prepend(pickerContainer);

			// render the student picker
			Retrieve.studentPicker().then(function (students) {
				chrome.runtime.sendMessage({type: 'declareLoggedIn'});
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
			Store.setState('3');
		}
	} else {
		// only declare that the user is logged in if the account name
		// matches what's in Store
		if (Store.getAccountName() === accountName) {
			chrome.runtime.sendMessage({type: 'declareLoggedIn'});
		} else {
			chrome.runtime.sendMessage({type: 'declareLoggedOut'});
		}
	}

	// select a student; save it and set state accordingly
	function select (student) {
		Store.setStudent(student);
		Store.setState('3');
		$('.q-picker').get(0).classList.add('unrendered');
		window.setTimeout(function () { // fadeout
			$('.q-picker').remove();
		}, 200);
	}

	
});