---
title: "Update cadence"
description: "This section covers how often users can expect to see each WebView provider updated. The WebView provider can either be
distributed with the application users are using, or it can be provided by the operating system."
category: Platform level
keywords: updates
last_test_date: "2024-03-29"
notes: ""
links: {
}
behaviour: {
    wkwebview: "",
    androidwebview: "Android WebView is a library provided by the Android operating system. The API itself is a stable surface but Android
WebView is backed by an updatable library. Android WebView is Chromium based and so it mostly follows the same release
cycle as Chromium. The schedule for Android WebView releases can be found
[here](https://chromiumdash.appspot.com/schedule).

Like Chromium, Android WebView has different release channels that users can opt into for testing purposes. You can find
out more [here](https://chromium.googlesource.com/chromium/src/+/master/android_webview/docs/prerelease.md).",
    webview2: "WebView2 has two options for updating - Evergreen Runtime or Fixed Runtime. Evergreen runtime is automatically included in recent versions of Windows, and developers can also include a small installer alongside theirs to be confident it's available. This version is updated automatically with major releases every four weeks, roughly following Chromium's releases. When using a fixed runtime, the application developer distributes the WebView2 components with their app and chooses when to update to a newer version. Details on the type of runtimes can be found [here](https://learn.microsoft.com/microsoft-edge/webview2/concepts/distribution), and details on evergreen updates can be found [here](https://learn.microsoft.com/deployedge/microsoft-edge-relnote-stable-channel).

SDK updates are also every four weeks, and their details are [here](https://learn.microsoft.com/microsoft-edge/webview2/release-notes/about)"
}
stats: {
    wkwebview: {
        macos: {
            "*": "u"
        },
        ios: {
            "*": "u"
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
