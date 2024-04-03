---
title: "Autofil"
description: "Autofill can be used by users to save and re-enter information that they commonly fill out on web pages.
Some common data includes: Location information, Payment details, Account information."
category: webapi
keywords: ux
last_test_date: "2024-03-29"
notes: "TODO Comment on how data was tested"
links: {
}
stats: {
    wkwebview: {
		macos: {
			"*": "u"
		},
		ios: {
			"*": "u"
		},
        ipados: {
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
            "*": "u"
        }
    }
}
---

## WebView2

TODO: Complete me!

## WKWebView

TODO: Complete me!

## Android WebView

Android WebView relies on the Android autofill framework. Users can choose a default auto fill service, which will be
responsible for responding to autofill requests. Android WebView is responsible for detecting what fields in a web page
may need to be auto filled, and is responsible for sending autofill requests to the autofill framework.
