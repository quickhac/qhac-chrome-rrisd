'use strict';

var Update = (function (Update, undefined) {

	var ALARM_NAME = "q_bg_update",
		FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

	/**
	 * Initializes the alarm by reading the options from Store.
	 */
	Update.initAlarm = function (delay) {
		var options = Store.getOptions();
		delay = delay || options.notificationInterval;
		
		// Clear any previous alarms that may have been set.
		chrome.alarms.clear(ALARM_NAME, function () {
			// After clearing alarms, create a new alarm based on the information
			// stored in the options.
			if (options.notifications) {
				chrome.alarms.create(ALARM_NAME, {
					delayInMinutes: delay,
					periodInMinutes: options.notificationInterval
				});
			}
		})
	}

	/**
	 * If the background update is scheduled to run within 5 minutes of now,
	 * reschedule it to run five minutes from now; this is useful for avoiding
	 * messing with the user's current session on HAC if they are using the
	 * district's web interface.
	 */
	Update.delayUpdate = function () {
		chrome.alarms.get(ALARM_NAME, function (alarm) {
			// Reschedule the alarm if it is within five minutes of now
			if (alarm == null || alarm.scheduledTime - +new Date < FIVE_MINUTES_IN_MS) {
				Update.initAlarm(5);
			}
		})
	}

	// Run the update callback when the update alarm is fired.
	chrome.alarms.onAlarm.addListener(function (alarm) {
		if (alarm.name === ALARM_NAME) {
			update();
		}
	})

	// The update callback, which loads grades from the server.
	function update () {
		var studentsInStore = Store.getStudent();
		if (studentsInStore.studentId === 'default') {
			// There is only one student under the account if Store.getStudent()
			// returns `[]`; thus, we don't have to check for selecting the
			// right student.
			updateStudent(studentsInStore, false);
		} else {
			// The account has multiple students; we must select the right
			// student before updating.
			if (studentsInStore.studentId === 'all')
				iterativelyUpdateStudents(Store.getStudents());
			else
				updateStudent(studentsInStore, false);
		}
	}

	/**
	 * Update students one by one, waiting for the current update to finish
	 * before starting the next one.
	 */
	function iterativelyUpdateStudents (students) {
		var i = 0;
		updateNext();

		function updateNext () {
			Retrieve.ensureStudentSelected(students[i]).then(function () {
				return Retrieve.assignments();
			}, fail).then(function () {
				return updateStudent(students[i], true);
			}, fail).then(function () {
				i++;
				if (i < students.length) {
					updateNext();
				}
			});
		}
	}

	/**
	 * Perform a background update for one student, assuming that the student
	 * is the currently logged in student on the account. The `hasMultipleAccounts`
	 * boolean parameter is passed to the `notify` function, slightly modifying
	 * the notification text displayed to the user.
	 */
	function updateStudent (student, hasMultipleStudents) {
		Retrieve.assignments().then(function (data) {
			// Only get the information we need: courses and marking period info
			var courses = data.courses,
				mpInfo = data.mpInfo;

			var newGrades = Compare.compare(student, courses, mpInfo);
			Notify.notifyNewGrades(student, newGrades, hasMultipleStudents);
			Store.setAssignments(courses, mpInfo[0], student.studentId);
		}, fail)
	}

	// If some part of the background update fails, print a debug message to the console.
	function fail (e) {
		debugger;
		console.log("Something went wrong while doing the background update: ");
		console.log(e.message);
		console.log(e.stack);
	}

	Update.initAlarm(1);

	return Update;

})(Update || {});

var Notify = (function (Notify, undefined) {

	Notify.notifyNewGrades = function (student, grades, hasMultipleStudents) {
		var options = {iconUrl: '../assets/icon128.png'};

		if (hasMultipleStudents)
			options.title = "New grades for " + student.name;
		else
			options.title = "New grades";

		// Don't bother showing notifications if there aren't any changes.
		if (grades == undefined || grades.length === 0) {
			return;
		}

		// Show detailed information if there is only one course.
		else if (grades.length === 1) {
			options.type = 'basic';
			options.message = 'Your grade in ' + grades[0].name + ' is now ' + grades[0].grade;
		}

		// Show a multi-item notification if there are multiple courses.
		else {
			options.type = 'list';
			options.message = 'Your grade has changed in ' + grades.length + ' courses.';
			options.items = [];
			grades.forEach(function (course) {
				options.items.push({
					title: course.name,
					message: course.grade.toString()
				});
			});
		}

		chrome.notifications.create('', options, function () {});
	}
	
	return Notify;

})(Notify || {});

