require 'httparty'
require 'json'

module SamplePlugin
    class GenfeaturesGenerator < Jekyll::Generator
      safe true

	  def getVersions(feature, platform)
		if !feature['__compat']["support"].key?(platform) then
			return {
				"*" => "n"
			}
		end

		if (feature['__compat']["support"][platform].kind_of?(Array)) then
		  return feature['__compat']["support"][platform].map { |version|
			[version["version_added"], "y"]
		  }.to_h
		end

		version = feature['__compat']["support"][platform]["version_added"]

		if version.class == FalseClass then
		  return {
			"*" => "n"
		  }
		end

		return {
		  version => "y"
		}
	  end

	  def generate_from_section(site, section, timestamp, appended_title = "")
		section.keys.each do |title|
			feature = section[title]

			title = "#{appended_title}#{title}"
			slug = "mdn-#{title.downcase.strip.gsub('-', '').gsub(/[\_|\s]/, '-').gsub(':', '')}"
			path = site.in_source_dir("_genfeatures/#{slug}.md")
			doc = Jekyll::Document.new(path, {
				:site => site,
				:collection => site.collections['genfeatures'],
			})

			data_source = "Support data provided by: [![BCD logo](/assets/images/mdn-bcd.svg)](https://github.com/mdn/browser-compat-data)"

			doc.data['title'] = title
			doc.data['slug'] = slug
			doc.data['category'] = 'webapi'
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
					"ios" => {
					"*" => "u"
					},
					"ipados" => {
					"*" => "u"
					}
				},
				"androidwebview" => {
					"android" => getVersions(feature, "webview_android")
				},
				"webview2" => {
					"windows" => {
					"*" => "u"
					}
				}
			}

			site.collections['genfeatures'].docs << doc
		end

	  end

      def generate(site)
        version = File.read("bcd_version")
        bcd = HTTParty.get("http://unpkg.com/@mdn/browser-compat-data@#{version}/data.json").body
        parsed_bcd = JSON.parse(bcd)

		timestamp = parsed_bcd['__meta']['timestamp']

		generate_from_section(site, parsed_bcd['api'], timestamp)
		generate_from_section(site, parsed_bcd['html']['elements'], timestamp, "HTML element: ")
		generate_from_section(site, parsed_bcd['html']['global_attributes'], timestamp, "HTML attribute: ")
		generate_from_section(site, parsed_bcd['html']['manifest'], timestamp, "HTML manifest: ")
		generate_from_section(site, parsed_bcd['css']['selectors'], timestamp, "CSS selector: ")
		generate_from_section(site, parsed_bcd['css']['properties'], timestamp, "CSS property: ")
      end
    end

  end
