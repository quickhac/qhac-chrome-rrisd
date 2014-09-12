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
});