require 'httparty'
require 'json'

module SamplePlugin
    class GenfeaturesGenerator < Jekyll::Generator
      safe true
  
      def generate(site)
        version = File.read("bcd_version")
        bcd = HTTParty.get("http://unpkg.com/@mdn/browser-compat-data@#{version}/data.json").body
        parsed_bcd = JSON.parse(bcd)

        def getVersions(feature, platform)
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

        parsed_bcd['api'].keys.each do |title|
          feature = parsed_bcd['api'][title]          

          slug = title.downcase.strip.gsub('_', '-')
          path = site.in_source_dir("_genfeatures/#{slug}.md")
          doc = Jekyll::Document.new(path, {
            :site => site,
            :collection => site.collections['genfeatures'],
          })

          doc.data['title'] = title.gsub('-', ' ')
          doc.data['slug'] = slug
          doc.data['description'] = feature["__compat"].key?("mdn_url") ?
            "Read more about this API on [mdn](#{feature["__compat"]["mdn_url"]})."
            : "TODO"
          doc.data['category'] = 'webapi'
          doc.data['keywords'] = 'todo'
          doc.data['last_test_date'] = parsed_bcd['__meta']['timestamp']
          doc.data['notes'] = 'Data retrieve from BCD.'
          doc.data['links'] = []
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
    end

  end