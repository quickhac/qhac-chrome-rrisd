// dependencies: JQuery, moment, React, Parser, ParseUtils, Renderer, RenderUtils

'use strict';

$(function () {
	try {
		// hack; hide hidden asterisks so they don't show up in innerText of assignment names
		$('.sg-asp-table-data-row label[style$="display:none"]').text('');

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
				React.renderComponent(Renderer.CourseView(), $('.course-view-wrapper')[0])
				$('.courselist-sidebar').append('<img id="logo" src="' + chrome.extension.getURL('assets/logowhite.svg') + '">');
			});

		// remove all styles, since we're gonna be rewriting the entire page anyway
		RenderUtils.removeStyles();
	} catch (e) {
		debugger;
		// if any error occurs, fall back to showing the default grades
		$('#MainContent').css('display', 'initial');
		return;
	}
})