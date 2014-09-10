/** @jsx React.DOM */

// dependencies: React, RenderUtils

var Renderer = (function(Renderer, undefined) {
	
	var AssignmentRow = Renderer.AssignmentRow = React.createClass({
		displayName: 'AssignmentRow',
		render: function () {
			var asg = this.props.assignment;
			return (
				<tr className="assignment">
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
				<div className="category">
					<h1>{cat.name}</h1>
					<div class="average">{cat.percent}</div>
					<table class="assignments">
						<thead>
							<tr class="header">
								<th class="name">Assignment</th>
								<th class="due">Due Date</th>
								<th class="grade">Grade</th>
							</tr>
						</thead>
						<tbody>
							{cat.assignments.map(function (asg) {
								return <AssignmentRow key={asg.id} assignment={asg} />
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
				return ( <div className="course-view"></div> )

			return (
				<div className="course-view">
					{course.categories.map(function (cat) {
						return <CategoryCard key={cat.id} category={cat} />
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
				$('.course-view')[0]);
		},
		render: function () {
			var course = this.props.course;
			return (
				<div className="sidebar-item" onClick={this.showCourse}>
					<div class="name">{course.name}</div>
					<div class="grade">{course.grade}</div>
				</div>
			)
		}
	})

	var CourseListSidebar = Renderer.CourseListSidebar = React.createClass({
		displayName: 'CourseListSidebar',
		render: function () {
			var courses = this.props.courses;
			return (
				<div className="courselist-sidebar">
					{courses.map(function (course) {
						return <CourseListSidebarItem key={course.id} course={course} />
					})}
				</div>
			)
		}
	});

	var Overview = Renderer.Overview = React.createClass({
		displayName: 'Overview',
		render: function () {
			var courses = this.props.courses;
			return (
				<div className="overview">
					<CourseListSidebar courses={courses} />
					<CourseView course={null} />
				</div>
			)
		}
	})

	return Renderer;
	
})(Renderer || {});