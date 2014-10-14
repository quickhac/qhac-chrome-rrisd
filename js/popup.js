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
			assignments: Store.getAssignments(student.studentId)
		}
	}

	if (Store.getState() != '3')
		return;

	// Load the students from Store
	var storedStudent = Store.getStudent(), students;
	if (storedStudent.studentId === 'all') {
		students = Store.getStudents().map(extendStudent);
	} else {
		students = [extendStudent(storedStudent)];
	}

	// If none of the students have any grade data associated with them, don't
	// bother displaying anything.
	for (var i = 0; i < students.length; i++) {
		if (students[i].assignments != null)
			break;
	}

	if (i === students.length)
		return;

	// Render the sidebar and the recents view
	React.renderComponent(Popup.Sidebar({
		students: students
	}), document.getElementById('sidebar'));
	React.renderComponent(Popup.Recents({
		students: students
	}), document.getElementById('main'));
});