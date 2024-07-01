module Jekyll
	module AssetFilter
	  def map_features(input)
		input.map { |feature|
			{
				"slug" => feature["slug"],
				"title" => feature["title"].strip,
				"keywords" => feature["keywords"],
				"category" => feature["category"],
			}
		}
	  end
	end
end

Liquid::Template.register_filter(Jekyll::AssetFilter)
