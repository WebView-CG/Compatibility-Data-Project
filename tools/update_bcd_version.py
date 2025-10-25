#!/usr/bin/env python3

'''
This is a simple script that will query the bcd CDN to find out
what the latest version is.

We do this so that we can version lock the repo and rather
periodically update the version of this repository.
'''

import urllib.request
import json
from version_utils import is_same_major_version

CDN_URL = "https://unpkg.com/@mdn/browser-compat-data/data.json"
VERSION_FILE = "bcd_version"

# We are going to respect semantic versioning and only
# auto update the version if it is not a major version increase.
# This will help us avoid accidentally breaking the site
# without any human intervention.

with urllib.request.urlopen(CDN_URL) as raw:
    data = json.load(raw)
    version = data["__meta"]["version"]

    with open(VERSION_FILE, "r+") as file:
        current_version = file.read()
        if is_same_major_version(current_version, version):
            file.seek(0)
            file.write(version)
            file.truncate()
        else:
            # Exit with a non-zero code so that CI/CD can catch this.
            print("Major version change detected, not updating.")
            exit(1)
