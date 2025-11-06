import { features, type FeatureDataPlusWebview } from "web-features-plus-webview";
import { stdout } from "process";

type WebViewStatus = boolean | "high" | "low" | "unknown";

const baseline = [];
const failed = [];

for (const key in features) {
	let feature: FeatureDataPlusWebview = features[key];

	if (feature.kind === 'moved') {
		//console.info('[Baseline] Feature has moved to following redirect.', key, feature.redirect_target);
		feature = features[feature.redirect_target];
	}

	if (feature.kind == 'split') {
		// Skip split features for now
		continue
	}

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
		webviewBaseline = feature.webview_support.all;
		const setVersion = (platform, sub, support) => {
			if (support) {
				stats[platform][sub] = {
					[support]: 'y'
				};
			} else {
				// The feature is not fully baseline but some keys might not apply to baseline
				let anySupported = false;
				const unsupportedKeys = feature.webview_support[`${platform}_unsupported_compat_features`];
				if (anySupported) {
					stats[platform][sub] = {
						"*": 'a',
					};
					notes[platform] = unsupportedKeys.join(', ');
				} else {
					stats[platform][sub] = {
						"u": 'n'
					};
				}
			}
		}

		setVersion('wkwebview', 'ios',
			feature.webview_support.ios);
		setVersion('androidwebview', 'android',
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
			baseline: feature.status.baseline,
		}
	});
}

if (failed.length) {
	console.warn("[Baseline] Failed to generate", failed.join(', '));
}

// Return the results back to the caller jekyll plugin
stdout.write(JSON.stringify(baseline));