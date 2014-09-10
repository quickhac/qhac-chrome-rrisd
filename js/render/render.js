/** @jsx React.DOM */

// dependencies: React, RenderUtils

var Renderer = (function(Renderer, undefined) {
	
	var AssignmentRow = Renderer.AssignmentRow = React.createClass({
		displayName: 'AssignmentRow',
		render: function () {
			var asg = this.props.assignment;
			return (
				React.DOM.tr({class: "assignment", className: "assignmentRow"}, 
					React.DOM.td({class: "name", ref: "name"}, asg.name), 
					React.DOM.td({class: "due", ref: "due"}, RenderUtils.relativeDate(asg.date_due)), 
					React.DOM.td({class: "grade", ref: "grade"}, asg.score)
				)
			)
		}
	});

	var CategoryCard = Renderer.CategoryCard = React.createClass({
		displayName: 'CategoryCard',
		render: function () {
			var cat = this.props.category;
			return (
				React.DOM.div({class: "category", className: true}, 
					React.DOM.h1(null, cat.name), 
					React.DOM.div({class: "average"}, cat.percent), 
					React.DOM.table({class: "assignments"}, 
						React.DOM.tr({class: "header"}, 
							React.DOM.th({class: "name"}, "Assignment"), 
							React.DOM.th({class: "due"}, "Date Due"), 
							React.DOM.th({class: "grade"}, "Grade")
						), 
						cat.assignments.map(function (asg) {
							return AssignmentRow({assignment: asg})
						})
					)
				)
			)
		}
	});

	var CourseView = Renderer.CourseView = React.createClass({
		displayName: 'CourseView',
		render: function () {
			var course = this.props.course;
			return (
				React.DOM.div({class: "course"}, 
					course.categories.map(function (cat) {
						return CategoryCard({category: cat})
					})
				)
			)
		}
	});

	return Renderer;
	
})(Renderer || {});