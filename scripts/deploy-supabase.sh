#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

CLI_BIN="${SUPABASE_CLI_BIN:-/home/adolphe/.hermes/node/bin/supabase}"

if [[ ! -x "$CLI_BIN" ]]; then
  echo "Supabase CLI not found at $CLI_BIN" >&2
  echo "Install it with: npm install -g supabase" >&2
  exit 1
fi

if [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  "$CLI_BIN" login --token "$SUPABASE_ACCESS_TOKEN"
fi

if [[ -z "${SUPABASE_PROJECT_REF:-}" ]]; then
  echo "Missing SUPABASE_PROJECT_REF" >&2
  exit 1
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Missing SUPABASE_DB_PASSWORD" >&2
  exit 1
fi

"$CLI_BIN" link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
"$CLI_BIN" db push --linked