var Compare = (function (Compare, undefined) {

	/**
	 * Returns all of the courses in `newCourses` that have been updated since
	 * what is in Store.getAssignments(student.studentId)
	 */
	Compare.compare = function (student, newCourses, mpInfo) {
		var oldMP = Store.getMarkingPeriod(student.studentId);
		if (oldMP == null) {
			return; // Probably the first save of the assignments; don't show updates
		} else if (oldMP === mpInfo[0]) {
			return getDifferences(newCourses, Store.getAssignments(student.studentId));
		} else {
			// If the stored assignments are from a different marking period,
			// return all of the nonempty courses, since they are all new to us.
			return getAllNonemptyCourses(newCourses);
		}
	}

	function getDifferences(newCourses, oldCourses) {
		// Since we want to compare the courses in O(n) time but still
		// account for courses that don't match (maybe the student added
		// a course or dropped a course), we will keep an array of courses
		// where the course in `newCourses` doesn't match the corresponding
		// course in `oldCourses`. When we find two courses that don't match,
		// we will add the one from `oldCourses` to this array, after which
		// we can compare the course from `newCourses` with every value
		// in the array as well as with the rest of the courses to make
		// sure we get the corresponding course if it exists. This makes
		// our average and best case roughly O(n), while I doubt we will
		// ever see the worst case of O(n^2).
		var unmatchedCourses = [],
			// `changes` stores the changes 
			changes = [], i = 0;

		newCourses.forEach(function (course) {
			if (i >= oldCourses.length) {
				if (course.updated)
					changes.push(course);
				return;
			}

			var oldCourse = oldCourses[i], j;

			// Simple case: courses match up
			if (course.name === oldCourse.name) {
				pushIfChanged();
				i++;
				return;
			}

			// Otherwise, iterate through unmatchedCourses, or if that fails,
			// through every course.
			else {
				unmatchedCourses.push(oldCourse);

				for (j = unmatchedCourses.length - 2; j >= 0; j++) {
					oldCourse = unmatchedCourses[j];
					if (course.name === oldCourse.name) {
						pushIfChanged();
						return;
					}
				}

				for (j = i + 1; j < oldCourses.length; j++) {
					oldCourse = unmatchedCourses[j];
					if (course.name === oldCourse.name) {
						pushIfChanged();
						return;
					}
				}

				// If a matching course is not found, assume that it is new.
				courses.push(course);
			}

			function pushIfChanged () {
				if (course.updated > oldCourse.updated) {
					changes.push(course);
				}
			}
		});

		return changes;
	}

	function getAllNonemptyCourses (newCourses) {
		var courses = [];
		newCourses.forEach(function (course) {
			if (course.updated)
				courses.push(course);
		});
		return courses;
	}

	return Compare;

})(Compare || {});

// Listen for messages from other pages and injected scripts to get and set data
// as well as modify the persistent state of the extension.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	switch (request.type) {
		// usage: { type: 'declareLoggedIn' }
		// returns: true
		case 'declareLoggedIn':
			Retrieve.declareLoggedIn();
			sendResponse(true);
			break;

		// usage: { type: 'declareLoggedOut' }
		// returns: true
		case 'declareLoggedOut':
			Retrieve.declareLoggedOut();
			sendResponse(true);
			break;
		// usage: { type: 'declareLoggedInStudentName', data: {string}}
		// returns: true

		case 'declareLoggedInStudentName':
			Retrieve.declareLoggedInStudentName(request.data);
			sendResponse(true);
			break;

		// usage: { type: 'delayUpdate' }
		// returns: true
		// If the extension is about to do a background update within the next
		// few minutes, this will make it update later. This is desirable when
		// the user is currently interacting with Home Access Center using the
		// web interface; doing a background update might log the user out or
		// mess with the user's session if they are checking grades for an
		// account other than the one that's logged into QuickHAC.
		case 'delayUpdate':
			Update.delayUpdate();
			sendResponse(true);
			break;

		// usage: { type: 'saveAssignments',
		//          studentId: studentId,
		//          assignments: [courses],
		//          markingPeriod: {number} }
		// Saves the assignments to store, but not before displaying any necessary
		// notifications first.
		case 'saveAssignments':
			var student;
			if (request.studentId === 'default')
				student = Store.getStudent();
			else
				student = Store.getStudents().filter(function (s) {
					return s.studentId === request.studentId;
				})[0];

			var newGrades = Compare.compare(
				student, request.assignments, [request.markingPeriod]);

			Notify.notifyNewGrades(
				student, newGrades, request.studentId !== 'default');

			Store.setAssignments(
				request.assignments, request.markingPeriod, request.studentId);
			break;

		// usage: { type: 'storeGet', method: {string} }
		// Calls the method with the specified name on Store and returns
		// whatever Store returns.
		case 'storeGet':
			sendResponse(Store[request.method]());
			break;

		// usage: { type: 'storeSet', method: {string}, data: {any[]} }
		// Calls the method with the specified name and the specified arguments
		// in an array using apply().
		// returns: true
		case 'storeSet':
			Store[request.method].apply(null, request.data);
			sendResponse(true);
			break;

		// usage: { type: 'initAlarm' }
		// Forces the background updater to reload alarm settings from Store.
		case 'initAlarm':
			Update.initAlarm();
			sendResponse(true);
			break;

		// usage: { type: 'createTab', url: {string}}
		// Opens a new tab to the specified URL. This is useful because injected
		// scripts cannot access the chrome.tabs API.
		case 'createTab':
			chrome.tabs.create({url: chrome.extension.getURL(request.url)});
			sendResponse(true);
			break;

		// usage: { type: 'logout' }
		// Deletes all stored user information from Store and the current
		// QuickHAC background state.
		// returns: true
		case 'logout':
			Retrieve.declareLoggedOut();
			Retrieve.setCredentials(undefined, undefined);
			sendResponse(true);
			break;

		// If the message type requested is not implemented, don't return anything.
		default:
	}
});

// When the background page loads, set the credentials for the background Retrieve object.
(function () {
	var creds = Store.getCredentials();
	Retrieve.setCredentials(creds.username, creds.password);
})();