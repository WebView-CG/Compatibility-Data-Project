import { runAll, computeVerdict } from './tests/registry.js';
import detectionTests from './tests/detection.js';
import bridgeTests from './tests/bridge.js';
import transportTests from './tests/transport.js';
import chromeUiTests from './tests/chrome-ui.js';
import storagePermissionsTests from './tests/storage-permissions.js';

const CATEGORIES = {
  detection: {
    title: 'WebView Detection',
    description: 'Heuristics for whether this page is running inside a WebView at all.',
  },
  bridge: {
    title: 'Native Bridge Exposure',
    description: 'Native bridge objects that let the host app inject or execute privileged code in this page.',
  },
  transport: {
    title: 'Transport Security',
    description: 'Whether TLS validation and mixed-content protections are actually enforced.',
  },
  'chrome-ui': {
    title: 'Browser Chrome / Origin Visibility',
    description: 'Whether the user can see which origin and TLS status they are interacting with.',
  },
  'storage-permissions': {
    title: 'Storage & Permissions',
    description: 'Availability of storage and permission APIs, and tracking-protection transparency.',
  },
};

const STATUS_ICON = { pass: '✅', warn: '⚠️', fail: '❌', info: 'ℹ️' };
const STATUS_LABEL = { pass: 'Pass', warn: 'Warning', fail: 'Fail', info: 'Info' };

const VERDICT_COPY = {
  webview: { title: 'Likely running in a WebView', className: 'verdict-warn' },
  browser: { title: 'Likely a regular browser', className: 'verdict-pass' },
  uncertain: { title: 'Uncertain', className: 'verdict-info' },
};

let lastResults = [];

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderBanner(verdict, results) {
  const banner = document.getElementById('verdict-banner');
  const copy = VERDICT_COPY[verdict.verdict];
  const counts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const contributing = results.filter((r) => r.signal);
  const signalList = contributing
    .map((r) => {
      const sign = r.signal.label === 'webview' ? '+' : '−';
      return `<li>${sign}${r.signal.weight} (toward ${escapeHtml(r.signal.label)}) — ${escapeHtml(r.title)}: ${escapeHtml(r.summary)}</li>`;
    })
    .join('');

  banner.className = `verdict-banner ${copy.className}`;
  banner.innerHTML = `
    <h2>${copy.title}</h2>
    ${
      contributing.length
        ? `<details class="verdict-basis">
            <summary>Based on ${contributing.length} signal${contributing.length === 1 ? '' : 's'} (net score: ${verdict.score})</summary>
            <ul>${signalList}</ul>
          </details>`
        : ''
    }
    <p class="verdict-counts">${counts.fail || 0} failed, ${counts.warn || 0} warnings, ${counts.pass || 0} passed, ${counts.info || 0} informational.</p>
  `;
}

function detectedBadge(item) {
  if (item.detected === undefined) return '';
  const cls = item.detected === true ? 'detected-true' : item.detected === false ? 'detected-false' : 'detected-unknown';
  const label = item.detected === true ? 'Detected: Yes' : item.detected === false ? 'Detected: No' : 'Detected: Unknown';
  return `<span class="detected-badge ${cls}">${label}</span> `;
}

function renderTestItem(item) {
  const li = document.createElement('li');
  li.className = `test-item status-${item.status}`;

  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.innerHTML =
    `<span class="check-icon" aria-hidden="true">${STATUS_ICON[item.status]}</span> ` +
    `<span class="test-title">${escapeHtml(item.title)}</span> ` +
    `${detectedBadge(item)}` +
    `— ${escapeHtml(item.summary)}`;
  details.appendChild(summary);

  if (item.detail) {
    const detail = document.createElement('p');
    detail.className = 'test-detail';
    detail.textContent = item.detail;
    details.appendChild(detail);
  }

  if (item.refs && item.refs.length) {
    const refs = document.createElement('p');
    refs.className = 'test-refs';
    refs.innerHTML =
      'Reference: ' +
      item.refs.map((r) => `<a href="${r.url}" target="_blank" rel="noopener">${escapeHtml(r.label)}</a>`).join(', ');
    details.appendChild(refs);
  }

  li.appendChild(details);
  return li;
}

function renderCategories(results) {
  const container = document.getElementById('report');
  container.innerHTML = '';

  for (const [key, meta] of Object.entries(CATEGORIES)) {
    const items = results.filter((r) => r.category === key);
    if (!items.length) continue;

    const section = document.createElement('section');
    section.className = 'category';

    const heading = document.createElement('h3');
    heading.textContent = meta.title;
    section.appendChild(heading);

    const desc = document.createElement('p');
    desc.className = 'category-desc';
    desc.textContent = meta.description;
    section.appendChild(desc);

    const list = document.createElement('ul');
    list.className = 'test-list';
    items.forEach((item) => list.appendChild(renderTestItem(item)));
    section.appendChild(list);

    container.appendChild(section);
  }
}

function reportAsText() {
  const lines = lastResults.map((r) => `[${STATUS_LABEL[r.status]}] (${r.category}) ${r.title}: ${r.summary}`);
  return [`WebView Check report — ${location.href}`, `User-Agent: ${navigator.userAgent}`, '', ...lines].join('\n');
}

async function main() {
  const results = await runAll([
    detectionTests,
    bridgeTests,
    transportTests,
    chromeUiTests,
    storagePermissionsTests,
  ]);
  lastResults = results;
  const verdict = computeVerdict(results);

  renderBanner(verdict, results);
  renderCategories(results);
}

document.getElementById('copy-report').addEventListener('click', async () => {
  const button = document.getElementById('copy-report');
  try {
    await navigator.clipboard.writeText(reportAsText());
    button.textContent = 'Copied!';
  } catch (err) {
    button.textContent = 'Copy failed — clipboard unavailable';
  }
  setTimeout(() => {
    button.textContent = 'Copy report';
  }, 2000);
});

main();
