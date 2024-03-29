---
title: "Localhost"
description: "A lot of apps are built using hybrid app development frameworks that use one big WebView for providing app developers a native wrapper and some plugins for their Web app. The web content is often bundled and served within the native app. For a couple of reasons using the `file:` protocol to access web content is no longer an option and WebViews provide APIs to host content.

See more in [usage and challenges](https://webview-cg.github.io/usage-and-challenges/#the-origin-in-a-webview-for-locally-hosted-content)."
category: API
keywords: hybrid
last_test_date: "2024-03-29"
notes: "Behavior description based on experiene with the Apache Cordova app framework"
links: {
    "WKURLSchemehandler": "https://developer.apple.com/documentation/webkit/wkurlschemehandler",
    "WebViewAssetLoader": "https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader"
}
---
# How does it work on each WebView?

## WebView2

TODO: Complete me!

## WKWebView

iOS lets you implement a custom URL scheme like myapp://mycode, and you can access the HTTP request and response quite freely to implement custom logic around that. This is called WKURLSchemehandler.

## Android WebView

Android has WebViewAssetLoader that lets you create a "fake" domain to serve files to the WebView. Therefore, you can access local files via https://myappcode/index.html for example. [WebViewAssetLoader](https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader) only allows you to serve GET requests and access to the HTTP request is limited.

## TODO: Any others?
