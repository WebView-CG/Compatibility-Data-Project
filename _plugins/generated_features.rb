require 'httparty'
require 'json'

module Generated
    class FeaturesGenerator < Jekyll::Generator
      safe true

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

	  def generate_bcd_from_section(site, section, timestamp, category, appended_title = "")
		section.keys.each do |title|
			# We skip potential special keys since we can iterate over sub sections
			next unless title.index("__") != 0

			feature = section[title]

			title = "#{appended_title}#{title}"
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
			doc.data['links'] = feature["__compat"].key?("mdn_url") ? {
				"MDN reference" => feature["__compat"]["mdn_url"]
			} : {}
			doc.data['stats'] = {
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

			site.collections['generated_features'].docs << doc
		end
	  end

	  def generate_bcd(site)
		version = File.read("bcd_version")
        bcd = HTTParty.get("http://unpkg.com/@mdn/browser-compat-data@#{version}/data.json").body
        parsed_bcd = JSON.parse(bcd)

		timestamp = parsed_bcd['__meta']['timestamp']

		generate_bcd_from_section(site, parsed_bcd['api'],
				timestamp, "js")
		generate_bcd_from_section(site, parsed_bcd['javascript']['builtins'],
				timestamp, "js", "JavaScript built-in: ")
		generate_bcd_from_section(site, parsed_bcd['html']['elements'],
				timestamp, "html", "HTML element: ")
		generate_bcd_from_section(site, parsed_bcd['html']['global_attributes'],
				timestamp, "html", "HTML attribute: ")
		generate_bcd_from_section(site, parsed_bcd['manifests']['webapp'],
				timestamp, "html", "HTML manifest: ")
		generate_bcd_from_section(site, parsed_bcd['css']['selectors'],
				timestamp, "css", "CSS selector: ")
		generate_bcd_from_section(site, parsed_bcd['css']['properties'],
				timestamp, "css", "CSS property: ")
		generate_bcd_from_section(site, parsed_bcd['http']['headers'],
				timestamp, "http", "HTTP header: ")
		generate_bcd_from_section(site, parsed_bcd['http']['status'],
				timestamp, "http", "HTTP status code: ")

		# The css types can have sub fields so we iterate over these and then
		# generate sections.
		parsed_bcd['css']['types'].keys.each do |type|
			generate_bcd_from_section(site, parsed_bcd['css']['types'][type],
				timestamp, "css", "CSS type: #{type}: ")
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
