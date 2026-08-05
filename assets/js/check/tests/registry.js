export const STATUS = { PASS: 'pass', WARN: 'warn', FAIL: 'fail', INFO: 'info' };

export function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function runAll(testGroups) {
  const tests = testGroups.flat();
  const results = [];
  for (const test of tests) {
    let outcome;
    try {
      outcome = await test.run();
    } catch (err) {
      outcome = { status: STATUS.INFO, summary: 'Check failed to run', detail: String((err && err.message) || err) };
    }
    results.push({
      id: test.id,
      category: test.category,
      title: test.title,
      refs: test.refs || [],
      ...outcome,
    });
  }
  return results;
}

export function computeVerdict(results) {
  let score = 0;
  for (const r of results) {
    if (!r.signal) continue;
    score += r.signal.label === 'webview' ? r.signal.weight : -r.signal.weight;
  }
  let verdict = 'uncertain';
  if (score >= 3) verdict = 'webview';
  else if (score <= -2) verdict = 'browser';
  return { score, verdict };
}
