/** @jsx React.DOM */

// dependencies: React, RenderUtils

var Renderer = (function(Renderer, undefined) {
	
	var AssignmentRow = Renderer.AssignmentRow = React.createClass({
		displayName: 'AssignmentRow',
		render: function () {
			var asg = this.props.assignment;
			return (
				<tr class="assignment" className="assignmentRow">
					<td class="name" ref="name">{asg.name}</td>
					<td class="due" ref="due">{RenderUtils.relativeDate(asg.date_due)}</td>
					<td class="grade" ref="grade">{asg.score}</td>
				</tr>
			)
		}
	});

	var CategoryCard = Renderer.CategoryCard = React.createClass({
		displayName: 'CategoryCard',
		render: function () {
			var cat = this.props.category;
			return (
				<div class="category" className>
					<h1>{cat.name}</h1>
					<div class="average">{cat.percent}</div>
					<table class="assignments">
						<tr class="header">
							<th class="name">Assignment</th>
							<th class="due">Due Date</th>
							<th class="grade">Grade</th>
						</tr>
						{cat.assignments.map(function (asg) {
							return <AssignmentRow assignment={asg} />
						})}
					</table>
				</div>
			)
		}
	});

	var CourseView = Renderer.CourseView = React.createClass({
		displayName: 'CourseView',
		render: function () {
			var course = this.props.course;
			return (
				<div class="course">
					{course.categories.map(function (cat) {
						return <CategoryCard category={cat} />
					})}
				</div>
			)
		}
	});

	return Renderer;
	
})(Renderer || {});