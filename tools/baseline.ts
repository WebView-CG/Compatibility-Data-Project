import { computeBaseline, coreBrowserSet } from "compute-baseline";
import { Compat } from 'compute-baseline/browser-compat-data';
import { features } from "web-features";
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import { stdout } from "process";

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
			const feature = features[key];
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
					},
					ipados: {
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
						stats[platform][sub] = {
							'*': 'n'
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
				failed.push(key);
			}

			baseline.push({
				title: feature.name,
				slug: 'web-feature-' + key,
				description: feature.description_html,
				category: 'web_feature',
				keywords: '',
				last_test_date,
				stats,
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
