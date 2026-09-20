import { STATUS } from './registry.js';

const REPORT_USAGE = { label: '§4 WebView Categories — Usage Scenarios and Challenges', url: 'https://webview-cg.github.io/usage-and-challenges/' };

const androidWvToken = {
  id: 'detection-android-wv-token',
  category: 'detection',
  title: 'Android WebView user-agent token',
  refs: [REPORT_USAGE],
  run() {
    const ua = navigator.userAgent;
    const matches = /; ?wv\)/i.test(ua);
    if (matches) {
      return {
        status: STATUS.WARN,
        detected: true,
        summary: 'User-agent carries the Android System WebView "wv" token',
        detail: `User-agent: ${ua}`,
        signal: { label: 'webview', weight: 3 },
      };
    }
    return {
      status: STATUS.PASS,
      detected: false,
      summary: 'No Android "wv" token present',
      detail: `User-agent: ${ua}`,
    };
  },
};

const iosUaAmbiguity = {
  id: 'detection-ios-ua',
  category: 'detection',
  title: 'iOS WebView user-agent signature',
  refs: [REPORT_USAGE],
  run() {
    const ua = navigator.userAgent;
    const isAppleWebKit = /iPhone|iPad|iPod|Macintosh/.test(ua) && /AppleWebKit/.test(ua);
    if (!isAppleWebKit) {
      return {
        status: STATUS.INFO,
        summary: 'Not an Apple WebKit platform user-agent — this check does not apply',
        detail: `User-agent: ${ua}`,
      };
    }
    return {
      status: STATUS.INFO,
      detected: null,
      summary: 'Cannot be determined — iOS does not expose a reliable WKWebView user-agent signature',
      detail:
        'On Apple platforms a WKWebView-based in-app browser can present a user-agent nearly identical to Safari\'s. ' +
        'This check cannot reliably distinguish a WKWebView from Safari from the user-agent string alone — see the ' +
        'platform inconsistencies documented in the Usage Scenarios and Challenges report.',
    };
  },
};

const displayMode = {
  id: 'detection-display-mode',
  category: 'detection',
  title: 'Standalone / app-like display mode',
  refs: [REPORT_USAGE],
  run() {
    const modes = ['standalone', 'fullscreen', 'minimal-ui'];
    const active = modes.find((m) => window.matchMedia && window.matchMedia(`(display-mode: ${m})`).matches);
    if (active) {
      return {
        status: STATUS.WARN,
        detected: true,
        summary: `Page is running in "${active}" display mode`,
        detail:
          'This mode is also used by installed PWAs, so on its own it is a weak signal — combine it with the bridge ' +
          'and browser-chrome checks below.',
        signal: { label: 'webview', weight: 1 },
      };
    }
    return {
      status: STATUS.PASS,
      detected: false,
      summary: 'Page is running in a normal browser tab display mode',
      detail: '',
    };
  },
};

export default [androidWvToken, iosUaAmbiguity, displayMode];
