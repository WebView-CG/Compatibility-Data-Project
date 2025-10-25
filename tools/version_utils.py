#!/usr/bin/env python3

'''
Shared utility functions for version parsing and comparison.
Used by both check_web_features_version.py and update_bcd_version.py.
'''

import re

def parse_version(version_string):
    """
    Parse a semantic version string into major, minor, patch components.
    
    Args:
        version_string: Version string (e.g., "2.1.0", "^2.0.0", "v1.2.3", "2.1.0-alpha.1")
    
    Returns:
        Dict with 'major', 'minor', 'patch' keys, or None if invalid
    """
    # Remove any leading 'v' or '^' or '~' characters
    version_string = version_string.lstrip('v^~')
    
    # Handle pre-release versions by splitting on '-' or '+'
    base_version = version_string.split('-')[0].split('+')[0]
    
    match = re.match(r'^(\d+)\.(\d+)\.(\d+)', base_version)
    if not match:
        return None
    
    return {
        'major': int(match.group(1)),
        'minor': int(match.group(2)),
        'patch': int(match.group(3))
    }

def is_major_version_change(current_version, latest_version):
    """
    Check if there's a major version change between two versions.
    
    Args:
        current_version: Current version string
        latest_version: Latest version string
    
    Returns:
        True if major version changed, False otherwise
    """
    current = parse_version(current_version)
    latest = parse_version(latest_version)
    
    if not current or not latest:
        return False
    
    return current['major'] != latest['major']

def is_minor_or_major_version_change(current_version, latest_version):
    """
    Check if there's a major or minor version change between two versions.
    Ignores patch-only updates.
    
    Args:
        current_version: Current version string
        latest_version: Latest version string
    
    Returns:
        True if major or minor version increased, False otherwise
    """
    current = parse_version(current_version)
    latest = parse_version(latest_version)
    
    if not current or not latest:
        return False
    
    # Major version increase OR same major but minor version increase
    return (latest['major'] > current['major'] or 
            (current['major'] == latest['major'] and 
             latest['minor'] > current['minor']))

def is_same_major_version(current_version, latest_version):
    """
    Check if two versions have the same major version.
    
    Args:
        current_version: Current version string
        latest_version: Latest version string
    
    Returns:
        True if same major version, False otherwise
    """
    current = parse_version(current_version)
    latest = parse_version(latest_version)
    
    if not current or not latest:
        return False
    
    return current['major'] == latest['major']
