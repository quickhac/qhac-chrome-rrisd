/** @jsx React.DOM */
// dependencies: Store, React

'use strict';

var Options = (function (Options, undefined) {
	
	// props:
	//     student: selected student
	//     students: selectable students
	//     notifications: T/F notifications enabled or not
	//     notificationInterval: # in minutes between background updates
	//     logout: function
	//     saveStudentOpts: function (selectedStudent)
	//     saveNotifOpts: function ({notifications, notificationInterval})
	Options.OptionForm = React.createClass({
		displayName: 'OptionForm',
		getInitialState: function () {
			return {
				student: this.props.student,
				studentOptsChanged: false,
				notifications: this.props.notifications,
				notificationInterval: this.props.notificationInterval,
				notifOptsChanged: false
			}
		},
		findStudent: function (studentId) {
			if (studentId === 'all')
				return {
					name: '$All',
					studentId: 'all'
				}
			else
				return this.props.students.filter(function (s) {
					return s.studentId === studentId;
				})[0];
		},
		handleStudentSelect: function (event) {
			if (event.target.checked) {
				this.setState({student: this.findStudent(event.target.value),
				               studentOptsChanged: true});
			}
		},
		handleNotificationEnabledToggle: function (event) {
			this.setState({notifications: event.target.checked,
			               notifOptsChanged: true});
		},
		handleNotificationIntervalChange: function (event) {
			var interval = parseInt(event.target.value);
			this.setState({notificationInterval: interval,
			               notifOptsChanged: true});
		},
		handleSaveStudentOpts: function (event) {
			// ...
		},
		handleSaveNotifOpts: function (event) {
			// ...
		},
		render: function () {
			var students = this.props.students;

			return (
				<div className="wrapper">
					{(function () {
						if (students.length) {
							return (
								<div className="panel">
									<button className={"save-opts" + (this.state.studentOptsChanged ? "" : " hidden")}
										onClick={this.handleSaveStudentOpts}>Save</button>
									<h2>Student</h2>
									<p className="sub">QuickHAC can display grades for just you if you are a student, or every student if you are a parent.</p>

									<div className="option">
										{students.map((function (student) {
											return (
												<div>
													<input type="radio" value={student.studentId}
														id={"opt-student-" + student.studentId}
														name={"opt-student"}
														key={"opt-student-" + student.studentId}
														ref={"student- " + student.studentId}
														checked={this.state.student.name === student.name}
														onChange={this.handleStudentSelect} />
													<label htmlFor={"opt-student-" + student.studentId}>{student.name}</label>
												</div>);
										}).bind(this))}
										<div>
											<input type="radio" value="all"
												id={"opt-student-all"}
												name={"opt-student"}
												ref={"student-all"}
												checked={this.state.student.name === '$All'}
												onChange={this.handleStudentSelect} />
											<label htmlFor="opt-student-all">All</label>
										</div>
									</div>
								</div>
							)
						} else return null;
					}).bind(this)()}

					<div className="panel">
						<button className={"save-opts" + (this.state.notifOptsChanged ? "" : " hidden")}
							onClick={this.handleSaveNotifOpts}>Save</button>
						<h2>Notifications</h2>
						<p className="sub">QuickHAC will periodically check HAC in the background and alert you if you have any new grades.</p>

						<div className="option">
							<input type="checkbox" id="notif-enable" name="notif-enable"
								checked={this.state.notifications} onChange={this.handleNotificationEnabledToggle} />
							<label htmlFor="notif-enable">Enable notifications</label>
						</div>

						<div className="option">
							<h3>Notification interval</h3>
							<p className="sub">How often should QuickHAC update grades from HAC?</p>
							<div className="fullwidth">
								<input type="range" name="notif-interval" min="15" max="360" step="15"
									value={this.state.notificationInterval} onChange={this.handleNotificationIntervalChange} />
								<label>Every {this.state.notificationInterval} minutes</label>
							</div>
						</div>
					</div>

					<div className="panel">
						<h2>Logout</h2>
						<p className="sub">Logging out of QuickHAC will delete all of your stored data, including login credentials and grades.</p>

						<div className="option">
							<button className="logout" onClick={this.props.logout}>Logout</button>
						</div>
					</div>
				</div>)
		}
	});

	return Options;

})(Options || {});