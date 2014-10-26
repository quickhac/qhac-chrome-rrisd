// dependencies: JQuery, ParseUtils
'use strict';

var ParseUtils = (function(ParseUtils, undefined) {

	ParseUtils.parseMaybeFloat = function (str) {
		if (str === undefined || str === null || str.trim() === '')
			return null;
		return parseFloat(str);
	}

	ParseUtils.parseMaybeFloatOrString = function (str) {
		if (str === undefined || str === null || str.trim() === '')
			return null;
		else if (isNaN(str)) return str;
		else return parseFloat(str);
	}

	ParseUtils.parseMaybePercent = function (str) {
		if (str === undefined || str === null || str.trim() === '')
			return null;

		var matches = str.match(/([\d\.]+)/);
		if (matches === undefined || matches === null || !matches.length)
			return null;

		return ParseUtils.parseMaybeFloat(matches[1]);
	}

	/**
	 * Parses a date in MM/DD/YYYY format and returns milliseconds since 1970, UTC.
	 */
	 ParseUtils.parseDate = function (string) {
	 	var matches = string.match(/(\d+)\/(\d+)\/(\d+)/);

	 	if (matches === undefined || matches === null || !matches.length)
	 		return null;

	 	return Date.UTC(parseInt(matches[3]), parseInt(matches[1]) - 1, parseInt(matches[2]));
	 }

	 ParseUtils.strTrim = function (string) { return string.trim(); }

	/**
	 * Creates an object from parallel key and value arrays.
	 * keys {string[]}
	 * values {any[]}
	 */
	ParseUtils.objectFromKV = function (keys, values) {
		var obj = {};
		keys.forEach(function (k, i) { obj[k] = values[i]; });
		return obj;
	}

	/**
	 * Groups elements of an array by a criterion callback. See _.groupBy
	 * array {any[]}
	 * criterion {any -> string}
	 */
	ParseUtils.groupBy = function (array, criterion) {
		var groups = {};
		array.forEach(function(el) {
			var groupName = criterion.call(null, el);
			if (groups[groupName])
				groups[groupName].push(el);
			else
				groups[groupName] = [el];
		});
		return groups;
	}

	/**
	 * For each key with a parse function, parses the value of the object property `key`
	 * and saves it as the same object property. Modifies original object.
	 * obj {Object}
	 * parse_funcs {[key {string}, callback {any -> any}]}
	 */
	ParseUtils.parsePropertiesByKey = function (obj, parse_funcs) {
		for (var i in parse_funcs) {
			var key = parse_funcs[i][0],
				callback = parse_funcs[i][1];
			if (typeof callback === 'function')
				obj[key] = callback(obj[key]);
		}

		return obj;
	}
	
	/**
	 * Parses table data by row into an array of objects.
	 * $table {JQuery}
	 * keys {string[]}: the keys to use for the output array of objects;
	 *     if not specified; the first row in the table is used.
	 */
	ParseUtils.getDataFromTable = function ($table, keys, exclude_first, exclude_last) {
		keys = keys ||
			$table.find('tr').eq(0).children()
				.map(function (el) { return el.innerHTML; });

		var parsed_data = [];
		var query = "tr" +
			(exclude_first ? ':not(:first)' : '') +
			(exclude_last ? ':not(:last)' : '');

		// parse each row as values and map them to keys
		$table.find(query).each(function(index, element) {
			var row = [].slice.call(element.children).map(function (el) { return el.innerText; });
			parsed_data.push(ParseUtils.objectFromKV(keys, row));
		});

		return parsed_data;
	}

	return ParseUtils;

})(ParseUtils || {});

var Parser = (function(Parser, undefined) {
	
	// constants
	Parser.ASSIGNMENT_TABLE_PARSE_FUNCS = [
		['date_due', ParseUtils.parseDate],
		['date_assigned', ParseUtils.parseDate],
		['name', ParseUtils.strTrim],
		['category', null],
		['score', ParseUtils.parseMaybeFloatOrString],
		['total_points', ParseUtils.parseMaybeFloat],
		['weight', ParseUtils.parseMaybeFloat],
		['weighted_score', ParseUtils.parseMaybeFloat],
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

	// course numbers and course names are always separated by several spaces;
	// we don't care about the course number, only the course name
	Parser.COURSE_NAME_REGEX = / {2,}(.*)$/;

	/**
	 * Takes a string like "AVG100.00%" or "AVG 100.00%" or "" as input and
	 * returns the numerical value, if any
	 */
	function parseCourseGrade(str) {
		var matches = str.match(Parser.COURSE_AVERAGE_REGEX);
		if (matches && matches.length)
			return parseFloat(matches[1]);

		return null;
	}

	/**
	 * Takes a string like "3620A - 6    IB Pre-Calculus" and returns the part
	 * of the string after the giant block of whitespace, or if no giant block
	 * of whitespace is found, returns the original string.
	 */
	function parseCourseName(str) {
		var matches = str.match(Parser.COURSE_NAME_REGEX);
		if (matches && matches.length)
			return matches[1];

		return str;
	}
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
		// hack; hide hidden asterisks so they don't show up in innerText of assignment names
		$('.sg-asp-table-data-row label[style$="display:none"]', doc).text('');

		return [].map.call($('.AssignmentClass', doc), function(elem, idx) {
			var $course = $(elem),
				course_obj = {};

			// parse course name and grade (average)
			course_obj.name = parseCourseName($course.find('.sg-header-square a').text().trim());
			course_obj.grade = parseCourseGrade($course.find('span[title="AVG"]').text());
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
				cat.assignments = grouped_assignments[cat.name];
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

	/*
	 * Returns the current marking period and the maximum available marking period.
	 * returns: [current, max]
	 */
	Parser.getMarkingPeriodInfo = function (doc) {
		var opts = $('#plnMain_ddlReportCardRuns', doc).children(),
			selected = opts.filter('[selected]'),
			last = opts.last();

		return [parseInt(selected.val()), parseInt(last.val())];
	}

	/**
	 * Returns an object containing all of the names and values of the ASP.NET
	 * state variables on the page.
	 * To refresh the page, set __EVENTTARGET to ctl00$plnMain$btnRefreshView
	 */
	Parser.getASPState = function (doc) {
		var $elems = $('input[type=hidden]', doc), state = {};

		[].forEach.call($elems, function (el, idx) {
			state[el.name] = el.value;
		});

		return state;
	}

	return Parser;

})(Parser || {});

