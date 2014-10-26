/** @jsx React.DOM */
// dependencies: React, RenderUtils, Moment

var CourseView = (function (CourseView, undefined) {

	var showScoreAside = CourseView.showScoreAside = function (asg) {
		var max_pts = asg.total_points,
			weight = asg.weight,
			asides = [''];

		if (!isNaN(max_pts) && max_pts !== 100)
			asides.push('/ ' + max_pts);
		if (!isNaN(weight) && weight !== 1)
			asides.push('× ' + weight);

		return asides.join(' ');
	}
	
	var AssignmentRow = CourseView.AssignmentRow = React.createClass({
		displayName: 'AssignmentRow',
		render: function () {
			var asg = this.props.assignment;
			return (
				<tr className="assignment">
					<td className="name" ref="name">{asg.name}</td>
					<td className="due" ref="due">{RenderUtils.relativeDate(asg.date_due)}</td>
					<td className="grade" ref="grade">
						<span className="score">{RenderUtils.showMaybeNumOrString(asg.score)}</span>
						<span className="aside">{showScoreAside(asg)}</span>
					</td>
				</tr>
			)
		}
	});

	var CategoryCard = CourseView.CategoryCard = React.createClass({
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
								return <AssignmentRow key={asg.name} assignment={asg} />
							})}
						</tbody>
					</table>
				</div>
			)
		}
	});

	CourseView.CourseView = React.createClass({
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
						return <CategoryCard key={cat.name} category={cat} />
					})}
				</div>
			)
		}
	});

	return CourseView;

})(CourseView || {});

// change the moment stuff to show no more precision than per day
(function() {

	// this is kind of a hack because we add the pre/suffixes in this method,
	// which we're not supposed to do, but as far as I know this is the only way
	// to force moment not to add the 'in %s' or '%s ago' prefixes/suffixes for
	// 'today', 'yesterday', and 'tomorrow'
	moment.locale('en', {
		relativeTime: function (number, withoutSuffix, key, isFuture) {
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

			if (withoutSuffix) {
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
			} else {
				// default to normal behavior
				switch (key) {
					case 's':
						return 'seconds';
					case 'm':
						return 'a minute';
					case 'mm':
						return fmt('%s minutes', number);
					case 'h':
						return 'an hour';
					case 'hh':
						return fmt('%s hours', number);
					case 'd':
						return 'a day';
					case 'dd':
						return fmt('%s days', number);
					case 'M':
						return 'a month';
					case 'MM':
						return fmt('%s months', number);
					case 'y':
						return 'a year';
					case 'yy':
						return fmt('%s years', number);
				}
			}
		}
	});
})();