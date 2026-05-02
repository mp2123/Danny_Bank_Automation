#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="dev"
CHECK_ONLY="false"

for arg in "$@"; do
  case "$arg" in
    --dev) MODE="dev" ;;
    --release) MODE="release" ;;
    --check) CHECK_ONLY="true" ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 2
      ;;
  esac
done

APP_PATH="$ROOT/dist/Danny Bank.app"
STAGING="$ROOT/build/dmg/Danny Bank"
DMG_PATH="$ROOT/dist/Danny_Bank_${MODE}.dmg"

if ! command -v hdiutil >/dev/null 2>&1; then
  echo "hdiutil is required to build a DMG on macOS." >&2
  exit 1
fi

if [[ "$MODE" == "release" ]]; then
  "$ROOT/scripts/check_macos_signing_ready.sh"
fi

if [[ "$CHECK_ONLY" == "true" ]]; then
  echo "DMG packaging prerequisites are present for $MODE mode."
  exit 0
fi

if [[ ! -d "$APP_PATH" ]]; then
  echo "Missing app bundle: $APP_PATH. Run scripts/build_mac_app.sh --dev first." >&2
  exit 1
fi

rm -rf "$STAGING"
mkdir -p "$STAGING"
cp -R "$APP_PATH" "$STAGING/"
cat > "$STAGING/README_FIRST.txt" <<'README'
Danny Bank is a local-first personal finance control center.

First setup:
1. Launch Danny Bank.app.
2. Open the local control center in your browser.
3. Follow the Setup Readiness panel.
4. Keep .env, Google tokens, Plaid tokens, and import CSVs outside this app bundle.

This beta does not host financial data, customer auth, telemetry, or remote diagnostics.
README

mkdir -p "$ROOT/dist"
hdiutil create -volname "Danny Bank" -srcfolder "$STAGING" -ov -format UDZO "$DMG_PATH"

if [[ "$MODE" == "release" ]]; then
  "$ROOT/scripts/sign_and_notarize.sh" --release --dmg "$DMG_PATH"
else
  echo "Built unsigned development DMG: $DMG_PATH"
fi
