// dependencies: jQuery, React, render/Options

'use strict';

$(function () {
	var options = Store.getOptions(),
		students = Store.getStudents(),
		student = Store.getStudent();

	React.renderComponent(Options.OptionForm({
		students: students,
		student: student,
		notifications: options.notifications,
		notificationInterval: options.notificationInterval
	}), $('#settings').get(0));

	$('#version').text("QuickHAC version " + chrome.runtime.getManifest().version);
})