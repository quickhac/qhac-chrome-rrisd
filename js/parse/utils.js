// dependencies: JQuery
'use strict';

var ParseUtils = (function(ParseUtils, undefined) {

	ParseUtils.parseMaybeFloat = function (str) {
		if (str === undefined || str === null || str === '' || str === ' ')
			return null;
		return parseFloat(str);
	}

	ParseUtils.parseMaybePercent = function (str) {
		if (str === undefined || str === null || str === '' || str === ' ')
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