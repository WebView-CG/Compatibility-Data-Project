import { computeBaseline, coreBrowserSet } from "compute-baseline";
import { Compat } from 'compute-baseline/browser-compat-data';
import { features } from "web-features";
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';

const bcdVersion = readFileSync("bcd_version").toString();

type WebViewStatus = boolean | "high" | "low" | "unknown";
type ReleaseVersion = number | "unknown";

const getYml = (
	name: string,
	description: string,
	baseline: boolean | "high" | "low",
	webviewBaseline: WebViewStatus,
	ios: ReleaseVersion,
	android: ReleaseVersion) =>
	`- name: "${name.replaceAll('"', "'")}"
  description: "${description.replaceAll('"', "'")}"
  supported:
    Baseline: ${baseline}
    "WebView Baseline": ${webviewBaseline}
    WKWebView: ${ios}
    Android WebView: ${android}
`;

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
		// Currently making this a WebView specific baseline by clearing
		// other browsers but we can revisit this choice.
		coreBrowserSet.splice(0, coreBrowserSet.length);
		coreBrowserSet.push("webview_ios");
		coreBrowserSet.push("webview_android");

		let baseline = "";

		for (const key in features) {
			const feature = features[key];
			let webviewBaseline: WebViewStatus = "unknown";
			let ios: ReleaseVersion = "unknown";
			let android: ReleaseVersion = "unknown";

			try {
				const computedStatus = JSON.parse(
					computeBaseline({
						compatKeys: feature.compat_features as [string, ...string[]],
						checkAncestors: true,
					}, compat).toJSON()
				);
				webviewBaseline = computedStatus.baseline;

				ios = computedStatus.support.webview_ios ?? false;
				android = computedStatus.support.webview_android ?? false;
			} catch (e) {
				// For cases where we couldn't comput this, we will
				// fall back to "unknown".
				// We should hunt down these cases and bring the
				// list of impacted features down.
				console.warn("[Baseline] Failed to generate", key);
			}

			baseline += getYml(
				feature.name,
				feature.description,
				feature.status.baseline,
				webviewBaseline,
				ios,
				android);
		}

		writeFile(`_data/baseline.yml`, baseline);
	});
