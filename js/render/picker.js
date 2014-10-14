/** @jsx React.DOM */
// dependencies: React

'use strict';

var StudentPicker = (function (StudentPicker, undefined) {

	var Student = StudentPicker.Student = React.createClass({
		displayName: 'Student',
		submit: function () {
			var student = this.props.student;
			if (student.studentId === 'all')
				this.props.submitFn({name: '$All', studentId: 'all'});
			else
				this.props.submitFn(this.props.student);
		},
		render: function () {
			return (
				React.DOM.input({type: "button", onClick: this.submit, value: this.props.student.name})
			)
		}
	})
	
	var Picker = StudentPicker.Picker = React.createClass({
		displayName: 'Picker',
		render: function () {
			var submitFn = this.props.submitFn,
				students = this.props.students;

			return (
				React.DOM.div({className: "q-student-picker"}, 
					React.DOM.h2(null, "Pick student"), 
					React.DOM.p(null, "Which student should QuickHAC display grades for?"), 
					React.DOM.div({className: "q-picker-list"}, 
						students.map(function (student) {
							return (
								Student({submitFn: submitFn, student: student})
							)
						}), 
						Student({submitFn: submitFn, student: {name: 'All', studentId: "all"}})
					)
				)
			)
		}
	})

	return StudentPicker;
})(StudentPicker || {});