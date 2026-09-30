#!/usr/bin/env bash
# Copy engineering-mentor (node-mentor's dependency) into .eval-deps/ so that
# `claude plugin eval` can load it: eval runs load only plugins inside the plugin
# under test. Source defaults to a sibling checkout (../engineering-mentor);
# override with ENGINEERING_MENTOR_DIR.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
src="${ENGINEERING_MENTOR_DIR:-$here/../engineering-mentor}"
[ -f "$src/.claude-plugin/plugin.json" ] || { echo "engineering-mentor not found at $src (set ENGINEERING_MENTOR_DIR)" >&2; exit 1; }
rm -rf "${here:?}/.eval-deps"
mkdir -p "$here/.eval-deps/engineering-mentor"
rsync -a --exclude .git --exclude evals --exclude tests --exclude __pycache__ "$src/" "$here/.eval-deps/engineering-mentor/"
echo "copied $(cd "$src" && pwd) -> .eval-deps/engineering-mentor ($(ls "$here/.eval-deps/engineering-mentor/skills" | wc -l | tr -d ' ') skills)"
