// dependencies: JQuery, ParseUtils
'use strict';

var Parser = (function(Parser, undefined) {
	
	// constants
	Parser.ASSIGNMENT_TABLE_PARSE_FUNCS = [
		['date_due', ParseUtils.parseDate],
		['date_assigned', ParseUtils.parseDate],
		['name', null],
		['category', null],
		['score', ParseUtils.parseMaybeFloat],
		['total_points', ParseUtils.parseMaybeFloat],
		['weight', ParseUtils.parseMaybeFloat],
		['weighted_score', ParseUtils.parseMaybeFloat],
		['average_score', ParseUtils.parseMaybeFloat],
		['weighted_total_points', ParseUtils.parseMaybeFloat]
	];
	Parser.ASSIGNMENT_TABLE_KEYS = Parser.ASSIGNMENT_TABLE_PARSE_FUNCS.map(function (arr) { return arr[0]; });

	Parser.CATEGORY_TABLE_PARSE_FUNCS = [
		['name', null],
		['student_points', ParseUtils.parseMaybeFloat],
		['maximum_points', ParseUtils.parseMaybeFloat],
		['percent', ParseUtils.parseMaybePercent],
		['weight', ParseUtils.parseMaybeFloat],
		['category_points', ParseUtils.parseMaybeFloat]
	];
	Parser.CATEGORY_TABLE_KEYS = Parser.CATEGORY_TABLE_PARSE_FUNCS.map(function (arr) { return arr[0]; });

	// matches "AVG 95.00%" or "AVG95.00%" in free variation
	Parser.COURSE_AVERAGE_REGEX = /avg\s?([\d\.]+)\%/i;

	/*
	 * Parse the page for course data.
	 * Return data:
	 *     course[] {
	 *         name, grade, updated,
	 *         categories[] {
	 *             name, student_points, maximum_points, percent, weight, category_points
	 *         },
	 *         assignments[] {
	 *             date_due, date_assigned, name, category, score, total_points, weight, weighted_score, average_score, weighted_total_points
	 *         }
	 *     }
	 *
	 * doc {HTMLElement or HTMLDocument}
	 */
	Parser.parse = function (doc) {
		return $('.AssignmentClass', doc).map(function(idx, elem) {
			var $course = $(elem),
				course_obj = {};

			// parse course name and grade (average)
			course_obj.name = $course.find('.sg-header-square a').text().trim();
			course_obj.grade = parseFloat($course.find('span[title="AVG"]').text()
				.match(Parser.COURSE_AVERAGE_REGEX)[1]);
			course_obj.updated = ParseUtils.parseDate($course.find('.sg-header-sub-heading').text());

			// parse assignments table
			var $assignments = $course.find('.sg-content-grid > .sg-asp-table'),
				assignments = [];
			if ($assignments.length)
				assignments = ParseUtils.getDataFromTable($assignments, Parser.ASSIGNMENT_TABLE_KEYS, true, false)
					.map(function (course) {
						return ParseUtils.parsePropertiesByKey(course, Parser.ASSIGNMENT_TABLE_PARSE_FUNCS);
					});

			// parse categories table
			var $categories = $course.find('.sg-content-grid .sg-asp-table-group .sg-asp-table');
			if ($categories.length)
				course_obj.categories = ParseUtils.getDataFromTable($categories, Parser.CATEGORY_TABLE_KEYS, true, true)
					.map(function (category) {
						return ParseUtils.parsePropertiesByKey(category, Parser.CATEGORY_TABLE_PARSE_FUNCS);
					});
			else
				course_obj.categories = [];

			// group assignments by category
			var grouped_assignments = ParseUtils.groupBy(assignments,
				function (asg) { return asg.category; });
			// put each category's assignments under the category
			course_obj.categories.forEach(function (cat, idx) {
				course_obj.categories[idx].assignments = grouped_assignments[cat.name];
				delete grouped_assignments[cat.name];
			})
			// for categories not listed in the category table, add a category
			// with unknown weight
			for (var category_name in grouped_assignments)
				course_obj.categories.push({
					name: category_name,
					student_points: null,
					maximum_points: null,
					percent: null,
					weight: null,
					category_points: null,
					assignments: grouped_assignments[category_name]
				});

			return course_obj;
		});
	}

	return Parser;

})(Parser || {});