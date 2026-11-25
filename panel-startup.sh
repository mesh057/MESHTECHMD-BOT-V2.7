#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
if [[ ! -d node_modules ]]; then
  npm install --omit=dev --no-audit --no-fund
fi

mkdir -p session
export MESH_PAIRING_MODE=console
exec node index.js
