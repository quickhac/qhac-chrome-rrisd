/** @jsx React.DOM */
// dependencies: React, CourseView

var Popup = (function (Popup, undefined) {

	var TWO_WEEKS_IN_MS = 2 * 7 * 24 * 60 * 60 * 1000;

	function strcmp(a, b) {
		if (a === b) return 0;
		if (a < b) return -1;
		if (a > b) return 1;
	}

	function getRecentGrades (students) {
		var studentAsgArr = students.map(function (student) {
			var asgArr = [];
			asgArr.student = student;
			if (student.assignments == null) return asgArr;
			student.assignments.forEach(function (course) {
				course.categories.forEach(function (category) {
					category.assignments.forEach(function (asg) {
						asgArr.push({
							assignment: asg,
							category: category,
							course: course})})})})
			return asgArr;
		});

		var now = new Date();
		return studentAsgArr.map(function (asgArr) {
			var newArr = asgArr.filter(function (asg) {
				return asg.assignment.score != null && // filter out assignments without a scorce
					(now - asg.assignment.date_due <= TWO_WEEKS_IN_MS); // filter >2wk old asgs 
			}).sort(function (a, b) {
				return (b.assignment.date_due - a.assignment.date_due) ||
					strcmp(a.assignment.name, b.assignment.name);
			});

			newArr.student = asgArr.student;
			return newArr;
		});
	}

	// props:
	//     You must pass a `student` array into the props, with each element having the following fields:
	//         name {string}
	//         studentId {string}
	//         markingPeriod {string or number}
	//         assignments {array}
	//         lastUpdated (number)
	//     The wa to do this is to extend the students object from Store.getStudent()/.getStudents().
	// These properties need to be passed to both Sidebar and Recents.

	var Recents = Popup.Recents = React.createClass({
		displayName: 'Recents',
		render: function () {
			var studentAsgs = getRecentGrades(this.props.students);

			return (
				React.DOM.div({className: "recents course-view"}, 
					React.DOM.div({className: "header"}, 
						React.DOM.div({className: "vert"}, 
							React.DOM.h1(null, "Recent Grades")
						)
					), 
					studentAsgs.map(function (assignments) {
						return (
							React.DOM.div({className: "category"}, 
								React.DOM.div({className: "card-title"}, 
									React.DOM.h2(null, assignments.student.name)
								), 
								React.DOM.div({className: "updated"}, React.DOM.span(null, RenderUtils.relativeDate(parseInt(assignments.student.lastUpdated), 'Updated ', '', true))), 
								React.DOM.table({className: "assignments"}, 
									React.DOM.thead(null, 
										React.DOM.tr(null, 
											React.DOM.th(null, "Assignment"), 
											React.DOM.th(null, "Due"), 
											React.DOM.th(null, "Grade")
										)
									), 
									React.DOM.tbody(null, 
										assignments.map(function (asg) {
											return (
												React.DOM.tr({className: "assignment", title: asg.course.name + ": " + asg.category.name}, 
													React.DOM.td({className: "name"}, asg.assignment.name), 
													React.DOM.td({className: "due"}, RenderUtils.relativeDate(asg.assignment.date_due)), 
													React.DOM.td({className: "grade"}, 
														React.DOM.span({className: "score"}, RenderUtils.showMaybeNum(asg.assignment.score)), 
														React.DOM.span({className: "aside"}, CourseView.showScoreAside(asg))
													)
												)
											)
										})
									)
								)
							)
						)
					})
				)
			)
		}
	});

	Popup.Sidebar = React.createClass({
		displayName: 'Sidebar',
		getInitialState: function () {
			return {
				currMainView: '$Recents'
			}
		},
		setViewState: function (name) {
			return function () {
				this.setState({currMainView: name});
			}
		},
		renderCourseView: function (course) {
			var setViewState = this.setViewState(course).bind(this);
			return function () {
				setViewState();
				React.renderComponent(CourseView.CourseView({
					course: course
				}), document.getElementById('main'));
			}
		},
		renderRecents: function () {
			var setViewState = this.setViewState('$Recents').bind(this);
			return function () {
				setViewState();
				React.renderComponent(Recents({
					students: this.props.students
				}), document.getElementById('main'));
			}
		},
		render: function () {
			var students = this.props.students,
				currMainView = this.state.currMainView;

			return (
				React.DOM.div(null, 
					React.DOM.div({className: "recent-select" + (currMainView === "$Recents" ? " selected" : ""), 
							onClick: this.renderRecents().bind(this)}, 
						"Recent Grades"
					), 
					students.map((function (student) {
						assignments = student.assignments || [];
						return (
							React.DOM.div({className: "student-section"}, 
								React.DOM.h2(null, student.name), 
								assignments.map((function (course) {
									return (
										React.DOM.div({className: "course-select" + (currMainView === course ? " selected" : ""), 
												onClick: this.renderCourseView(course).bind(this)}, 
											React.DOM.div({className: "name"}, course.name), 
											React.DOM.div({className: "grade"}, RenderUtils.showMaybeNum(course.grade))
										)
									)
								}).bind(this))
							)
						)
					}).bind(this))
				)
			)
		}
	})

	return Popup;

})(Popup || {});