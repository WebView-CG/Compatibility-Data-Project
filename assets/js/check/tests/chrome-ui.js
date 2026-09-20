import { STATUS } from './registry.js';

const REPORT_UI = {
  label: '§6.2.1 Visible Origin and TLS Status — Security Considerations for WebViews',
  url: 'https://webview-cg.github.io/webview-security/',
};

const chromeVisibility = {
  id: 'chrome-ui-bars-visible',
  category: 'chrome-ui',
  title: 'Visible browser chrome (address bar, toolbar, ...)',
  refs: [REPORT_UI],
  run() {
    const bars = {
      locationbar: !!window.locationbar && window.locationbar.visible,
      toolbar: !!window.toolbar && window.toolbar.visible,
      menubar: !!window.menubar && window.menubar.visible,
      statusbar: !!window.statusbar && window.statusbar.visible,
    };
    const anyVisible = Object.values(bars).some(Boolean);
    const detail = Object.entries(bars)
      .map(([name, visible]) => `${name}: ${visible}`)
      .join(', ');

    if (anyVisible) {
      return {
        status: STATUS.PASS,
        detected: true,
        summary: 'Standard browser chrome (address bar or toolbar) is reported as visible',
        detail,
        signal: { label: 'browser', weight: 1 },
      };
    }
    return {
      status: STATUS.WARN,
      detected: false,
      summary: 'No standard browser chrome is reported as visible',
      detail:
        `${detail}. When no origin/TLS indicator is visible, a user has no way to verify which site they are ` +
        'interacting with, which is a common setup for fullscreen or embedded WebViews. Note this also happens in ' +
        'legitimate popups opened via window.open(), so treat this signal together with the others on this page.',
      signal: { label: 'webview', weight: 2 },
    };
  },
};

export default [chromeVisibility];
