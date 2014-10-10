/** @jsx React.DOM */

// dependencies: React, RenderUtils

'use strict';

var Renderer = (function(Renderer, undefined) {

	function showScoreAside(asg) {
		var max_pts = asg.total_points,
			weight = asg.weight,
			asides = [''];

		if (!isNaN(max_pts) && max_pts !== 100)
			asides.push('/ ' + max_pts);
		if (!isNaN(weight) && weight !== 1)
			asides.push('× ' + weight);

		return asides.join(' ');
	}
	
	var AssignmentRow = Renderer.AssignmentRow = React.createClass({
		displayName: 'AssignmentRow',
		render: function () {
			var asg = this.props.assignment;
			return (
				<tr className="assignment">
					<td className="name" ref="name">{asg.name}</td>
					<td className="due" ref="due">{RenderUtils.relativeDate(asg.date_due)}</td>
					<td className="grade" ref="grade">
						<span className="score">{RenderUtils.showMaybeNum(asg.score)}</span>
						<span className="aside">{showScoreAside(asg)}</span>
					</td>
				</tr>
			)
		}
	});

	var CategoryCard = Renderer.CategoryCard = React.createClass({
		displayName: 'CategoryCard',
		render: function () {
			var cat = this.props.category;
			return (
				<div className="category">
					<div className="card-title">
						<h2>{cat.name}</h2>
						<div className="weight">{RenderUtils.showMaybeNum(cat.weight, '× ')}</div>
						<div className="average">{RenderUtils.showMaybeNum(cat.percent)}</div>
					</div>
					<table className="assignments">
						<thead>
							<tr className="header">
								<th className="name">Assignment</th>
								<th className="due">Due</th>
								<th className="grade">Grade</th>
							</tr>
						</thead>
						<tbody>
							{cat.assignments.map(function (asg) {
								return <AssignmentRow assignment={asg} />
							})}
						</tbody>
					</table>
				</div>
			)
		}
	});

	var CourseView = Renderer.CourseView = React.createClass({
		displayName: 'CourseView',
		render: function () {
			var course = this.props.course;
			if (course === undefined || course === null)
				return (
					<div className="course-view">
						<div className="notice">
							Click on a course to see its grades.<br /><br />
							To view your grades using the district-provided interface, open Home Access Center in incognito mode.
						</div>
					</div> )

			return (
				<div className="course-view">
					<div className="header">
						<div className="vert">
							<h1>{course.name}</h1>
							<div className="updated">{RenderUtils.relativeDate(course.updated, 'Updated ') || 'No grades'}</div>
						</div>
						<div className="grade">{RenderUtils.showMaybeNum(course.grade)}</div>
					</div>
					{course.categories.map(function (cat) {
						return <CategoryCard category={cat} />
					})}
				</div>
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