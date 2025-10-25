import { computeBaseline, coreBrowserSet, getStatus } from "compute-baseline";
import { Compat } from 'compute-baseline/browser-compat-data';
import { features } from "web-features";
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { stdout } from "process";
import { FeatureData } from "web-features/types.quicktype";

const bcdVersion = readFileSync("bcd_version").toString();

type WebViewStatus = boolean | "high" | "low" | "unknown";

// First pull the bcd data from the CDN so that we can fix our
// results to our hard coded bcd version rather than the data in the
// web features repo.
fetch(`http://unpkg.com/@mdn/browser-compat-data@${bcdVersion}/data.json`)
	.then(response => response.json())
	.then(bcd => {
		const compat = new Compat(bcd);

		// The core browser set is the set of browsers used to define
		// the baseline status. We can be a bit cheeky here and just
		// grab the publicly exposed list reference to add the webviews
		// in bcd to that definition.
		coreBrowserSet.push("webview_ios");
		coreBrowserSet.push("webview_android");

		const baseline = [];
		const failed = [];

		for (const key in features) {
			let feature: FeatureData = features[key];

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
				const computed = computeBaseline({
					compatKeys: feature.compat_features as [string, ...string[]],
					checkAncestors: true,
				}, compat);
				last_test_date = computed.baseline_low_date;
				const computedStatus = JSON.parse(computed.toJSON());
				webviewBaseline = computedStatus.baseline;
				const setVersion = (platform, sub, support) => {
					if (support) {
						stats[platform][sub] = {
							[support]: 'y'
						};
					} else {
						// The feature is not fully baseline but some keys might not apply to baseline
						// Therefore we check if any features are suported and then assume partial support
						// We then show the list on the site for further review

						// Use getStatus to check every key
						let anySupported = false;
						const supportedKeys = [];
						const unsupportedKeys = [];
						for (const compatKey of feature.compat_features as [string, ...string[]]) {
							const status = getStatus(feature.name, compatKey, compat);
							if (status.support && status.support["webview_" + sub]) {
								anySupported = true;
								supportedKeys.push(compatKey);
							} else {
								unsupportedKeys.push(compatKey);
							}
						}
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
					computedStatus.support.webview_ios);
				setVersion('androidwebview', 'android',
					computedStatus.support.webview_android);
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
	});
