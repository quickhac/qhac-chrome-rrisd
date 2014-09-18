// dependencies: none
'use strict';

var RenderUtils = (function (RenderUtils, undefined) {

	RenderUtils.dateToYMDArray = function (ms) {
		var date = new Date(ms),
			year = date.getUTCFullYear(),
			month = date.getUTCMonth(),
			day = date.getUTCDate();

		return [year, month, day];
	}

	/**
	 * Converts a date in the format of milliseconds since 1970 to a date relative
	 * to the current date.
	 */
	RenderUtils.relativeDate = function (ms, prefix, suffix) {
		if (ms === undefined || ms === null || !ms) return '';
		prefix = prefix || '';
		suffix = suffix || '';
		return prefix + moment(RenderUtils.dateToYMDArray(ms)).fromNow(true) + suffix;
	}

	/**
	 * Converts a number to a string (with prefix and/or suffix, if specified) only if it is
	 * not undefined, null or NaN. Otherwise, returns a blank string.
	 */
	RenderUtils.showMaybeNum = function (num, prefix, suffix) {
		prefix = prefix || '';
		suffix = suffix || '';

		if (num === undefined || num === null || isNaN(num))
			return '';

		return prefix + num.toString() + suffix;
	}

	RenderUtils.mapObjToArr = function (obj, callback) {
		var arr = [];
		for (var k in obj)
			if (obj.hasOwnProperty(k))
				arr.push(callback(k, obj[k]));
		return arr;
	}

	/**
	 * Removes all stylesheets from the current page.
	 */
	RenderUtils.removeStyles = function () {
		var attr   = 'data-com-aanandprasad-disable-css';
		var links  = getElements('link[rel=stylesheet]');
		var inline = getElements('style');

		links.forEach(function(el) {
			if (el.hasAttribute(attr)) {
				el.disabled = false;
				el.removeAttribute(attr);
			} else if (!el.disabled) {
				el.disabled = true;
				el.setAttribute(attr, 'true');
			}
		});

		inline.forEach(function(el) {
			if (el.hasAttribute(attr)) {
				el.innerHTML = el.getAttribute(attr);
				el.removeAttribute(attr);
			} else {
				el.setAttribute(attr, el.innerHTML);
				el.innerHTML = '';
			}
		});

		function getElements(selector) {
			return [].slice.call(document.querySelectorAll(selector));
		}
	}

	return RenderUtils;

})(RenderUtils || {});

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