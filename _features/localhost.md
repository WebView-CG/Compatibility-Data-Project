---
title: "Localhost"
description: "A lot of apps are built using hybrid app development frameworks that use one big WebView for providing app developers a native wrapper and some plugins for their Web app. The web content is often bundled and served within the native app. For a couple of reasons using the `file:` protocol to access web content is no longer an option and WebViews provide APIs to host content.

See more in [usage and challenges](https://webview-cg.github.io/usage-and-challenges/#the-origin-in-a-webview-for-locally-hosted-content)."
category: webviewapi
keywords: hybrid
last_test_date: "2024-03-29"
notes: "Behavior description based on experiene with the Apache Cordova app framework"
links: {
    "Usage & Challenges report": "https://webview-cg.github.io/usage-and-challenges/#the-origin-in-a-webview-for-locally-hosted-content",
    "WKURLSchemehandler": "https://developer.apple.com/documentation/webkit/wkurlschemehandler",
    "WebViewAssetLoader": "https://developer.android.com/reference/androidx/webkit/WebViewAssetLoader"
}
behaviour: {
    wkwebview: "",
    androidwebview: "",
    webview2: "WebView2 has a variety of ways to work with local content - intercepting web resources as they're requested, mapping a hostname to a folder on the user's filesystem, or registering a custom URL scheme. You can find details on all of these in WebView2's documentation for [working with local content in WebView2 apps](https://learn.microsoft.com/microsoft-edge/webview2/concepts/working-with-local-content)."
}
stats: {
    wkwebview: {
        macos: {
            "*": "y"
        },
        ios: {
            "*": "y"
        },
        ipados: {
            "*": "y"
        }
    },
    androidwebview: {
        android: {
            "*": "y"
        }
    },
    webview2: {
        windows: {
            "*": "y"
        }
    },
    chrome_android: {
        android: {
            "*": "u"
        }
    },
    safari_ios: {
        ios: {
            "*": "u"
        }
    }
}
---
