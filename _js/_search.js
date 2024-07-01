class Search {

	constructor() {
		this.data = null;
		this.term = null;
		this.cat = null;
		this.results = null;
		this.input = document.querySelector('.search-input');
		this.form = document.querySelector('.search');
		this.origin = document.location.href;
		this.timer = null;
		this.timerDelay = 300;
		this.resultCount = 0;
		document.querySelector('[role=main] .search-results');

		if(this.input != null) {

			this.input.addEventListener('focus', e => {
				this.loadJSONFile();
			});

			this.input.addEventListener('input', e => {

				this.term = e.currentTarget.value.trim();
				this.form.classList.add('search--loading');

				clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					if(!this.data) {
						this.loadJSONFile();
					}

					this.query();

					if(this.term) {
						this.updateURL();
					}
				}, this.timerDelay);

			});

			const url = new URL(document.location.href);
			this.cat = url.searchParams.get('cat');
			this.term = url.searchParams.get('s');
			if(this.cat != null || this.term != null) {
				if(!this.data) {
					this.loadJSONFile();
				}
				this.input.value = this.term;
				this.query();
			}
		}

		// We can only load categories from a page navigation so we
		// only have to check to display this on a page load.
		if (this.cat != null) {
			const categoryButton = document.querySelector(".search-category-button");
			categoryButton.querySelector("#cat").innerText = `Category: ${this.cat}`;
			categoryButton.style.display = "unset";
			categoryButton.onclick = () => {
				categoryButton.style.display = "";
				this.cat = null;
				this.query();
				this.updateURL();
				this.updateTitle();
			};
		}
	}

	loadJSONFile() {
		if(!this.data) {
			fetch('/assets/js/features.json')
			.then(response => {
				return response.json();
			})
			.then(json => {
				this.data = json;
				if(this.term || this.cat) {
					this.query();
				}
			})
			.catch(error => {
				console.error(error);
			});
		}
	}

	query() {
		if(!this.term) {
			this.form.classList.remove('search--loading');
			this.removeResultsMessage();
			this.removeResultsContainer();
			this.results = [];
			history.replaceState({id:'search'}, 'search', `${this.origin}`);
		}

		if(this.data && (this.term || this.cat)) {
			const previousResultsLength = this.results ? this.results.length : -1;
			const categoryFiltered = this.data.filter(feature => {
				if (this.cat == null) return true;

				return feature.category.includes(this.cat);
			});
			this.results = [];

			if (this.term) {
				if(this.term.startsWith('<') && this.term.endsWith('>')) {
					this.term = this.term.substr(1, this.term.length - 2);
				}
				if(this.term.endsWith('element')) {
					this.term = this.term.replace(new RegExp('element$'), '').trim();
				}
				if(this.term.endsWith('attribute')) {
					this.term = this.term.replace(new RegExp('attribute$'), '').trim();
				}

				if(this.term.includes('+')) {
					let terms = this.term.split('+');
					terms.forEach(item => {
						if(item != '') {
							let itemResults = categoryFiltered.filter(feature => this.results.filter(result => result.title == feature.title).length == 0 && (feature.slug.toLowerCase() === item.toLowerCase().trim() || feature.title.toLowerCase().includes(item.toLowerCase().trim()) || feature.keywords.toLowerCase().includes(item.toLowerCase().trim())));
							this.results = [...this.results, ...itemResults];
						}
					});
				} else if(this.term.includes(' vs ')) {

					let terms = this.term.split('vs');
					terms.forEach(item => {
						if(item != '') {
							let itemResults = categoryFiltered.filter(feature => this.results.filter(result => result.title == feature.title).length == 0 && (feature.slug.toLowerCase() === item.toLowerCase().trim() || feature.title.toLowerCase().includes(item.toLowerCase().trim()) || feature.keywords.toLowerCase().includes(item.toLowerCase().trim())));
							this.results = [...this.results, ...itemResults];
						}
					});
				} else {
					this.results = categoryFiltered.filter(feature => feature.slug.toLowerCase() === this.term.toLowerCase() || feature.title.toLowerCase().includes(this.term.toLowerCase()) || feature.keywords.toLowerCase().includes(this.term.toLowerCase()));
				}
			} else {
				this.results = categoryFiltered;
			}

			this.form.classList.remove('search--loading');

				if(this.results.length != 0 && this.results.length != previousResultsLength) {
					this.buildResultsMessage(this.results.length);
				}

				if(this.results.length == 0) {
					this.removeResultsContainer();
					this.buildResultsMessage(this.results.length);
				}
				else {
					this.buildResultsContainer();
					this.buildResults();
				}

				this.updateTitle();
		}
	}

	removeResultsMessage() {

		let searchResultsMessage = document.querySelector('[role=search] form .search-empty');
		if(searchResultsMessage != null) {
			searchResultsMessage.remove();
		}
	}

	buildResultsMessage(n) {

		let searchResultsMessage = document.querySelector('[role=search] form .search-empty');
		if(searchResultsMessage == null) {
			let noResult = document.createElement('p');
			noResult.classList.add('search-empty');
			searchResultsMessage = document.querySelector('[role=search] form').appendChild(noResult);
		}
		let message = '';
		if(n == 0) {
			message = 'No results found.';
			message += ' Why not <a href="https://github.com/WebView-CG/Compatibility-Data-Project/issues?utf8=✓&q=is%3Aissue+is%3Aopen+'+encodeURIComponent(this.term)+'">suggest this feature to be added?</a>';
		} else if (n == 1) {
			message = '1 result found.';
		} else {
			if(this.term?.includes('+')) {
				const icon = `<span class="icon icon--notebook" aria-hidden="hidden"></span>`;
				message = icon + `<b>Secret Recipe</b> with `;
				let index = 0;
				this.results.forEach(feature => {
					if(index > 0 && index < n - 1) {
						message += `, `;
					} else if(index == n - 1) {
						message += ` and `;
					}
					const featureURL = `/features/${feature.slug}/`;
					message += `<a href="${featureURL}">${feature.title}</a>`;
					index++;
				});
				message += `.`;
			} else if(this.term?.includes(' vs ')) {
				const icon = `<span class="icon icon--shout" aria-hidden="hidden"></span>`;
				message = icon + `<b>Versus</b> with `;
				let index = 0;
				this.results.forEach(feature => {
					if(index > 0 && index < n - 1) {
						message += `, `;
					} else if(index == n - 1) {
						message += ` and `;
					}
					const featureURL = `/features/${feature.slug}/`;
					message += `<a href="${featureURL}">${feature.title}</a>`;
					index++;
				});
				message += `.`;
			} else {
				message = n + ' results found.';
			}
		}
		searchResultsMessage.innerHTML = message;
	}

	buildResultsContainer() {

		if(document.querySelector('[role=main] .search-results') == null) {
			this.resultCount = 0;

			let container = document.createElement('div');
			container.classList.add('search-results');
			container.id = 'search-results';

			this.searchMoreButton = document.createElement('button');
			this.searchMoreButton.textContent = "Show more results";
			this.searchMoreButton.id = "search-more";

			this.searchMoreButton.addEventListener('click', () => {
				if (!this.showingAllResults()) {
					const PAGINATION_AMOUNT = 10;

					this.buildResults(Math.min(this.resultCount + PAGINATION_AMOUNT, this.results.length));
				}
			});

			document.querySelector('[role=main]').prepend(this.searchMoreButton);
			document.querySelector('[role=main]').prepend(container);
		}
	}

	removeResultsContainer() {

		if(document.querySelector('[role=main] .search-results') != null) {
			document.querySelector('[role=main] .search-results').remove();
			document.querySelector('#search-more').remove();
		}
	}

	buildResults(maxCount = 10) {
		this.resultCount = maxCount;

		const container = document.querySelector('[role=main] .search-results');
		container.querySelectorAll('section').forEach(section => {
			if(this.results.filter(feature => feature.slug == section.getAttribute('data-slug')).length == 0) {
				section.remove();
			}
		});

		for (let i = 0; i < this.results.length; i++) {
			if (i >= maxCount) break;

			const feature = this.results[i];

			if(container.querySelector(`[data-slug="${feature.slug}"]`) == null) {
				const featureURL = `/features/${feature.slug}/`;
				let div = document.createElement('div');
				div.innerHTML = `<section class="feature feature--placeholder" data-slug="${feature.slug}">
						<header class="feature-header">
							<div class="feature-header-column">
								<h1 class="feature-title"><a href="${featureURL}">${feature.title}<span class="feature-permalink" aria-hidden="true">#</span></a></h1>
							</div>
							<div class="feature-header-column">
							</div>
						</header>
						<div class="data-details"></div>
						<footer class="feature-footer"></footer>
					</section>`;
				container.appendChild(div.firstChild);

				const featureContainer = container.querySelector(`[data-slug="${feature.slug}"]`);
				featureContainer.classList.add('loading');

				fetch(featureURL)
				.then(response => {
					return response.text();
				})
				.then(text => {
					let div = document.createElement('div');
					div.innerHTML = text;
					if(featureContainer != null) {
						featureContainer.classList.remove('feature--placeholder');
						featureContainer.classList.remove('loading');
						featureContainer.querySelector('.data-details').innerHTML = div.querySelector('.data-details').innerHTML;
						if(window.caniwebview && window.caniwebview.settings && window.caniwebview.settings.unchecked) {
							featureContainer.querySelector('.data-details').appendChild(window.caniwebview.settings.getEmptyDataMessageElement());
						}
						featureContainer.querySelector('.feature-footer').innerHTML = div.querySelector('.feature-footer').innerHTML;
						const featureDescription = div.querySelector('.feature-description');
						if (featureDescription != null) {
							featureContainer.querySelector('.feature-header-column:nth-child(1)').innerHTML += featureDescription.outerHTML;
						}
						const featureHeader = div.querySelector('.feature-header-column:nth-child(2)');
						if (featureHeader != null) {
							featureContainer.querySelector('.feature-header-column:nth-child(2)').innerHTML = featureHeader.innerHTML;
						}
					}
				})
				.catch(error => {
					console.error(error);
				});
			}
		}

		this.searchMoreButton.className = !this.showingAllResults() ?
			"show-more-visible" : "invisible";
	}

	updateURL() {
		const params = new URLSearchParams();
		if (this.term != null) {
			params.append("s", this.term);
		}
		if (this.cat != null) {
			params.append("cat", this.cat);
		}
		history.replaceState({id:'search'}, 'search',
			`${document.location.origin}/search/?${params.toString()}`);
	}

	updateTitle() {
		let title = "Can I WebView&hellip;";
		if (this.term != null) {
			title += ` "${this.term}"`;
		} else if (this.cat != null) {
			title += ` "${this.cat}"`;
		}

		document.querySelector('title').innerHTML = title + " search results";
	}

	showingAllResults() {
		return this.resultCount >= this.results.length;
	}
}
