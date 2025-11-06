#!/usr/bin/env python3

'''
This is a simple script that will query the bcd CDN to find out
what the latest version is.

We do this so that we can version lock the repo and rather
periodically update the version of this repository.
'''

import urllib.request, json
import os
import subprocess
from pathlib import Path

CDN_URL = "https://unpkg.com/web-features/package.json"
VERSION_FILE = "bcd_version"

# We are going to respect semantic versioning and only
# auto update the version if it is not a major version increase.
# This will help us avoid accidentally breaking the site
# without any human intervention.
def validateNotMajor(prevVersion, nextVersion):
    prevVersion = prevVersion.split(".")
    nextVersion = nextVersion.split(".")

    return (len(prevVersion) == 3 and
            len(nextVersion) == 3 and
            prevVersion[0] == nextVersion[0])

with urllib.request.urlopen(CDN_URL) as raw:
    data = json.load(raw)
    version = data["version"]

    with open(VERSION_FILE, "r+") as file:
        if (validateNotMajor(file.read(), version)):
            file.seek(0)
            file.write(version)
            file.truncate()

            # Run `npm update web-features` at the repository root to refresh package-lock.json
            try:
                repo_root = Path(__file__).resolve().parent.parent
                subprocess.run(["npm", "update", "web-features"], cwd=str(repo_root), check=True)
            except Exception as e:
                print(f"Warning: failed to run 'npm update web-features': {e}")
                exit(1)
            
        else:
            # Exit with a non-zero code so that CI/CD can catch this.
            print("Major version change detected, not updating.")
            exit(1)
