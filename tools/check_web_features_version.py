#!/usr/bin/env python3

'''
This script checks if a new major or minor version of the web-features npm package
has been published. It compares the current version in package.json with
the latest version from npm registry.

The script detects new major or minor versions (e.g., 2.0.0 -> 3.0.0 or 2.0.0 -> 2.1.0),
but not patch versions (e.g., 2.1.0 -> 2.1.1).

Exit codes:
  0 - No new major or minor version detected
  1 - New major or minor version detected
  2 - Error occurred
'''

import urllib.request
import json
import sys
from version_utils import is_minor_or_major_version_change

NPM_REGISTRY_URL = "https://registry.npmjs.org/web-features"
PACKAGE_JSON_FILE = "package.json"

def get_latest_version():
    """Get the latest version of web-features from npm registry."""
    try:
        with urllib.request.urlopen(NPM_REGISTRY_URL) as response:
            data = json.load(response)
            return data['dist-tags']['latest']
    except Exception as e:
        print(f"Error fetching latest version from npm: {e}")
        sys.exit(2)

def get_current_version():
    """Get the current version of web-features from package.json."""
    try:
        with open(PACKAGE_JSON_FILE, 'r') as file:
            data = json.load(file)
            if 'dependencies' in data and 'web-features' in data['dependencies']:
                return data['dependencies']['web-features']
            else:
                print("Error: web-features not found in package.json dependencies")
                sys.exit(2)
    except Exception as e:
        print(f"Error reading package.json: {e}")
        sys.exit(2)

def main():
    current_version = get_current_version()
    latest_version = get_latest_version()
    
    print(f"Current version: {current_version}")
    print(f"Latest version: {latest_version}")
    print(f"LATEST_VERSION={latest_version}")
    
    if is_minor_or_major_version_change(current_version, latest_version):
        print(f"New major or minor version detected: {latest_version}")
        sys.exit(1)
    else:
        print("No new major or minor version detected")
        sys.exit(0)

if __name__ == "__main__":
    main()
