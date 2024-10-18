---
title: "Requests/responses sharing and proxy between Native and WebView"
description: "In a hybrid Native/WebView app, some Native app may load first-party website or third-party website through WebView. So, the Native app and the WebView may make the exact same calls in first-party business, or Native app handles the resource request on behalf of WebView and the corresponding response data returned to WebView can even be different with what is received by Native from the backend server. Also, not all requests want to be proxied through Native, WebView user want to proxy a small number of requests locally to load offline resources."
category: webviewapi
keywords: hybrid
last_test_date: "2024-04-03"
notes: ""
links: {
    "Usage & Challenges report": "https://webview-cg.github.io/usage-and-challenges/#requests-responses-sharing-and-proxy-between-native-and-webview",
}
behaviour: {
    wkwebview: "",
    androidwebview: "[shouldInterceptRequest](https://developer.android.com/reference/android/webkit/WebViewClient#shouldInterceptRequest(android.webkit.WebView,%20android.webkit.WebResourceRequest)) in Android WebView provides developers with optional network interception capability. ",
    webview2: ""
}
stats: {
    wkwebview: {
        macos: {
            "*": "a"
        },
        ios: {
            "*": "a"
        },
        ipados: {
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
            "*": "u"
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
