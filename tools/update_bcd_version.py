#!/usr/bin/env python3

'''
This is a simple script that will query the bcd CDN to find out
what the latest version is.

We do this so that we can version lock the repo and rather
periodically update the version of this repository.
'''

import urllib.request, json

CDN_URL = "https://unpkg.com/@mdn/browser-compat-data/data.json"
VERSION_FILE = "bcd_version"

with urllib.request.urlopen(CDN_URL) as raw:
    data = json.load(raw)
    version = data["__meta"]["version"]

    with open(VERSION_FILE, "w") as file:
        file.write(version)
