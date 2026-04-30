#!/usr/bin/env python3
"""
Fix triple-encoded UTF-8 mojibake in TestLab.tsx.
The file was saved/read with wrong encoding multiple times.
Strategy: iteratively try to decode latin-1 → utf-8 until stable.
"""
import sys
import re

INPUT  = r"src\pages\TestLab.tsx"
OUTPUT = r"src\pages\TestLab.tsx"

def fix_mojibake(text, max_passes=5):
    for i in range(max_passes):
        try:
            candidate = text.encode('latin-1').decode('utf-8')
        except (UnicodeDecodeError, UnicodeEncodeError):
            break
        if candidate == text:
            break
        text = candidate
        print(f"  Pass {i+1} applied")
    return text

# Read raw bytes, interpret as UTF-8 (as the OS stored it)
with open(INPUT, 'rb') as f:
    raw = f.read()

# Strip BOM if present
if raw.startswith(b'\xef\xbb\xbf'):
    raw = raw[3:]

# Decode as UTF-8 — this is what the editor sees
text = raw.decode('utf-8', errors='replace')

print(f"Original length: {len(text)} chars")
print(f"Sample before fix (line 18 comment area):")
lines = text.split('\n')
for i, ln in enumerate(lines[16:22], start=17):
    print(f"  L{i}: {ln[:120]}")

print("\nApplying iterative fix...")
fixed = fix_mojibake(text)

print(f"\nFixed length: {len(fixed)} chars")
print(f"Sample after fix:")
lines2 = fixed.split('\n')
for i, ln in enumerate(lines2[16:22], start=17):
    print(f"  L{i}: {ln[:120]}")

# Check if mojibake pattern still exists
mojibake_found = bool(re.search(r'Ãƒ|Ã†|â€™|Ãƒâ€', fixed))
print(f"\nMojibake still present: {mojibake_found}")

# Write back as UTF-8 with BOM (safe for Windows editors)
with open(OUTPUT, 'wb') as f:
    f.write(fixed.encode('utf-8'))

print(f"\nDone. Written to {OUTPUT}")
