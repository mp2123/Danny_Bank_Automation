#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="check"
APP_PATH=""
DMG_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --check-env) MODE="check"; shift ;;
    --release) MODE="release"; shift ;;
    --app) APP_PATH="$2"; shift 2 ;;
    --dmg) DMG_PATH="$2"; shift 2 ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

missing=()
for name in DEVELOPER_ID_APPLICATION APPLE_ID APPLE_TEAM_ID APPLE_APP_SPECIFIC_PASSWORD; do
  if [[ -z "${!name:-}" ]]; then
    missing+=("$name")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Release signing/notarization requires: ${missing[*]}" >&2
  exit 2
fi

if [[ "$MODE" == "check" ]]; then
  echo "Signing and notarization environment is configured."
  exit 0
fi

if [[ -n "$APP_PATH" ]]; then
  if [[ ! -d "$APP_PATH" ]]; then
    echo "App bundle not found: $APP_PATH" >&2
    exit 1
  fi
  if command -v xattr >/dev/null 2>&1; then
    xattr -cr "$APP_PATH" || true
  fi
  codesign --force --deep --options runtime --timestamp --sign "$DEVELOPER_ID_APPLICATION" "$APP_PATH"
  codesign --verify --deep --strict --verbose=2 "$APP_PATH"
  echo "Signed app bundle: $APP_PATH"
fi

if [[ -n "$DMG_PATH" ]]; then
  if [[ ! -f "$DMG_PATH" ]]; then
    echo "DMG not found: $DMG_PATH" >&2
    exit 1
  fi
  xcrun notarytool submit "$DMG_PATH" \
    --apple-id "$APPLE_ID" \
    --team-id "$APPLE_TEAM_ID" \
    --password "$APPLE_APP_SPECIFIC_PASSWORD" \
    --wait
  xcrun stapler staple "$DMG_PATH"
  echo "Notarized and stapled DMG: $DMG_PATH"
fi

if [[ -z "$APP_PATH" && -z "$DMG_PATH" ]]; then
  echo "No --app or --dmg target was provided." >&2
  exit 2
fi
