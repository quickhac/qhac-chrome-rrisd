// dependencies: JQuery, moment, React, Parser, ParseUtils, Renderer, RenderUtils

$(function () {
	// remove all styles, since we're gonna be rewriting the entire page anyway
	RenderUtils.removeStyles();

	// parse the data on the page
	var parsed_data = Parser.parse(document.body);

	// show the data
	React.renderComponent(Renderer.Overview({courses: parsed_data}), document.body);
})