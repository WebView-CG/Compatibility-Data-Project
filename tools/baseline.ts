import { features, type FeatureDataPlusWebview } from "web-features-plus-webview";
import { stdout } from "process";

type WebViewStatus = boolean | "high" | "low" | "unknown";

const baseline = [];
const failed = [];

for (const key in features) {
	let feature: FeatureDataPlusWebview = features[key];

	let webviewBaseline: WebViewStatus = "unknown";
	// Default to today if unknown because that's when we "worked it out"
	let last_test_date = new Date().toISOString().split('T')[0];
	const stats = {
		wkwebview: {
			macos: {
				"*": "u"
			},
			ios: {
				"*": "u"
			}
		},
		androidwebview: {
			android: {
				"*": "u"
			}
		},
		webview2: {
			windows: {
				"*": "u"
			}
		},
		chrome_android: {
			android: {
				"*": "u"
			}
		},
		safari_ios: {
			ios: {
				"*": "u"
			}
		}
	};
	const notes = {};

	try {
		const fullStatus = feature.webview_support.all;

		if (fullStatus === 'supported') {
			webviewBaseline = true;
		} else {
			webviewBaseline = false;
		}

		const setVersionWebView = (platform, sub, support) => {
			if (support === 'supported') {
				stats[platform][sub] = {
					"*": 'y'
				};
			} else {
				// The feature is not fully baseline but some keys might not apply to baseline
				const unsupportedKeys = feature.webview_support[`${sub}_unsupported_compat_features`];
				if (support === 'partial') {
					stats[platform][sub] = {
						"*": 'a',
					};
					if (unsupportedKeys.length > 0) {
						notes[platform] = unsupportedKeys.join(', ');
					}
				} else {
					stats[platform][sub] = {
						"*": 'n'
					};
				}
			}
		}

		const setVersion = (platform, sub, support) => {
			if (support) {
				stats[platform][sub] = {
					[support]: 'y'
				};
			} else {
				stats[platform][sub] = {
					'*': 'n'
				}
			}
		}

		setVersionWebView('wkwebview', 'ios',
			feature.webview_support.ios);
		setVersionWebView('androidwebview', 'android',
			feature.webview_support.android);
		setVersion('chrome_android', 'android',
			feature.status.support.chrome_android);
		setVersion('safari_ios', 'ios',
			feature.status.support.safari_ios);
	} catch (e) {
		// For cases where we couldn't comput this, we will
		// fall back to "unknown".
		// We should hunt down these cases and bring the
		// list of impacted features down.
		console.warn("[Baseline] Failed to compute baseline for", key, e);
		failed.push(key);
	}

	if (!feature.name) {
		console.warn("[Baseline] Missing name for", key);
		continue;
	}

	baseline.push({
		title: feature.name,
		slug: 'web-feature-' + key,
		description: feature.description_html,
		category: 'web_feature',
		keywords: 'web-feature',
		last_test_date,
		stats,
		notes_by_num: notes,
		links: {},
		baseline: {
			webviewBaseline,
			baseline: feature.status?.baseline,
		}
	});
}

if (failed.length) {
	console.warn("[Baseline] Failed to generate", failed.join(', '));
}

// Return the results back to the caller jekyll plugin
stdout.write(JSON.stringify(baseline));