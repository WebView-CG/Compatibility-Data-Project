class Filters {

	constructor() {

		this.filters = document.querySelectorAll('.filters');
		this.current = 'apply';
		this.init();
	}

	init() {
		this.addEvents();
	}

	onDOMContentLoaded() {
		this.showOrHide();
		this.setInitialValue();
	}

	addEvents() {
		this.filters.forEach(filter => {
			const applyButton = filter.querySelector('.filter-apply-button');
			const unapplyButton = filter.querySelector('.filter-unapply-button');

			if(applyButton) {

				applyButton.addEventListener('click', e => {

					e.preventDefault();
					if(window.caniwebview && window.caniwebview.settings) {
						filter.querySelector('.filter-button--active').classList.remove('filter-button--active');
						applyButton.classList.add('filter-button--active');
						window.caniwebview.settings.apply();
						this.setCurrentValue('apply');
					}

					if(window.caniwebview && window.caniwebview.support) {
						window.caniwebview.support.update();
					}
				});
			}

			if(unapplyButton) {

				unapplyButton.addEventListener('click', e => {

					e.preventDefault();
					if(window.caniwebview && window.caniwebview.settings) {
						filter.querySelector('.filter-button--active').classList.remove('filter-button--active');
						unapplyButton.classList.add('filter-button--active');
						window.caniwebview.settings.unapply();
						this.setCurrentValue('unapply');
					}

					if(window.caniwebview && window.caniwebview.support) {
						window.caniwebview.support.update();
					}
				});
			}
		});
	}

	areApplied() {
		return (this.current == 'apply');
	}

	showOrHide() {

		if(window.caniwebview && window.caniwebview.settings) {
			if(window.caniwebview.settings.isFullyChecked() || window.caniwebview.settings.isFullyUnchecked()) {
				this.filters.forEach(filter => {
					filter.setAttribute('hidden', '');
				});
			} else {
				this.filters.forEach(filter => {
					filter.removeAttribute('hidden', '');

					filter.querySelector('.filter-button--active').classList.remove('filter-button--active');
					if(this.areApplied()) {
						const applyButton = filter.querySelector('.filter-apply-button');
						applyButton.classList.add('filter-button--active');
					} else {
						const unapplyButton = filter.querySelector('.filter-unapply-button');
						unapplyButton.classList.add('filter-button--active');
					}
				});
			}
		}
	}

	setInitialValue() {

		const storedValue = this.getLocalStorage();
		if(storedValue) {
			this.current = storedValue;
			if(storedValue == 'apply') {
				this.filters.forEach(filter => {
					const applyButton = filter.querySelector('.filter-apply-button');
					filter.querySelector('.filter-button--active').classList.remove('filter-button--active');
					applyButton.classList.add('filter-button--active');
				});
				if(window.caniwebview && window.caniwebview.settings) {
					window.caniwebview.settings.apply();
				}
			} else if(storedValue == 'unapply') {
				this.filters.forEach(filter => {
					const unapplyButton = filter.querySelector('.filter-unapply-button');
					filter.querySelector('.filter-button--active').classList.remove('filter-button--active');
					unapplyButton.classList.add('filter-button--active');
				});
				if(window.caniwebview && window.caniwebview.settings) {
					window.caniwebview.settings.unapply();
				}
			}

			if(window.caniwebview && window.caniwebview.support) {
				window.caniwebview.support.update();
			}
		}
	}

	setCurrentValue(state) {

		if(this.current != state && (state == 'apply' || state == 'unapply')) {
			this.current = state;
			this.setLocalStorage();
		}
	}

	setLocalStorage() {

		localStorage.setItem('filters', this.current);
	}

	getLocalStorage() {

		return localStorage.getItem('filters');
	}
}