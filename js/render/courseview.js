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
				React.DOM.tr({className: "assignment"}, 
					React.DOM.td({className: "name", ref: "name"}, asg.name), 
					React.DOM.td({className: "due", ref: "due"}, RenderUtils.relativeDate(asg.date_due)), 
					React.DOM.td({className: "grade", ref: "grade"}, 
						React.DOM.span({className: "score"}, RenderUtils.showMaybeNum(asg.score)), 
						React.DOM.span({className: "aside"}, showScoreAside(asg))
					)
				)
			)
		}
	});

	var CategoryCard = CourseView.CategoryCard = React.createClass({
		displayName: 'CategoryCard',
		render: function () {
			var cat = this.props.category;
			return (
				React.DOM.div({className: "category"}, 
					React.DOM.div({className: "card-title"}, 
						React.DOM.h2(null, cat.name), 
						React.DOM.div({className: "weight"}, RenderUtils.showMaybeNum(cat.weight, '× ')), 
						React.DOM.div({className: "average"}, RenderUtils.showMaybeNum(cat.percent))
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
								return AssignmentRow({assignment: asg})
							})
						)
					)
				)
			)
		}
	});

	CourseView.CourseView = React.createClass({
		displayName: 'CourseView',
		render: function () {
			var course = this.props.course;
			if (course === undefined || course === null)
				return (
					React.DOM.div({className: "course-view"}, 
						React.DOM.div({className: "notice"}, 
							"Click on a course to see its grades.", React.DOM.br(null), React.DOM.br(null), 
							"To view your grades using the district-provided interface, open Home Access Center in incognito mode."
						)
					) )

			return (
				React.DOM.div({className: "course-view"}, 
					React.DOM.div({className: "header"}, 
						React.DOM.div({className: "vert"}, 
							React.DOM.h1(null, course.name), 
							React.DOM.div({className: "updated"}, RenderUtils.relativeDate(course.updated, 'Updated ') || 'No grades')
						), 
						React.DOM.div({className: "grade"}, RenderUtils.showMaybeNum(course.grade))
					), 
					course.categories.map(function (cat) {
						return CategoryCard({category: cat})
					})
				)
			)
		}
	});

	return CourseView;

})(CourseView || {});