// dependencies: JQuery, moment, React, Parser, ParseUtils, Renderer, RenderUtils

'use strict';

$(function () {
	try {
		var parsed_data = Parser.parse(document.body),
			mp_info = Parser.getMarkingPeriodInfo(document.body),
			asp_state = Parser.getASPState(document.body);

		// needed to postback to server to select marking period. ASP saves its
		// page state in a bunch of different parameters, and they must be
		// set correctly to interact with the server.
		asp_state['__EVENTTARGET'] = 'ctl00$plnMain$btnRefreshView';

		React.renderComponent(Renderer.Overview({
				courses: parsed_data,
				current_mp: mp_info[0],
				max_mp: mp_info[1],
				asp_state: asp_state
			}), document.body, function () {
				// FIXME: make CourseView a React child of Overview
				React.renderComponent(CourseView.CourseView(), $('.course-view-wrapper')[0]);
				// FIXME: render the logo inside React
				$('.courselist-sidebar').append('<img id="logo" src="' + chrome.extension.getURL('assets/logowhite.svg') + '">');
			});

		// Remove all styles, since we've rewritten the whole page anyway.
		// We put this line after rendering the React components over the body
		// so that if React encounters an error, we still have our styles when
		// we re-show the original content in the catch block.
		RenderUtils.removeStyles();

		// Broadcast the data to the extension. For safety, we check if the page
		// is inside a frame before calling the parent window's saveAssignmentData
		// method (see header.js).
		if (window !== parent)
			parent.saveAssignmentData(parsed_data, mp_info[0]);
	} catch (e) {
		debugger;
		// if any error occurs, fall back to showing the default grades
		$('#MainContent').css('display', 'initial');
		return;
	}
})