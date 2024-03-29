---
layout: null
permalink: "/assets/js/embed-home.js"
---
{% include_relative _generator.js %}

class Caniwebview {

	constructor() {
		this.generator = new Generator();
	}
}

document.addEventListener("DOMContentLoaded", () => {
	window.caniwebview = new Caniwebview();
});