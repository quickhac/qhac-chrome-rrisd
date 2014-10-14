/** @jsx React.DOM */
// dependencies: React, RenderUtils

var CourseView = (function (CourseView, undefined) {

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
	
	var AssignmentRow = CourseView.AssignmentRow = React.createClass({
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
								return <AssignmentRow assignment={asg} />
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
						return <CategoryCard category={cat} />
					})}
				</div>
			)
		}
	});

	return CourseView;

})(CourseView || {});