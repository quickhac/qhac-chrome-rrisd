// dependencies: jQuery, React, render/Options

'use strict';

$(function () {
	var options = Store.getOptions(),
		students = Store.getStudents(),
		student = Store.getStudent(),
		state = Store.getState();

	// only show the settings if we have saved login data; otherwise, the
	// settings are largely irrelevant.
	if (state === '2' || state === '3') {
		React.renderComponent(Options.OptionForm({
			students: students,
			student: student,
			notifications: options.notifications,
			notificationInterval: options.notificationInterval,
			logout: function (e) {
				Store.logout();
				chrome.extension.sendMessage({type: 'logout'});
				location.reload(); // unshow options by reloading
				return false;
			},
			saveStudentOpts: function (options) {
				Store.setStudent(options.student);
			},
			saveNotifOpts: function (options) {
				Store.setOptionProp(
					['notifications', options.notifications],
					['notificationInterval', options.notificationInterval]);
				chrome.extension.sendMessage({type: 'initAlarm'});
			}
		}), $('#settings').get(0));
	}

	$('#version').text("QuickHAC version " + chrome.runtime.getManifest().version);
})