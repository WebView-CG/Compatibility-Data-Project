# What are cookies?

Cookies are small pieces of data that web servers can send to browsers to be stored persistently.

They are useful for features like user login.

Cookies can be used both in HTTP requests, and within JavaScript.

# How does it work on each WebView?

## WebView2

TODO: Complete me!

## WKWebView

Intelligent tracking prevention (ITP) was enabled by default for WKWebView on iOS 14
([reference](https://webkit.org/blog/10882/app-bound-domains/)).
This means that third party cookies cannot be used by default.

Applications can add the option to opt out of ITP by providing a property to their app configuration for some but not all use cases, but users will
still have to opt into this behavior in their app settings.

TODO: Complete me!

## Android WebView

Third party cookies are disabled by default within Android WebView. Applications can re-enable third party cookies
using the [CookieManager#setAcceptThirdPartyCookies](https://developer.android.com/reference/android/webkit/CookieManager#setAcceptThirdPartyCookies(android.webkit.WebView,%20boolean)) API.

## TODO: Any others?
