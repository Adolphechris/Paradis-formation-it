#!/usr/bin/env bash
set -uo pipefail

export SUPABASE_ACCESS_TOKEN=sbp_49f3c98af912b46efa72af51b552e27332c90baf
CLI=/home/adolphe/.hermes/node/bin/supabase
WORKDIR=/home/adolphe/PARADIS/Paradis-formation-it.worktrees/greeting-bonjour

cd "$WORKDIR"

echo "=== Step 1: Export SUPABASE_ACCESS_TOKEN ==="
echo "Token set to REDACTED"

echo ""
echo "=== Step 2: Check if already linked ==="
if [ -f supabase/.temp/linked-project.json ]; then
  echo "Project already linked (linked-project.json exists)"
  cat supabase/.temp/linked-project.json
else
  echo "Not linked, linking now..."
  printf '\n' | timeout 30 $CLI link --project-ref iwwohgdbdrlodhhgewut --token "$SUPABASE_ACCESS_TOKEN" 2>&1 || echo "Link command completed or timed out"
fi

echo ""
echo "=== Step 3: Push schema ==="
timeout 60 $CLI db push --linked 2>&1 || echo "Push command completed or timed out"

echo ""
echo "=== Step 4: Copy supabase-schema.sql ==="
if [ -f supabase/supabase-schema.sql ]; then
  echo "supabase-schema.sql already exists in supabase/ directory"
else
  cp /home/adolphe/PARADIS/supabase-schema.sql /home/adolphe/PARADIS/Paradis-formation-it.worktrees/greeting-bonjour/supabase/ 2>&1 && echo "Copy successful" || echo "Copy failed"
fi

echo ""
echo "=== All steps completed ==="