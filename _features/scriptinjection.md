---
title: "Inject custom JS scripts"
description: "User scripts (aka content scripts) is a powerful tool that unlocks many possibilities such as: content customization, security and privacy protection, enriching web app functionality.
Injected scripts can also be a workaround when another WebView feature is not available: for example, due to the lack of granular cookie control in native WebView APIs, one method is to inject a script to augment document.cookie API. "
category: webviewapi
keywords: hybrid, browsers
last_test_date: "2024-04-03"
notes: ""
links: {
    "Usage & Challenges report": "https://webview-cg.github.io/usage-and-challenges/#inject-custom-js-scripts",
}
behaviour: {
    wkwebview: "",
    androidwebview: "",
    webview2: "",
    arkweb: "ArkWeb allows injecting scripts into web pages for execution via the `WebviewController.runJavaScript()` and WebviewController.runJavaScriptExt() interfaces. It also supports configuring scripts to run at specific events in the web page loading lifecycle using the `runJavaScriptOnDocumentStart`, `runJavaScriptOnDocumentEnd`, and `runJavaScriptOnHeadEnd` properties. Furthermore, developers can register script objects that can be accessed by web pages through the `javaScriptProxy` property or the `WebviewController.registerJavaScriptProxy` method. See [example](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/web-in-app-frontend-page-function-invoking-V5)."    
}
stats: {
    wkwebview: {
        macos: {
            "*": "y"
        },
        ios: {
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
    },
    arkweb: {
        harmonyos: {
            "*": "y"
        }
    }
}
---
