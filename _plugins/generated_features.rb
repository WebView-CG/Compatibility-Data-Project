require 'httparty'
require 'json'
require 'time'

module Generated
    class FeaturesGenerator < Jekyll::Generator
      safe true

	  def getBugTrackerLabel(url)
		if url.include?('crbug.com') || url.include?('bugs.chromium.org')
			"Chromium issue tracker"
		elsif url.include?('webkit.org') || url.include?('bugs.webkit.org')
			"WebKit issue tracker"
		elsif url.include?('bugzil.la') || url.include?('bugzilla.mozilla.org')
			"Firefox issue tracker"
		else
			"Issue tracker"
		end
	  end

	  def getImplUrls(feature)
		platforms = ['webview_ios', 'webview_android', 'chrome_android', 'safari_ios']
		urls = []

		platforms.each do |platform|
			next unless feature['__compat']['support'].key?(platform)
			support = feature['__compat']['support'][platform]
			entries = support.kind_of?(Array) ? support : [support]
			entries.each do |entry|
				next unless entry.kind_of?(Hash) && entry.key?('impl_url')
				url_list = entry['impl_url'].kind_of?(Array) ? entry['impl_url'] : [entry['impl_url']]
				urls.concat(url_list)
			end
		end

		urls.uniq!
		tracker_counts = Hash.new(0)
		result = {}
		urls.each do |url|
			base_label = getBugTrackerLabel(url)
			tracker_counts[base_label] += 1
			count = tracker_counts[base_label]
			label = count > 1 ? "#{base_label} (#{count})" : base_label
			result[label] = url
		end
		result
	  end

	  def getVersions(feature, platform)
		if !feature['__compat']["support"].key?(platform) then
			return {
				"*" => "n"
			}
		end

		if (feature['__compat']["support"][platform].kind_of?(Array)) then
		  return feature['__compat']["support"][platform].map { |version|
		  if version["version_added"].kind_of?(String) then
				[version["version_added"], "y"]
		  else
				["unknown", "y"]
		  end
		  }.to_h
		end

		version = feature['__compat']["support"][platform]["version_added"]

		if version.class == FalseClass then
		  return {
			"*" => "n"
		  }
		end

		if version.class == TrueClass then
		  return {
			"*" => "y"
		  }
		end

		if version.nil? || version.empty?  then
			version = "unknown"
		end

		return {
		  version => "y"
		}
	  end

	  def parse_bcd_collector_results(parsed)
		# Raw mdn-bcd-collector output: results is keyed by test URL → array of
		# { exposure, name, result } entries. We only record Window-exposed results.
		bcd_map = {}
		return bcd_map unless parsed.key?('results')
		parsed['results'].each do |_url, tests|
			next unless tests.kind_of?(Array)
			tests.each do |test|
				next unless test['exposure'] == 'Window'
				key = test['name']
				next if bcd_map.key?(key)
				bcd_map[key] = test['result'] == true ? 'y' : 'n'
			end
		end
		bcd_map
	  end

	  def fetch_wpe_minibrowser_results
		distilled_url = "https://wpewebkit.org/wptreport-distilled-data/bcd_results-wpewebkit_minibrowser-nightly-tot.json"
		distilled = JSON.parse(HTTParty.get(distilled_url).body)
		metadata = distilled['metadata'] || {}
		source_urls = metadata['x_source_results_urls'] || []
		collector_url = source_urls.first
		return nil unless collector_url
		collector = JSON.parse(HTTParty.get(collector_url).body)
		version = if metadata['testrun_timestamp_end']
			Time.at(metadata['testrun_timestamp_end']).utc.strftime('%Y-%m-%d')
		else
			'latest'
		end
		{
			'results' => parse_bcd_collector_results(collector),
			'version' => version,
			'source_url' => 'https://wpewebkit.org/wpt-status/?src=BCD',
		}
	  rescue => e
		Jekyll.logger.warn "webview-bcd-results:", "Failed to fetch WPE results: #{e.message}"
		nil
	  end

	  def extract_version_from_results(file_name)
		# Date embedded in filename (e.g. latest-servo-2026-03-27.json)
		file_name =~ /(\d{4}-\d{2}-\d{2})/ ? $1 : nil
	  end

	  def fetch_latest_webview_results
		results = {}

		# WPE MiniBrowser: fetch the distilled data published by the WPE project,
		# then download the raw mdn-bcd-collector results it points to.
		wpe = fetch_wpe_minibrowser_results
		results['wpe_minibrowser'] = wpe if wpe

		# Servo and any other latest-* files come from the WebView-CG repo.
		api_url = "https://api.github.com/repos/WebView-CG/webview-bcd-results/contents/results"

		supported_engines = {
			'servo' => 'latest-servo',
			'arkweb' => 'latest-arkweb' 
		}
		
		response = HTTParty.get(api_url, headers: { "User-Agent" => "CanIWebView-build" })
		files = JSON.parse(response.body)
		files.each do |file|
			name = file['name']

			engine_key = supported_engines.find { |_, prefix| name.start_with?(prefix) }&.first
  			next unless engine_key 
			begin
				content = HTTParty.get(file['download_url']).body
				parsed = JSON.parse(content)
				version = extract_version_from_results(name) || 'latest'
				results[engine_key] = {
					'results' => parse_bcd_collector_results(parsed),
					'version' => version,
					'source_url' => file['html_url'],
				}
			rescue => e
				Jekyll.logger.warn "webview-bcd-results:", "Failed to process #{name}: #{e.message}"
			end
		end
		results
	  rescue => e
		Jekyll.logger.warn "webview-bcd-results:", "Failed to fetch latest results: #{e.message}"
		{}
	  end

	  def generate_bcd_from_section(site, section, timestamp, category, appended_title = "", bcd_prefix = "", latest_results = {})
		section.keys.each do |key|
			# We skip potential special keys since we can iterate over sub sections
			next unless key.index("__") != 0

			feature = section[key]

			bcd_key = bcd_prefix.empty? ? key : "#{bcd_prefix}.#{key}"
			title = "#{appended_title}#{key}"
			slug = "mdn-#{title.downcase.strip.gsub('-', '').gsub(/[\_|\s]/, '-').gsub(':', '')}"
			path = site.in_source_dir("_generated_features/#{slug}.md")
			doc = Jekyll::Document.new(path, {
				:site => site,
				:collection => site.collections['generated_features'],
			})

			data_source = "Support data provided by: [![BCD logo](/assets/images/mdn-bcd.svg)](https://github.com/mdn/browser-compat-data)"

			doc.data['title'] = title
			doc.data['slug'] = slug
			doc.data['category'] = category
			doc.data['keywords'] = 'todo'
			doc.data['last_test_date'] = timestamp
			doc.data['notes'] = data_source
			links = feature["__compat"].key?("mdn_url") ? {
				"MDN reference" => feature["__compat"]["mdn_url"]
			} : {}
			impl_urls = getImplUrls(feature)
			doc.data['links'] = links.merge(impl_urls)
			doc.data['has_impl_urls'] = !impl_urls.empty?
			stats = {
				"wkwebview" => {
					"macos" => {
					"*" => "u"
					},
					"ios" => getVersions(feature, "webview_ios"),
				},
				"androidwebview" => {
					"android" => getVersions(feature, "webview_android")
				},
				"webview2" => {
					"windows" => {
					"*" => "u"
					}
				},
				"chrome_android" => {
					"android" => getVersions(feature, "chrome_android")
				},
				"safari_ios" => {
					"ios" => getVersions(feature, "safari_ios")
				}
			}
			latest_results.each do |client, data|
				platform = client == "wpe_minibrowser" ? "linux" : "android"
				platform = client == "arkweb" ? "harmonyos" : "android"
				support = data['results'].fetch(bcd_key, "u")
				version = data['version']
				stats[client] = { platform => { version => support } }
			end
			doc.data['stats'] = stats

			site.collections['generated_features'].docs << doc
		end
	  end

	  def generate_bcd(site)
		version = File.read("bcd_version").strip
        bcd = HTTParty.get("http://unpkg.com/@mdn/browser-compat-data@#{version}/data.json").body
        parsed_bcd = JSON.parse(bcd)

		timestamp = parsed_bcd['__meta']['timestamp']
		site.data['bcd_version'] = version

		latest_results = fetch_latest_webview_results()

		site.data['bcd_test_meta'] = latest_results

		generate_bcd_from_section(site, parsed_bcd['api'],
				timestamp, "js", "", "api", latest_results)
		generate_bcd_from_section(site, parsed_bcd['javascript']['builtins'],
				timestamp, "js", "JavaScript built-in: ", "javascript.builtins", latest_results)
		generate_bcd_from_section(site, parsed_bcd['html']['elements'],
				timestamp, "html", "HTML element: ", "html.elements", latest_results)
		generate_bcd_from_section(site, parsed_bcd['html']['global_attributes'],
				timestamp, "html", "HTML attribute: ", "html.global_attributes", latest_results)
		generate_bcd_from_section(site, parsed_bcd['manifests']['webapp'],
				timestamp, "html", "HTML manifest: ", "manifests.webapp", latest_results)
		generate_bcd_from_section(site, parsed_bcd['css']['selectors'],
				timestamp, "css", "CSS selector: ", "css.selectors", latest_results)
		generate_bcd_from_section(site, parsed_bcd['css']['properties'],
				timestamp, "css", "CSS property: ", "css.properties", latest_results)
		generate_bcd_from_section(site, parsed_bcd['http']['headers'],
				timestamp, "http", "HTTP header: ", "http.headers", latest_results)
		generate_bcd_from_section(site, parsed_bcd['http']['status'],
				timestamp, "http", "HTTP status code: ", "http.status", latest_results)

		# The css types can have sub fields so we iterate over these and then
		# generate sections.
		parsed_bcd['css']['types'].keys.each do |type|
			generate_bcd_from_section(site, parsed_bcd['css']['types'][type],
				timestamp, "css", "CSS type: #{type}: ", "css.types.#{type}", latest_results)
		end
	  end

	  def generate_baseline(site)
		# The web features "computeBaseline" code is distributed via npm
		# so it's easier to run this generation code in node
		# and then process the results back in this plugin for jekyll
		script_out = `npx tsx tools/baseline`

		baseline = JSON.parse(script_out)
		baseline.each do |feature|
			path = site.in_source_dir("_generated_features/#{feature['slug']}.md")
			doc = Jekyll::Document.new(path, {
				:site => site,
				:collection => site.collections['generated_features'],
			})

			data_source = "WebViews are not part of [Baseline](https://web-platform-dx.github.io/baseline/) [![Baseline logo](/assets/images/baseline.svg)](https://github.com/NiklasMerz/web-features-plus-webview) We do web-features computation using [web-features-plus-webview](https://github.com/NiklasMerz/web-features-plus-webview)"

			doc.data['title'] = "web-feature: " + feature['title']
			doc.data['description'] = feature['description']
			doc.data['slug'] = feature['slug']
			doc.data['category'] = feature['category']
			doc.data['keywords'] = 'baseline'
			doc.data['last_test_date'] = feature['last_test_date']
			doc.data['notes'] = data_source
			doc.data['links'] = feature['links']
			doc.data['stats'] = feature['stats']
			doc.data['notes_by_num'] = feature['notes_by_num']
			doc.data['baseline'] = feature['baseline']

			site.collections['generated_features'].docs << doc
		end
	  end

      def generate(site)
        generate_bcd(site)
		generate_baseline(site)
      end
    end

  end
