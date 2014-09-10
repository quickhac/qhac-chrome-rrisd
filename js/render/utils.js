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

	RenderUtils.relativeDate = function (ms) {
		return moment(RenderUtils.dateToYMDArray(ms)).fromNow();
	}

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