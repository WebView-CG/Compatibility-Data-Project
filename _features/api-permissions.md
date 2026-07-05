---
title: "Control API permissions"
description: "In apps that can load arbitrary web apps, such as WebView-powered browsers, it is desirable to give users control over website permissions via custom native UI."
category: webapi
keywords: browsers
last_test_date: "2024-04-03"
notes: ""
links: {
    "Usage & Challenges report": "https://webview-cg.github.io/usage-and-challenges/#control-api-permissions",
}
behaviour: {
    wkwebview: "Webkit has ways to control microphone and camera, but doesn't support Geolocation.",
    androidwebview: "Android WebView could use some WebRTC-related events: [WebRTC IP leak](https://github.com/duckduckgo/Android/issues/429).",
    webview2: "Microsoft's WebView2 support is limited:

* [Feature request: Permissions API](https://github.com/MicrosoftEdge/WebView2Feedback/issues/2427)

* [Feature request: Device or permission \"in use\" event](https://github.com/MicrosoftEdge/WebView2Feedback/issues/2428)

* [Feature request: API for screen sharing](https://github.com/MicrosoftEdge/WebView2Feedback/issues/2442)",
    arkweb: "Arkweb allows to control some permissions, including [geolocation (also in background)](https://developer.huawei.com/consumer/en/doc/harmonyos-references-V5/js-apis-webview-V5#geolocationpermissions). The event handler [`onPermissionRequest`](https://developer.huawei.com/consumer/en/doc/harmonyos-references-V5/ts-basic-components-web-V5#onpermissionrequest9) enables control of the permission requests of [camera, microphone and device sensors](https://developer.huawei.com/consumer/en/doc/harmonyos-references-V5/ts-basic-components-web-V5#protectedresourcetype9)."
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
            "*": "a"
        }
    },
    webview2: {
        windows: {
            "*": "a"
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
            "*": "a"
        }
    }
}
---
