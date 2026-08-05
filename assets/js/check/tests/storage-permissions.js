import { STATUS } from './registry.js';

const REPORT_STORAGE = {
  label: '§6.1.6 Storage Handling — Security Considerations for WebViews',
  url: 'https://webview-cg.github.io/webview-security/',
};
const REPORT_TRACKING = {
  label: '§6.1.7 Anti-Tracking Measures — Security Considerations for WebViews',
  url: 'https://webview-cg.github.io/webview-security/',
};
const REPORT_PERMISSIONS = {
  label: '§6.1.5 Permissions Handling — Security Considerations for WebViews',
  url: 'https://webview-cg.github.io/webview-security/',
};

const cookiesEnabled = {
  id: 'storage-cookies-enabled',
  category: 'storage-permissions',
  title: 'Cookies enabled',
  refs: [REPORT_STORAGE],
  run() {
    if (navigator.cookieEnabled) {
      return { status: STATUS.PASS, summary: 'Cookies are enabled', detail: '' };
    }
    return { status: STATUS.INFO, summary: 'Cookies are disabled', detail: '' };
  },
};

const storageAccessApi = {
  id: 'storage-access-api',
  category: 'storage-permissions',
  title: 'Storage Access API availability',
  refs: [REPORT_TRACKING],
  run() {
    const available = 'hasStorageAccess' in document;
    return {
      status: STATUS.INFO,
      summary: available
        ? 'document.hasStorageAccess is available'
        : 'document.hasStorageAccess is not available',
      detail:
        'This only reports whether the API exists, not whether tracking protection is actually enforced — the ' +
        'report notes users generally have no visibility into whether a host app has disabled tracking prevention ' +
        '(e.g. via Android CookieManager) or whether iOS Intelligent Tracking Prevention is active.',
    };
  },
};

const PERMISSION_NAMES = ['geolocation', 'camera', 'microphone', 'notifications'];

const permissionsMatrix = {
  id: 'permissions-api-matrix',
  category: 'storage-permissions',
  title: 'Permissions API support matrix',
  refs: [REPORT_PERMISSIONS],
  async run() {
    if (!navigator.permissions || !navigator.permissions.query) {
      return {
        status: STATUS.INFO,
        summary: 'navigator.permissions is not available',
        detail: 'Permission state cannot be queried from script in this environment.',
      };
    }
    const results = await Promise.all(
      PERMISSION_NAMES.map(async (name) => {
        try {
          const status = await navigator.permissions.query({ name });
          return `${name}: queryable (state: ${status.state})`;
        } catch (err) {
          return `${name}: not queryable`;
        }
      })
    );
    return {
      status: STATUS.INFO,
      summary: 'Permissions API query support varies by platform',
      detail: results.join('; '),
    };
  },
};

export default [cookiesEnabled, storageAccessApi, permissionsMatrix];
