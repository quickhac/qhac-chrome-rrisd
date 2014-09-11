/** @jsx React.DOM */

// dependencies: React, RenderUtils

var Renderer = (function(Renderer, undefined) {
	
	var AssignmentRow = Renderer.AssignmentRow = React.createClass({
		displayName: 'AssignmentRow',
		render: function () {
			var asg = this.props.assignment;
			return (
				React.DOM.tr({className: "assignment"}, 
					React.DOM.td({className: "name", ref: "name"}, asg.name), 
					React.DOM.td({className: "due", ref: "due"}, RenderUtils.relativeDate(asg.date_due)), 
					React.DOM.td({className: "grade", ref: "grade"}, RenderUtils.showMaybeNum(asg.score))
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
					React.DOM.div({className: "card-title"}, 
						React.DOM.h2(null, cat.name), 
						React.DOM.div({className: "weight"}, RenderUtils.showMaybeNum(cat.weight, '× ')), 
						React.DOM.div({className: "average"}, RenderUtils.showMaybeNum(cat.percent, null, '%'))
					), 
					React.DOM.table({className: "assignments"}, 
						React.DOM.thead(null, 
							React.DOM.tr({className: "header"}, 
								React.DOM.th({className: "name"}, "Assignment"), 
								React.DOM.th({className: "due"}, "Due"), 
								React.DOM.th({className: "grade"}, "Grade")
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
				$('.course-view-wrapper')[0]);
		},
		render: function () {
			var course = this.props.course;
			return (
				React.DOM.div({className: "sidebar-item", onClick: this.showCourse}, 
					React.DOM.div({className: "name"}, course.name), 
					React.DOM.div({className: "grade"}, RenderUtils.showMaybeNum(course.grade))
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
					React.DOM.div({className: "course-view-wrapper"})
				)
			)
		}
	});

	return Renderer;
	
})(Renderer || {});