/** @jsx React.DOM */
// dependencies: React, RenderUtils, CourseView

'use strict';

var Renderer = (function(Renderer, undefined) {

	var CourseListSidebarItem = Renderer.CourseListSidebarItem = React.createClass({
		displayName: 'CourseListSidebarItem',
		showCourse: function () {
			React.renderComponent(
				CourseView.CourseView({course: this.props.course}),
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
	});

	var MarkingPeriodSelector = Renderer.MarkingPeriodSelector = React.createClass({
		displayName: 'MarkingPeriodSelector',
		getInitialState: function () {
			return { selected: this.props.selectedIndex }
		},
		selectIndex: function (i) {
			this.setState({ selected: i }, function () {
				window.setTimeout(function () { $('.mp-select').submit(); }, 100);
			});
		},
		render: function () {
			var state = this.props.state,
				selected = this.state.selected,
				max = this.props.maxIndex,
				radios = [];

			for (var i = 1; i <= max; i++)
				radios.push(
					React.DOM.div({className: "mp-option"}, 
						React.DOM.input({type: "radio", id: 'mp-option-'+i, name: "ctl00$plnMain$ddlReportCardRuns", value: i, defaultChecked: selected===i}), 
						React.DOM.label({htmlFor: 'mp-option-'+i, onClick: this.selectIndex.bind(null,i)}, i)
					)
				);

			return (
				React.DOM.form({className: "mp-select", method: "post", action: "Assignments.aspx"}, 
					RenderUtils.mapObjToArr(state, function (k, v) {
						return (
							React.DOM.input({type: "hidden", name: k, value: v})
						)
					}).concat(radios)
				)
			)
		}
	});

	var CourseListSidebar = Renderer.CourseListSidebar = React.createClass({
		displayName: 'CourseListSidebar',
		render: function () {
			var courses = this.props.courses,
				state = this.props.asp_state,
				selected = this.props.current_mp,
				max = this.props.max_mp;
			return (
				React.DOM.div({className: "courselist-sidebar"}, 
					React.DOM.h3(null, "Marking Period"), 
					MarkingPeriodSelector({state: state, selectedIndex: selected, maxIndex: max}), 
					React.DOM.h3(null, "Courses"), 
					courses.map(function (course) {
						return CourseListSidebarItem({course: course})
					})
				)
			)
		}
	});

	var Overview = Renderer.Overview = React.createClass({
		displayName: 'Overview',
		render: function () {
			var courses = this.props.courses,
				asp_state = this.props.asp_state,
				current_mp = this.props.current_mp,
				max_mp = this.props.max_mp;
			return (
				React.DOM.div({className: "overview"}, 
					CourseListSidebar({courses: courses, asp_state: asp_state, current_mp: current_mp, max_mp: max_mp}), 
					React.DOM.div({className: "course-view-wrapper"})
				)
			)
		}
	});

	return Renderer;
	
})(Renderer || {});
