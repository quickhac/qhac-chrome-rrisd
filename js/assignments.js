// dependencies: JQuery, moment, React, Parser, ParseUtils, Renderer, RenderUtils

'use strict';

$(function () {
	try {
		// parse the data on the page
		var parsed_data = Parser.parse(document.body),
			mp_info = Parser.getMarkingPeriodInfo(document.body),
			asp_state = Parser.getASPState(document.body);

		asp_state['__EVENTTARGET'] = 'ctl00$plnMain$btnRefreshView';

		// show the data
		React.renderComponent(Renderer.Overview({
				courses: parsed_data,
				current_mp: mp_info[0],
				max_mp: mp_info[1],
				asp_state: asp_state
			}), document.body, function () {
				React.renderComponent(CourseView.CourseView(), $('.course-view-wrapper')[0])
				$('.courselist-sidebar').append('<img id="logo" src="' + chrome.extension.getURL('assets/logowhite.svg') + '">');
			});

		// remove all styles, since we're gonna be rewriting the entire page anyway
		RenderUtils.removeStyles();

		// broadcast the data to the extension
		if (window !== parent)
			parent.saveAssignmentData(parsed_data, mp_info[0]);
	} catch (e) {
		debugger;
		// if any error occurs, fall back to showing the default grades
		$('#MainContent').css('display', 'initial');
		return;
	}
})