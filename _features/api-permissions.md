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

* [Feature request: API for screen sharing](https://github.com/MicrosoftEdge/WebView2Feedback/issues/2442)"
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
            "*": "a"
        }
    },
    webview2: {
        windows: {
            "*": "a"
        }
    }
}
---
