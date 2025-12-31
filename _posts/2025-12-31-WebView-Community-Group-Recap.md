---
title: "WebView Community Group Recap: 2025 and Beyond"
date: 2025-12-31
---

As the year winds down, I wanted to take a moment to celebrate what we've achieved together in 2025 and share a bit about where we're headed next year. This year has been full of important milestones and new opportunities.

## What We Accomplished in 2025

### caniwebview\.com Project

caniwebview\.com got many small usability improvements, new features, and data that make it an even better resource for developers. The biggest thing we're still working on is showing the support of [web features](https://web-platform-dx.github.io/web-features/web-features/) in a support matrix on [caniwebview.com/baseline](https://caniwebview.com/baseline).

### Testing Apps for Developers

The idea of building simple native apps for developers to test their content in WebViews came up a long time ago. With support from [NLnet's NGI Mobifree fund](https://nlnet.nl/project/W3CWebview-tooling/), we managed to build and publish CanIWebView apps for Android and iOS. A version for WebView2 is available to build yourself. These apps allow you to test different configurations of WebViews and investigate possible issues. In the future, we might add automated testing capabilities to these apps to update our WebView support data in [BCD](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Compatibility_tables).

### Lots of Opportunities at TPAC 2025 in Kobe

I was fortunate to be at [TPAC](https://www.w3.org/2025/11/TPAC/) again in person and wrote about that in detail on my [blog](https://blog.merzlabs.com/posts/webview-tpac2025/).

I felt that WebViews at this TPAC were a lot more present and discussed in many sessions and hallway conversations. It was great to connect again with related communities and technologies. We discovered a lot of overlap and opportunities with MiniApps and something pretty new called Isolated Web Apps (IWA). One big challenge I'd like to address is that WebViews, MiniApps, IWA, and more need a shared space to work and communicate more effectively together.

All the work we put into documentation and WebView improvements could also benefit the very fragmented MiniApps ecosystem. Which is a big deal because MiniApps are a huge market.

## What's Next for 2026

### Baseline!

[Baseline](https://web-platform-dx.github.io/web-features/) is a great resource to learn about what features are supported. A long-term goal of the WebView Community Group is to either get WebViews incorporated in Baseline's core browser set or define a "Baseline for WebViews". We are closely working with the WebDX Community Group, which maintains Baseline. With great support from Tony Conway at Google, we've built a [stopgap tool](https://github.com/tonypconway/web-features-plus-webview) to calculate support for WebViews, and this powers the data we have about web-features on caniwebview.com today. We plan on getting this data into the official tooling very soon.

In my opinion, having a "Baseline for WebViews" would help a lot in many different ways and highlight the big compat gaps we have on different WebViews, their respective browsers, and MiniApps.

### "State of WebViews" Talk

I'm excited to have a session in the new [Browser and Web Platform](https://fosdem.org/2026/schedule/track/browser-and-web-platform/) devroom at FOSDEM 2026. My talk, [State of WebViews - Can we fix things?](https://fosdem.org/2026/schedule/event/AHQB9B-state-of-webview/), will give an overview of where we are today and what could be better.

I'm pretty sure this doesn't cover everything we did this year, but thanks for reading and for your support. None of this would be possible without the energy and creativity you bring to this community. I'm excited to see what we can achieve together in 2026!

The WebView Community Group wishes you all a wonderful new year.

Cheers,
Niklas