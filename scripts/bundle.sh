#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

deno bundle src/hyperstim.ts -o dist/hyperstim.js
deno bundle src/hyperstim.ts --minify -o dist/hyperstim.min.js

COMMIT_HASH=$(git rev-parse HEAD)

for file in dist/hyperstim.js dist/hyperstim.min.js; do
    sed -i "1i// HyperStim $COMMIT_HASH" "$file"
done
