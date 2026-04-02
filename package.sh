#!/bin/bash
set -e

VERSION=$(grep '"version"' manifest.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
OUTPUT="run-filters-extension-v${VERSION}.zip"

rm -f "$OUTPUT"
zip -r "$OUTPUT" manifest.json background.js icons/ experiment/ README.md

echo "Packaged: $OUTPUT"
