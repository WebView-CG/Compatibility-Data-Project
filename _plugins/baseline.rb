# The utility code to compute baseline is distributed through node
# so the easiest thing for us to do is rather calculate this in
# node and then process it in jekyll

module Baseline
	def self.process(site, payload)
	  return if @processed
	  system "npm run baseline"
	  @processed = true
	end
  end

  Jekyll::Hooks.register :site, :after_init do |site, payload|
	Baseline.process(site, payload)
  end
