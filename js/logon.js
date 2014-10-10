'use strict';

$(function() {
	// put extension credit in header
	$('.sg-banner .sg-banner-info-container > .sg-banner-text')
		.html('Home Access Center<br><span id="ext-cred">enhanced with QuickHAC</span>');

	// add disclaimer in footer
	$(document.body).append('<div id="qhac-disclaimer">QuickHAC is not affiliated with Round Rock ISD or SunGard. You are seeing this enhanced page because you have the QuickHAC extension for Chrome.</div>');

	// replace lock image with the font awesome equivalent
	var lockImage = $('.sg-container > .sg-header > .sg-header-heading > img');
	lockImage.after('<i class="icon-lock"></i>');
	lockImage.remove();

	// add placeholders for login form elements
	var inputs = $('input.sg-logon-right');
	inputs.eq(0).attr('placeholder', 'Username');
	inputs.eq(1).attr('placeholder', 'Password');

	// add 'save credentials' button
	inputs.last().after(
		'<div id="qhac-save-wrapper">' +
			'<input type="checkbox" id="qhac-save">' +
			'<label for="qhac-save">Save information in QuickHAC</label>' +
		'</div>');

	// add 'Log in to $ACCOUNT' if logged in
	if (parseInt(Store.getState()) >= 2) {
		$('.sg-logon-button').after(
			$('<button class="sg-button sg-logon-button q-logon">' +
				'<span class="ui-button-text">' +
					'Login to "' + Store.getCredentials().username + '"' +
				'</span>' +
			'</button>').click(function () {
				var credentials = Store.getCredentials();
				$('#qhac-save').prop('checked', false);
				$('#LogOnDetails_UserName').val(credentials.username);
				$('#LogOnDetails_Password').val(credentials.password);
				$('form').submit();
			}));
	}

	// hook onto login button to save information
	$('form').submit(function (e) {
		if (!$('#qhac-save').prop('checked')) {
			return true;
		} else {
			var username = $('#LogOnDetails_UserName').val(),
				password = $('#LogOnDetails_Password').val();
			
			Store.setCredentials(username, password);
			Store.setState('1');

			return true;
		}
	});

	// delete credentials if login attempt failed
	var $errors = $('.validation-summary-errors');
	if (	$errors.length &&
			$errors.children('span').text().indexOf('unsuccessful') !== -1 &&
			Store.getCredentials().username === $('#LogOnDetails_UserName').val() &&
			Store.getState() === '1') {
		Store.clearCredentials();
		Store.setState('0');
	}
});