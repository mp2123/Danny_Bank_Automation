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

PYTHON="$ROOT/.venv/bin/python"
SPEC="$ROOT/packaging/pyinstaller/danny_bank_control_center.spec"

if [[ "$MODE" == "release" ]]; then
  "$ROOT/scripts/sign_and_notarize.sh" --check-env
fi

if [[ ! -x "$PYTHON" ]]; then
  echo "Missing local Python virtualenv at $PYTHON. Run ./control_center.command once or create .venv before packaging." >&2
  exit 1
fi

if [[ ! -f "$SPEC" ]]; then
  echo "Missing PyInstaller spec: $SPEC" >&2
  exit 1
fi

if ! "$PYTHON" -m PyInstaller --version >/dev/null 2>&1; then
  echo "PyInstaller is not installed in .venv. Install it intentionally with: .venv/bin/python -m pip install pyinstaller" >&2
  exit 1
fi

if [[ "$CHECK_ONLY" == "true" ]]; then
  echo "Mac app packaging prerequisites are present for $MODE mode."
  exit 0
fi

cd "$ROOT"
mkdir -p build dist
"$PYTHON" -m PyInstaller "$SPEC" --noconfirm

APP_PATH="$ROOT/dist/Danny Bank.app"
if [[ ! -d "$APP_PATH" ]]; then
  echo "Expected app bundle was not created: $APP_PATH" >&2
  exit 1
fi

if command -v xattr >/dev/null 2>&1; then
  xattr -cr "$APP_PATH" || true
fi

if [[ "$MODE" == "release" ]]; then
  "$ROOT/scripts/sign_and_notarize.sh" --release --app "$APP_PATH"
else
  echo "Built unsigned development app: $APP_PATH"
fi
