#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PYTHON="$ROOT/.venv/bin/python"
LOG_FILE="$(mktemp -t danny-bank-release-smoke.XXXXXX.log)"

cleanup() {
  rm -f "$LOG_FILE"
}
trap cleanup EXIT

run_step() {
  local label="$1"
  shift
  echo
  echo "==> $label"
  set +e
  "$@" 2>&1 | tee -a "$LOG_FILE"
  local status=${PIPESTATUS[0]}
  set -e
  if [[ "$status" -ne 0 ]]; then
    echo "Release smoke check failed during: $label" >&2
    exit "$status"
  fi
}

run_shell_step() {
  local label="$1"
  local command="$2"
  echo
  echo "==> $label"
  set +e
  bash -lc "$command" 2>&1 | tee -a "$LOG_FILE"
  local status=${PIPESTATUS[0]}
  set -e
  if [[ "$status" -ne 0 ]]; then
    echo "Release smoke check failed during: $label" >&2
    exit "$status"
  fi
}

check_signing_preflight() {
  echo
  echo "==> Signing/notarization preflight"
  set +e
  local output
  output="$("$ROOT/scripts/sign_and_notarize.sh" --check-env 2>&1)"
  local status=$?
  set -e
  printf '%s\n' "$output" | tee -a "$LOG_FILE"

  if [[ "$status" -eq 0 ]]; then
    echo "Signing/notarization environment is configured."
    return 0
  fi

  if [[ "$status" -eq 2 && "$output" == *"Release signing/notarization requires:"* ]]; then
    echo "Signing/notarization is not configured; release builds correctly fail closed."
    return 0
  fi

  echo "Unexpected signing/notarization preflight result." >&2
  return "$status"
}

scan_for_secret_leaks() {
  local env_file="$ROOT/.env"
  [[ -f "$env_file" ]] || return 0

  local leaked=0
  local keys='^(PLAID_CLIENT_ID|PLAID_SECRET|PLAID_ACCESS_TOKEN|GOOGLE_SPREADSHEET_ID|GOOGLE_APPS_SCRIPT_ID|GEMINI_API_KEY)='
  while IFS='=' read -r key raw_value; do
    [[ "$key" =~ $keys ]] || continue
    local value="${raw_value%$'\r'}"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"
    IFS=',' read -ra parts <<< "$value"
    for part in "${parts[@]}"; do
      local token
      token="$(printf '%s' "$part" | xargs)"
      if [[ ${#token} -ge 8 ]] && grep -Fq "$token" "$LOG_FILE"; then
        echo "Secret-like value for $key appeared in release smoke output." >&2
        leaked=1
      fi
    done
  done < "$env_file"

  if [[ "$leaked" -ne 0 ]]; then
    return 1
  fi
}

if [[ ! -x "$PYTHON" ]]; then
  echo "Missing executable Python at $PYTHON. Create .venv before running release smoke checks." >&2
  exit 1
fi

if [[ -e "$ROOT/src/engine/csv_importer 2.py" ]]; then
  echo "Obsolete duplicate importer still exists: src/engine/csv_importer 2.py" >&2
  exit 1
fi

cd "$ROOT"

run_step "Python tests" "$PYTHON" -m pytest -q
run_shell_step "Apps Script syntax" "cd '$ROOT' && node --check --input-type=commonjs < src/appscript/Code.gs"
run_step "Doctor skip-network" "$PYTHON" -m src.engine.doctor --skip-network
run_step "Apps Script deploy dry-run" "$PYTHON" -m src.engine.appscript_deploy --dry-run
run_shell_step "Demo data summary" "cd '$ROOT' && '$PYTHON' - <<'PY'
from src.engine.demo_data import summarize_demo_data

payload = summarize_demo_data()
assert payload['ok'] is True
assert payload['synthetic'] is True
assert payload['summary']['total_income'] > 0
assert payload['summary']['total_spend'] > 0
assert payload['summary']['savings_rate'] is not None
print('Demo data OK: rows={rows} savings_rate={rate}%'.format(
    rows=payload['summary']['transaction_count'],
    rate=payload['summary']['savings_rate'],
))
PY"
run_step "Mac app packaging preflight" "$ROOT/scripts/build_mac_app.sh" --dev --check
run_step "DMG packaging preflight" "$ROOT/scripts/build_dmg.sh" --dev --check
check_signing_preflight

echo
echo "==> Secret leak scan"
scan_for_secret_leaks
echo "No local secret values appeared in release smoke output."

echo
echo "Release smoke check passed."
