---
layout: null
permalink: "/assets/js/index.js"
---

document.body.addEventListener("htmx:load", () => {
	{% include_relative _search.js %}
	{% include_relative _settings.js %}
	{% include_relative _filters.js %}
	{% include_relative _options.js %}

	class Caniwebview {
		constructor() {
			this.search = new Search();
			this.settings = new Settings();
			this.filters = new Filters();
			this.accessibleColors = new Options('.a11y-colors-button', 'accessible-colors-enabled');
		}
	}

	window.caniwebview = new Caniwebview();
	window.caniwebview.filters.onDOMContentLoaded();
});
