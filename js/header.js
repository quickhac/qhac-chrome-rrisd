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
});