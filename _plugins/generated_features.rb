require 'httparty'
require 'json'

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
			version = "unkonwn"
		end

		return {
		  version => "y"
		}
	  end

	  def parse_wpe_results(parsed)
		bcd_map = {}
		return bcd_map unless parsed.key?('results')
		parsed['results'].each do |bcd_key, data|
			next unless data.kind_of?(Hash) && data.key?('pass')
			bcd_map[bcd_key] = data['pass'].include?('Window') ? 'y' : 'n'
		end
		bcd_map
	  end

	  def parse_servo_results(parsed)
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

	  def try_fix_truncated_json(content)
		# If a file is truncated mid-JSON, find the last complete entry (ends with },\n)
		# and close the results object and root object after it.
		last_complete = content.rindex(/\},\s*\n/)
		return nil unless last_complete
		fixed = content[0...last_complete + 1] + "\n }\n}"
		JSON.parse(fixed)
	  rescue JSON::ParserError
		nil
	  end

	  def fetch_latest_webview_results
		api_url = "https://api.github.com/repos/WebView-CG/webview-bcd-results/contents/results"
		response = HTTParty.get(api_url, headers: { "User-Agent" => "CanIWebView-build" })
		files = JSON.parse(response.body)
		results = {}
		files.each do |file|
			name = file['name']
			next unless name.start_with?('latest-')
			next if name == 'latest-android.json'
			begin
				content = HTTParty.get(file['download_url']).body
				parsed = begin
					JSON.parse(content)
				rescue JSON::ParserError
					Jekyll.logger.warn "webview-bcd-results:", "#{name} appears truncated, attempting partial parse"
					try_fix_truncated_json(content)
				end
				next unless parsed
				if name.start_with?('latest-wpewebkit')
					results['wpe_minibrowser'] = parse_wpe_results(parsed)
				elsif name.start_with?('latest-servo')
					results['servo'] = parse_servo_results(parsed)
				end
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
				},
			}
			latest_results.each do |client, result_map|
				platform = client == "wpe_minibrowser" ? "linux" : "android"
				support = result_map.fetch(bcd_key, "u")
				stats[client] = { platform => { "latest" => support } }
			end
			doc.data['stats'] = stats

			site.collections['generated_features'].docs << doc
		end
	  end

	  def generate_bcd(site)
		version = File.read("bcd_version")
        bcd = HTTParty.get("http://unpkg.com/@mdn/browser-compat-data@#{version}/data.json").body
        parsed_bcd = JSON.parse(bcd)

		timestamp = parsed_bcd['__meta']['timestamp']

		latest_results = fetch_latest_webview_results()

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

			# TODO:
			data_source = "Support data provided by: [![BCD logo](/assets/images/mdn-bcd.svg)](https://github.com/mdn/browser-compat-data)"

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
