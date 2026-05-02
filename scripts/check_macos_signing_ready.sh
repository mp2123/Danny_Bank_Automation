#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATUS=0

fail() {
  echo "$1" >&2
  STATUS=2
}

require_tool() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    fail "Missing required tool: $name"
    return
  fi
  echo "Found required tool: $name"
}

require_xcrun_tool() {
  local name="$1"
  if ! xcrun -f "$name" >/dev/null 2>&1; then
    fail "Missing Xcode tool: $name"
    return
  fi
  echo "Found Xcode tool: $name"
}

require_tool xcrun
require_tool security
require_tool codesign
require_tool spctl

if ! xcode-select -p >/dev/null 2>&1; then
  fail "Xcode command-line tools are not selected. Install/select them before release signing."
else
  echo "Xcode command-line tools are selected."
fi

require_xcrun_tool notarytool
require_xcrun_tool stapler

# Keep this literal command visible for tests and operator review.
IDENTITIES="$(security find-identity -v -p codesigning 2>/dev/null || true)"
DEVELOPER_IDENTITIES="$(printf '%s\n' "$IDENTITIES" | grep 'Developer ID Application:' || true)"

if [[ -z "$DEVELOPER_IDENTITIES" ]]; then
  fail "Missing Developer ID Application signing identity. Install an Apple-issued Developer ID Application certificate and private key."
else
  echo "Developer ID Application signing identity is available."
fi

if [[ -z "${DEVELOPER_ID_APPLICATION:-}" ]]; then
  fail "Missing DEVELOPER_ID_APPLICATION. Set it to the exact Developer ID Application identity name."
elif ! printf '%s\n' "$DEVELOPER_IDENTITIES" | grep -Fq "$DEVELOPER_ID_APPLICATION"; then
  fail "DEVELOPER_ID_APPLICATION does not match an installed Developer ID Application signing identity."
else
  echo "DEVELOPER_ID_APPLICATION matches an installed Developer ID Application identity."
fi

if [[ -n "${NOTARYTOOL_PROFILE:-}" ]]; then
  echo "Using notarization auth mode: keychain profile"
else
  echo "Using notarization auth mode: Apple ID"
  missing_notary=()
  for name in APPLE_ID APPLE_TEAM_ID APPLE_APP_SPECIFIC_PASSWORD; do
    if [[ -z "${!name:-}" ]]; then
      missing_notary+=("$name")
    fi
  done
  if [[ ${#missing_notary[@]} -gt 0 ]]; then
    fail "Missing notarization auth. Set NOTARYTOOL_PROFILE or provide: ${missing_notary[*]}"
  fi
fi

if [[ "$STATUS" -eq 0 ]]; then
  echo "Mac signing and notarization readiness checks passed."
fi

exit "$STATUS"
