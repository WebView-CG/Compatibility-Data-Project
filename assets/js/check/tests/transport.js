import { STATUS, withTimeout } from './registry.js';

const REPORT_TLS = {
  label: '§6.1.1 & §6.1.4 Host Control / TLS and Mixed Content — Security Considerations for WebViews',
  url: 'https://webview-cg.github.io/webview-security/',
};

function probeFetch(url, timeoutMs = 5000) {
  const attempt = fetch(url, { mode: 'no-cors', cache: 'no-store', redirect: 'follow' })
    .then(() => 'reached')
    .catch(() => 'blocked');
  return withTimeout(attempt, timeoutMs, 'timeout');
}

const secureContext = {
  id: 'transport-secure-context',
  category: 'transport',
  title: 'Secure context / page protocol',
  refs: [REPORT_TLS],
  run() {
    if (location.protocol === 'file:') {
      return {
        status: STATUS.INFO,
        summary: 'Page loaded from a local file:// origin',
        detail: 'The mixed-content probe below does not apply to file:// origins.',
      };
    }
    if (window.isSecureContext && location.protocol === 'https:') {
      return { status: STATUS.PASS, summary: 'Page is loaded over HTTPS in a secure context', detail: `Protocol: ${location.protocol}` };
    }
    return {
      status: STATUS.WARN,
      summary: 'Page is not in a secure context',
      detail: `Protocol: ${location.protocol}, isSecureContext: ${window.isSecureContext}`,
    };
  },
};

function tlsProbe(host) {
  return {
    id: `transport-tls-${host}`,
    category: 'transport',
    title: `TLS validation — ${host}`,
    refs: [REPORT_TLS],
    async run() {
      const result = await probeFetch(`https://${host}/`);
      if (result === 'reached') {
        return {
          status: STATUS.FAIL,
          summary: `A request to ${host} (deliberately invalid certificate) succeeded`,
          detail:
            'The environment appears to accept an invalid TLS certificate. A correctly configured browser or ' +
            'WebView should refuse this connection outright, since accepting it enables man-in-the-middle attacks.',
        };
      }
      if (result === 'blocked') {
        return {
          status: STATUS.PASS,
          summary: `Request to ${host} was correctly rejected`,
          detail: 'The deliberately invalid certificate was not accepted.',
        };
      }
      return {
        status: STATUS.INFO,
        summary: `Request to ${host} timed out`,
        detail: 'Inconclusive — this can also happen when the network blocks the test domain outright.',
      };
    },
  };
}

const mixedContent = {
  id: 'transport-mixed-content',
  category: 'transport',
  title: 'Mixed content (plain HTTP from an HTTPS page)',
  refs: [REPORT_TLS],
  async run() {
    if (location.protocol !== 'https:') {
      return { status: STATUS.INFO, summary: 'Skipped — this page was not loaded over HTTPS', detail: '' };
    }
    const result = await probeFetch('http://neverssl.com/');
    if (result === 'reached') {
      return {
        status: STATUS.WARN,
        summary: 'A plain HTTP request from this HTTPS page succeeded',
        detail:
          'Mixed content should normally be blocked automatically once a page is served over HTTPS. The host app ' +
          'may have relaxed this restriction, allowing unencrypted traffic to be intercepted or modified.',
      };
    }
    if (result === 'blocked') {
      return { status: STATUS.PASS, summary: 'Mixed HTTP content was blocked as expected', detail: '' };
    }
    return { status: STATUS.INFO, summary: 'Mixed content probe timed out', detail: 'Inconclusive.' };
  },
};

export default [secureContext, tlsProbe('expired.badssl.com'), tlsProbe('self-signed.badssl.com'), mixedContent];
