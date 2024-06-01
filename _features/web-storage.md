---
title: "Manage web storage and cookies"
description: "Apps loading 3rd-party web content in WebViews may need more granular control over stored data. For example, DuckDuckGo browsers need this for the Fireproof feature, which allows to make exceptions to the cookie/storage removal. "
category: webapi
keywords: hybrid, browsers
last_test_date: "2024-04-03"
notes: ""
links: {
    "Usage & Challenges report": "https://webview-cg.github.io/usage-and-challenges/#manage-web-storage-and-cookies",
}
behaviour: {
    wkwebview: "Webkit provides APIs to retrieve cookies and local/sessionStorage as opaque tokens that can be filtered by hostname. This allows selective removal, although it requires some extra code and workarounds to prevent timing issues (removal is asynchronous).
<br><br>In Webkit, storage is shared between all WKWebView instances, unless it’s “non persistent” (in memory), which is not ideal for building web browsers.",
    androidwebview: "In Android WebView, it is not possible to inspect cookie scopes. You can retrieve cookie names and values, but without knowing other attributes it is impossible to override them properly

Android WebView does not provide APIs to manage localStorage/sessionStorage.",
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
            "*": "a"
        }
    },
    webview2: {
        windows: {
            "*": "u"
        }
    }
}
---
