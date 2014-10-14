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
	RenderUtils.relativeDate = function (ms, prefix, suffix, withSuffix) {
		if (ms === undefined || ms === null || !ms) return '';
		prefix = prefix || '';
		suffix = suffix || '';

		if (withSuffix) {
			return prefix + moment(ms).fromNow() + suffix
		} else {
			return prefix + moment(RenderUtils.dateToYMDArray(ms)).fromNow(true) + suffix;
		}
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