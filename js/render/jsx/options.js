/** @jsx React.DOM */
// dependencies: Store, React

'use strict';

var Options = (function (Options, undefined) {
	
	Options.OptionForm = React.createClass({
		displayName: 'OptionForm',
		getInitialState: function () {
			return {
				student: this.props.student,
				notifications: this.props.notifications,
				notificationInterval: this.props.notificationInterval
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
				this.setState({student: this.findStudent(event.target.value)});
			}
		},
		handleNotificationEnabledToggle: function (event) {
			this.setState({notifications: event.target.checked});
		},
		handleNotificationIntervalChange: function (event) {
			var interval = parseInt(event.target.value);
			this.setState({notificationInterval: interval});
		},
		render: function () {
			var students = this.props.students;

			return (
				<div className="wrapper">
					<div className="panel">
						<h2>Student</h2>

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

					<div className="panel">
						<h2>Notifications</h2>

						<div className="option">
							<input type="checkbox" id="notif-enable" name="notif-enable"
								checked={this.state.notifications} onChange={this.handleNotificationEnabledToggle} />
							<label htmlFor="notif-enable">Enable notifications</label>
						</div>

						<div className="option">
							<h4>Notification interval</h4>
							<p className="sub">How often should QuickHAC update grades from HAC?</p>
							<input type="range" name="notif-interval" min="15" max="360" step="15"
								value={this.state.notificationInterval} onChange={this.handleNotificationIntervalChange} />
							<label>{this.state.notificationInterval}</label>
						</div>
					</div>
				</div>)
		}
	});

	return Options;

})(Options || {});