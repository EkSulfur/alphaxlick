#!/usr/bin/env bash
# Builds the store upload package: dist/alphaxlick-<version>.zip
# The manifest.json must sit at the root of the zip (no wrapper folder).
set -euo pipefail

cd "$(dirname "$0")"

VERSION=$(node -p "require('./manifest.json').version" 2>/dev/null || \
  grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' manifest.json | head -1 | cut -d'"' -f4)

OUT_DIR="dist"
ZIP_NAME="alphaxlick-${VERSION}.zip"
FILES=(
  manifest.json
  background.js
  common.js
  content.js
  content-alphaxiv.js
  popup.html
  popup.js
  icons/icon16.png
  icons/icon48.png
  icons/icon128.png
)

mkdir -p "$OUT_DIR"
rm -f "$OUT_DIR/$ZIP_NAME"

# -X strips extra file attributes so the archive stays reproducible.
zip -X -q "$OUT_DIR/$ZIP_NAME" "${FILES[@]}"

echo "Built $OUT_DIR/$ZIP_NAME (version $VERSION)"
echo "Contents:"
unzip -l "$OUT_DIR/$ZIP_NAME"
