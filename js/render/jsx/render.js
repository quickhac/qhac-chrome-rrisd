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
				<div className="sidebar-item" onClick={this.showCourse}>
					<div className="name">{course.name}</div>
					<div className="grade">{RenderUtils.showMaybeNum(course.grade)}</div>
				</div>
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
					<div className="mp-option">
						<input type="radio" id={'mp-option-'+i} name="ctl00$plnMain$ddlReportCardRuns" value={i} defaultChecked={selected===i} />
						<label htmlFor={'mp-option-'+i} onClick={this.selectIndex.bind(null,i)}>{i}</label>
					</div>
				);

			return (
				<form className="mp-select" method="post" action="Assignments.aspx">
					{RenderUtils.mapObjToArr(state, function (k, v) {
						return (
							<input type="hidden" name={k} value={v} />
						)
					}).concat(radios)}
				</form>
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
				<div className="courselist-sidebar">
					<h3>Marking Period</h3>
					<MarkingPeriodSelector state={state} selectedIndex={selected} maxIndex={max} />
					<h3>Courses</h3>
					{courses.map(function (course) {
						return <CourseListSidebarItem course={course} />
					})}
				</div>
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
				<div className="overview">
					<CourseListSidebar courses={courses} asp_state={asp_state} current_mp={current_mp} max_mp={max_mp} />
					<div className="course-view-wrapper"></div>
				</div>
			)
		}
	});

	return Renderer;
	
})(Renderer || {});

// change the moment stuff to show no more precision than per day
(function() {

	// this is kind of a hack because we add the pre/suffixes in this method,
	// which we're not supposed to do, but as far as I know this is the only way
	// to force moment not to add the 'in %s' or '%s ago' prefixes/suffixes for
	// 'today', 'yesterday', and 'tomorrow'
	moment.locale('en', {
		relativeTime : function (number, withoutSuffix, key, isFuture) {
			// kind of a subset of C printf functionality; replaces %s with a
			// specified string
			function fmt(str, num) {
				return str.replace('%s', num);
			}
			
			// takes a formatting string and puts in the number and prefix/suffix
			function rel(str) {
				return isFuture ?
						fmt(fmt('in %s', str), number) :
						fmt(fmt('%s ago', str), number); }

			switch (key) {
				case 's':
				case 'm':
				case 'mm':
				case 'h':
				case 'hh':
					return 'today';
				case 'd':
					if (isFuture) return 'tomorrow'; else return 'yesterday';
				case 'dd':
					return rel('%s days');
				case 'M':
					return rel('a month');
				case 'MM':
					return rel('%s months');
				case 'y':
					return rel('a year');
				case 'yy':
					return rel('%s years');
			}
		}
	});
})();