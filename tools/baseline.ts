import { computeBaseline, coreBrowserSet } from "compute-baseline";
import { Compat } from 'compute-baseline/browser-compat-data';
import { features } from "web-features";
import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';
import fetch from 'node-fetch';

const bcdVersion = readFileSync("bcd_version").toString();

type WebViewStatus = boolean | "high" | "low" | "unknown";

const getYml = (
	name: string,
	description: string,
	baseline: boolean | "high" | "low",
	webviewBaseline: WebViewStatus) =>
`- name: "${name.replaceAll('"', "'")}"
  description: "${description.replaceAll('"', "'")}"
  supported:
    baseline: ${baseline}
    webviewBaseline: ${webviewBaseline}
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
		coreBrowserSet.push("webview_ios");
		coreBrowserSet.push("webview_android");

		let baseline = "";

		for (const key in features) {
			const feature = features[key];
			let webviewBaseline: WebViewStatus = "unknown";

			try {
				const computedStatus = computeBaseline({
					compatKeys: feature.compat_features as [string, ...string[]],
					checkAncestors: true,
				}, compat);
				webviewBaseline = computedStatus.baseline;
			} catch (e) {
				// For cases where we couldn't comput this, we will
				// fall back to "unknown".
				// We should hunt down these cases and bring the
				// list of impacted features down.
				console.warn("[Baseline] Failed to generate", key)
			}

			baseline += getYml(
				feature.name,
				feature.description,
				feature.status.baseline,
				webviewBaseline);
		}

		writeFile(`_data/baseline.yml`, baseline);
	})
