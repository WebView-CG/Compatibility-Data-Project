class Theme {

	constructor() {
		this.button = document.getElementById('theme-toggle');
		this.darkModeIcon = '🌙';
		this.lightModeIcon = '☀️';
		
		if (this.button) {
			this.init();
		}
	}

	init() {
		// Load saved theme preference
		this.loadTheme();
		
		// Add click event to toggle button
		this.button.addEventListener('click', () => {
			this.toggle();
		});

		// Add keyboard support
		this.button.addEventListener('keydown', (e) => {
			// Support Enter and Space keys
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				this.toggle();
			}
		});
	}

	loadTheme() {
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		
		// Apply light mode if saved, otherwise use system preference
		if (savedTheme === 'light' || (savedTheme === null && !prefersDark)) {
			this.setLightMode(false);
		} else {
			this.setDarkMode(false);
		}
	}

	toggle() {
		if (document.body.classList.contains('light-mode')) {
			this.setDarkMode(true);
			localStorage.setItem('theme', 'dark');
		} else {
			this.setLightMode(true);
			localStorage.setItem('theme', 'light');
		}
	}

	setLightMode(announce = true) {
		document.body.classList.add('light-mode');
		this.updateIcon(this.darkModeIcon);
		this.updateAriaLabel('Switch to dark mode', 'Light mode');
		
		if (announce) {
			this.announceChange('Light mode enabled');
		}
	}

	setDarkMode(announce = true) {
		document.body.classList.remove('light-mode');
		this.updateIcon(this.lightModeIcon);
		this.updateAriaLabel('Switch to light mode', 'Dark mode');
		
		if (announce) {
			this.announceChange('Dark mode enabled');
		}
	}

	updateIcon(icon) {
		const iconElement = this.button.querySelector('.theme-toggle-icon');
		if (iconElement) {
			iconElement.textContent = icon;
		}
	}

	updateAriaLabel(label, currentTheme) {
		this.button.setAttribute('aria-label', label);
		
		const visuallyHiddenText = this.button.querySelector('.visually-hidden');
		if (visuallyHiddenText) {
			visuallyHiddenText.textContent = `Current theme: ${currentTheme}`;
		}
	}

	announceChange(message) {
		// Create a temporary live region for screen readers
		const announcement = document.createElement('div');
		announcement.setAttribute('role', 'status');
		announcement.setAttribute('aria-live', 'polite');
		announcement.classList.add('visually-hidden');
		announcement.textContent = message;
		
		document.body.appendChild(announcement);
		
		// Remove after announcement
		setTimeout(() => {
			document.body.removeChild(announcement);
		}, 1000);
	}
}
