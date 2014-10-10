/** @jsx React.DOM */
// dependencies: React

'use strict';

var StudentPicker = (function (StudentPicker, undefined) {

	var Student = StudentPicker.Student = React.createClass({
		displayName: 'Student',
		submit: function () {
			this.props.submitFn(this.props.student);
		},
		render: function () {
			return (
				<input type="button" onClick={this.submit} value={this.props.student.name} />
			)
		}
	})
	
	var Picker = StudentPicker.Picker = React.createClass({
		displayName: 'Picker',
		render: function () {
			var submitFn = this.props.submitFn,
				students = this.props.students;

			return (
				<div className="q-student-picker">
					<h2>Pick student</h2>
					<p>Which student should QuickHAC display grades for?</p>
					<div className="q-picker-list">
						{students.map(function (student) {
							return (
								<Student submitFn={submitFn} student={student} />
							)
						})}
						<Student submitFn={submitFn} student={{name: '$All', studentId: "all"}} />
					</div>
				</div>
			)
		}
	})

	return StudentPicker;
})(StudentPicker || {});