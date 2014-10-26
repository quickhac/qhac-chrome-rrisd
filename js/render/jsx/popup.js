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
				<div className="recents course-view">
					<div className="header">
						<div className="vert">
							<h1>Recent Grades</h1>
						</div>
					</div>
					{studentAsgs.map(function (assignments) {
						return (
							<div className="category">
								<div className="card-title">
									<h2>{assignments.student.name}</h2>
								</div>
								<div className="updated"><span>{RenderUtils.relativeDate(parseInt(assignments.student.lastUpdated), 'Updated ', '', true)}</span></div>
								<table className="assignments">
									<thead>
										<tr>
											<th>Assignment</th>
											<th>Due</th>
											<th>Grade</th>
										</tr>
									</thead>
									<tbody>
										{assignments.map(function (asg) {
											return (
												<tr className="assignment" title={asg.course.name + ": " + asg.category.name}>
													<td className="name">{asg.assignment.name}</td>
													<td className="due">{RenderUtils.relativeDate(asg.assignment.date_due)}</td>
													<td className="grade">
														<span className="score">{RenderUtils.showMaybeNumOrString(asg.assignment.score)}</span>
														<span className="aside">{CourseView.showScoreAside(asg)}</span>
													</td>
												</tr>
											)
										})}
									</tbody>
								</table>
							</div>
						)
					})}
				</div>
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
				<div>
					<div className={"recent-select" + (currMainView === "$Recents" ? " selected" : "")}
							onClick={this.renderRecents().bind(this)}>
						Recent Grades
					</div>
					{students.map((function (student) {
						assignments = student.assignments || [];
						return (
							<div className="student-section">
								<h2>{student.name} (MP{student.markingPeriod})</h2>
								{assignments.map((function (course) {
									return (
										<div className={"course-select" + (currMainView === course ? " selected" : "")}
												onClick={this.renderCourseView(course).bind(this)}>
											<div className="name">{course.name}</div>
											<div className="grade">{RenderUtils.showMaybeNum(course.grade)}</div>
										</div>
									)
								}).bind(this))}
							</div>
						)
					}).bind(this))}
				</div>
			)
		}
	})

	return Popup;

})(Popup || {});