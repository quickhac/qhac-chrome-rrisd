/** @jsx React.DOM */

// dependencies: React, RenderUtils

var Renderer = (function(Renderer, undefined) {
	
	var AssignmentRow = Renderer.AssignmentRow = React.createClass({
		displayName: 'AssignmentRow',
		render: function () {
			var asg = this.props.assignment;
			return (
				React.DOM.tr({className: "assignment"}, 
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
				React.DOM.div({className: "category"}, 
					React.DOM.h1(null, cat.name), 
					React.DOM.div({class: "average"}, cat.percent), 
					React.DOM.table({class: "assignments"}, 
						React.DOM.thead(null, 
							React.DOM.tr({class: "header"}, 
								React.DOM.th({class: "name"}, "Assignment"), 
								React.DOM.th({class: "due"}, "Due Date"), 
								React.DOM.th({class: "grade"}, "Grade")
							)
						), 
						React.DOM.tbody(null, 
							cat.assignments.map(function (asg) {
								return AssignmentRow({key: asg.id, assignment: asg})
							})
						)
					)
				)
			)
		}
	});

	var CourseView = Renderer.CourseView = React.createClass({
		displayName: 'CourseView',
		render: function () {
			var course = this.props.course;
			if (course === undefined || course === null)
				return ( React.DOM.div({className: "course-view"}) )

			return (
				React.DOM.div({className: "course-view"}, 
					course.categories.map(function (cat) {
						return CategoryCard({key: cat.id, category: cat})
					})
				)
			)
		}
	});

	var CourseListSidebarItem = Renderer.CourseListSidebarItem = React.createClass({
		displayName: 'CourseListSidebarItem',
		showCourse: function () {
			React.renderComponent(
				CourseView({course: this.props.course}),
				$('.course-view')[0]);
		},
		render: function () {
			var course = this.props.course;
			return (
				React.DOM.div({className: "sidebar-item", onClick: this.showCourse}, 
					React.DOM.div({class: "name"}, course.name), 
					React.DOM.div({class: "grade"}, course.grade)
				)
			)
		}
	})

	var CourseListSidebar = Renderer.CourseListSidebar = React.createClass({
		displayName: 'CourseListSidebar',
		render: function () {
			var courses = this.props.courses;
			return (
				React.DOM.div({className: "courselist-sidebar"}, 
					courses.map(function (course) {
						return CourseListSidebarItem({key: course.id, course: course})
					})
				)
			)
		}
	});

	var Overview = Renderer.Overview = React.createClass({
		displayName: 'Overview',
		render: function () {
			var courses = this.props.courses;
			return (
				React.DOM.div({className: "overview"}, 
					CourseListSidebar({courses: courses}), 
					CourseView({course: null})
				)
			)
		}
	})

	return Renderer;
	
})(Renderer || {});