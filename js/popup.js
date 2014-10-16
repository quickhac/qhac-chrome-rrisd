// dependencies: Moment, React, Store, RenderUtils, Render, Render/Popup

'use strict';

// Adapted from https://github.com/jquery/jquery/blob/master/src/core/ready.js#L70
function onPageLoad (callback) {
	var completed = function () {
		document.removeEventListener('DOMContentLoaded', completed, false);
		window.removeEventListener('load', completed, false);
		callback();
	}

	if (document.readyState === 'complete')
		setTimeout(completed, 1);
	else {
		document.addEventListener('DOMContentLoaded', completed, false);
		window.addEventListener('load', completed, false);
	}
}

onPageLoad(function () {
	// Adds the properties `markingPeriod` and `assignments` to the input student
	// in order to satisfy the requirements for rendering the Popup.
	function extendStudent(student) {
		return {
			name: student.name,
			studentId: student.studentId,
			markingPeriod: Store.getMarkingPeriod(student.studentId),
			assignments: Store.getAssignments(student.studentId),
			lastUpdated: Store.getLastUpdated(student.studentId)
		}
	}

	if (Store.getState() != '3')
		return;

	// Refresh page when the refresh link is clicked.
	document.getElementById('link-refresh').addEventListener('click', function () {
		// The 'updateNow' message will force the background page to update.
		// The background page will send an 'updateComplete' message when the
		// update has been stored in localStorage.
		chrome.extension.sendMessage({type: 'updateNow'});
		document.getElementById('loading').classList.add('visible');
	}, false);

	// Loads information from Store and renders it.
	function render() {
		// Load the students from Store
		var storedStudent = Store.getStudent(), students;
		if (storedStudent.studentId === 'all') {
			students = Store.getStudents().map(extendStudent);
		} else {
			students = [extendStudent(storedStudent)];
		}

		// Render the sidebar and the recents view
		React.renderComponent(Popup.Sidebar({
			students: students
		}), document.getElementById('sidebar'));
		React.renderComponent(Popup.Recents({
			students: students
		}), document.getElementById('main'));
	}

	render();

	// Listens for the 'updateComplete' message and then reloads the information
	// from Store.
	chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.type === 'updateComplete') {
			render();
			document.getElementById('loading').classList.remove('visible');
			sendResponse(true);
		}
	});
});