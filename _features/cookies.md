---
title: "Cookies"
description: "Cookies are small pieces of data that web servers can send to browsers to be stored persistently. They are useful for features like user login. Cookies can be used both in HTTP requests, and within JavaScript."
category: webapi
keywords: authentication
last_test_date: "2024-03-29"
notes: "TODO"
links: {
    "Blog post about WKWebView changes": "https://blog.merzlabs.com/posts/webview-history/",
}
behaviour: {
    wkwebview: "Intelligent tracking prevention (ITP) was enabled by default for WKWebView on iOS 14
([reference](https://webkit.org/blog/10882/app-bound-domains/)).
This means that third party cookies cannot be used by default.

Applications can add the option to opt out of ITP by providing a property to their app configuration for some but not all use cases, but users will
still have to opt into this behavior in their app settings.

Different WebViews or the native app can also share cookies by using HTTPCookieStorage.",
    androidwebview: "Third party cookies are disabled by default within Android WebView. Applications can re-enable third party cookies
using the [CookieManager#setAcceptThirdPartyCookies](https://developer.android.com/reference/android/webkit/CookieManager#setAcceptThirdPartyCookies(android.webkit.WebView,%20boolean)) API.",
    webview2: "Applications can access, modify, delete, or copy the cookies of their WebView2 instance via the `CoreWebView2.CookieManager` property. By default, WebView2 has [Tracking Prevention](https://learn.microsoft.com/microsoft-edge/web-platform/tracking-prevention) set to \"Balanced\" by default and can be modified using the `CoreWebView2EnvironmentOptions.EnableTrackingPrevention` property."
}
stats: {
    wkwebview: {
        macos: {
            "*": "a"
        },
        ios: {
            "*": "a"
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
