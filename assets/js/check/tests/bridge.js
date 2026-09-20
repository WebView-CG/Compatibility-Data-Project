import { STATUS } from './registry.js';

const REPORT_SOP = {
  label: '§6.1.2 Same Origin Policy Bypass — Security Considerations for WebViews',
  url: 'https://webview-cg.github.io/webview-security/',
};
const REPORT_BRIDGE = {
  label: '§8.3 Bridge Validation — Security Considerations for WebViews',
  url: 'https://webview-cg.github.io/webview-security/',
};

// Known native bridge globals. Detected by presence only — never invoked, since calling
// into a real bridge can trigger native side effects (camera, file pickers, navigation, ...).
const BRIDGES = [
  { path: ['webkit', 'messageHandlers'], name: 'window.webkit.messageHandlers', platform: 'WKWebView (iOS/macOS)' },
  { path: ['chrome', 'webview'], name: 'window.chrome.webview', platform: 'WebView2 (Windows)' },
  { path: ['Android'], name: 'window.Android', platform: 'common Android JS-interface name' },
  { path: ['ReactNativeWebView'], name: 'window.ReactNativeWebView', platform: 'React Native WebView' },
  { path: ['cordova'], name: 'window.cordova', platform: 'Apache Cordova' },
  { path: ['_cordovaNative'], name: 'window._cordovaNative', platform: 'Apache Cordova (Android bridge)' },
  { path: ['flutter_inappwebview'], name: 'window.flutter_inappwebview', platform: 'flutter_inappwebview plugin' },
  { path: ['Capacitor'], name: 'window.Capacitor', platform: 'Ionic Capacitor' },
  { path: ['__wxjs_environment'], name: 'window.__wxjs_environment', platform: 'WeChat embedded browser' },
];

function resolvePath(path) {
  let obj = window;
  for (const key of path) {
    if (obj == null || typeof obj !== 'object') return undefined;
    obj = obj[key];
  }
  return obj;
}

function bridgeTest(bridge) {
  return {
    id: `bridge-${bridge.name}`,
    category: 'bridge',
    title: bridge.name,
    refs: [REPORT_SOP, REPORT_BRIDGE],
    run() {
      const found = resolvePath(bridge.path) !== undefined;
      if (found) {
        return {
          status: STATUS.WARN,
          detected: true,
          summary: `${bridge.name} is exposed on this page (${bridge.platform})`,
          detail:
            'A native bridge object gives the host app a channel to inject and execute privileged code in this ' +
            'page\'s context, regardless of the page\'s own origin policy. This is expected in a hybrid app, but it ' +
            'means the host — not the page — controls what code can run here. This check only detects the object\'s ' +
            'presence and does not call it.',
          signal: { label: 'webview', weight: 4 },
        };
      }
      return {
        status: STATUS.PASS,
        detected: false,
        summary: `${bridge.name} not present`,
        detail: '',
      };
    },
  };
}

export default BRIDGES.map(bridgeTest);
