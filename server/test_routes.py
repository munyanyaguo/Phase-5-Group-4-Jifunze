#!/usr/bin/env python3
"""
Quick script to list all registered Flask routes
Run: python test_routes.py
"""
import os
import sys

# Add the server directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app

app = create_app()

print("\n" + "="*80)
print("REGISTERED FLASK ROUTES")
print("="*80 + "\n")

routes = []
for rule in app.url_map.iter_rules():
    methods = ','.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
    routes.append((rule.rule, methods))

# Sort by endpoint
routes.sort()

# Print routes
manager_routes = []
for route, methods in routes:
    if '/manager/' in route:
        manager_routes.append((route, methods))
    print(f"{methods:20s} {route}")

print("\n" + "="*80)
print("MANAGER-SPECIFIC ROUTES")
print("="*80 + "\n")

if manager_routes:
    for route, methods in manager_routes:
        print(f"{methods:20s} {route}")
else:
    print("❌ No manager routes found!")

print("\n")
