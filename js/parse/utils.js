// dependencies: JQuery
'use strict';

var ParseUtils = (function(ParseUtils, undefined) {

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