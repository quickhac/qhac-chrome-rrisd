// dependencies: none
'use strict';

var RenderUtils = (function (RenderUtils, undefined) {

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
})(RenderUtils || {});