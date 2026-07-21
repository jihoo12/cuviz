#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: ./serve.sh <file.uwuc> [definition]"
  echo ""
  echo "  Exports the AST to viz/public/term.json and opens the visualizer."
  echo "  The browser auto-loads the data — no drag-and-drop needed."
  exit 1
}

[[ $# -lt 1 ]] && usage

FILE="$1"
DEF="${2:-}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$SCRIPT_DIR/viz/public/term.json"

mkdir -p "$(dirname "$OUT")"

echo "▸ Exporting $FILE ..."
if [[ -n "$DEF" ]]; then
  cargo run --bin cubical-viz -- "$FILE" "$DEF" > "$OUT"
else
  cargo run --bin cubical-viz -- "$FILE" > "$OUT"
fi

echo "▸ Starting frontend ..."
cd "$SCRIPT_DIR/viz"
exec npm run dev
