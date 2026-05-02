#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="dev"
APP_PATH=""
DMG_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dev) MODE="dev"; shift ;;
    --release) MODE="release"; shift ;;
    --app) APP_PATH="$2"; shift 2 ;;
    --dmg) DMG_PATH="$2"; shift 2 ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z "$APP_PATH" ]]; then
  APP_PATH="$ROOT/dist/Danny Bank.app"
fi
if [[ -z "$DMG_PATH" ]]; then
  DMG_PATH="$ROOT/dist/Danny_Bank_${MODE}.dmg"
fi

scan_private_files() {
  local path="$1"
  local label="$2"
  local private_patterns=(
    '.env'
    'credentials.json'
    'token.json'
    'token_appscript.json'
    '*.log'
  )

  for pattern in "${private_patterns[@]}"; do
    if find "$path" -name "$pattern" -print -quit | grep -q .; then
      echo "Private local file pattern '$pattern' was found inside $label." >&2
      return 1
    fi
  done

  if find "$path" -path '*/src/imports/*.csv' -print -quit | grep -q .; then
    echo "Private local import CSV was found inside $label." >&2
    return 1
  fi
}

if [[ ! -d "$APP_PATH" || ! -f "$DMG_PATH" ]]; then
  if [[ "$MODE" == "dev" ]]; then
    echo "Development artifacts are missing; dev-only / not distributable verification could not inspect app and DMG." >&2
    echo "Expected app: $APP_PATH" >&2
    echo "Expected DMG: $DMG_PATH" >&2
    exit 2
  fi
  echo "Release artifacts are missing." >&2
  echo "Expected app: $APP_PATH" >&2
  echo "Expected DMG: $DMG_PATH" >&2
  exit 1
fi

scan_private_files "$APP_PATH" "app bundle"

if [[ "$MODE" == "dev" ]]; then
  echo "Development artifacts exist and private-file scan passed."
  echo "Development artifacts are dev-only / not distributable until Developer ID signing, notarization, and Gatekeeper validation pass."
  codesign -dv --verbose=2 "$APP_PATH" >/dev/null 2>&1 || true
  exit 0
fi

codesign --verify --deep --strict --verbose=2 "$APP_PATH"
spctl --assess --type execute --verbose=4 "$APP_PATH"
xcrun stapler validate "$DMG_PATH"

echo "Release artifact verification passed."
