# WebView Compatibility Data Project

The WebView Compatibility Data Project is an initiative driven by the [WebView CG](https://www.w3.org/community/webview/)
to [make machine-readable data more readily available for documentation platforms and other tools
](https://github.com/WebView-CG/charter/blob/04422d7cb3ecc80a7d0f6755135995a74deab64b/charter.md?plain=1#L26).

## Development

Prerequisites:
- Node
- Jekyll

Setup:
- `npm install`
- `bundle install`

Run the project:
- `bundle exec jekyll serve --baseurl=""`

## Sub-projects

The compatibility data project has been split into two further sub-projects:

- Web platform compatibility data
- Behavioral compatibility

### Web platform compatibility data

This is our effort to improve existing web platform compat data for WebViews.
We are currently focused on improving support in
[BCD](https://github.com/mdn/browser-compat-data) and
[web features](https://github.com/web-platform-dx/web-features/tree/main).

### WebView behavioral "Feature" data

The goal of this work stream is to collate the various behavioral differences between WebViews that cannot be captured
in existing web compatibility data sources.

You can check out the [scope and timeline](/_features/README.md) and document behavior using [this template](/_features_/template.md).
