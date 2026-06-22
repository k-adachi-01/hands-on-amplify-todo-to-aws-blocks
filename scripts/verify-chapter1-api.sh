#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-http://127.0.0.1:3002}"
API="${BASE}/aws-blocks/api"

echo "GET ${BASE}/ (API-only server may return 404)"
curl -s -o /dev/null -w "HTTP %{http_code}\n" "${BASE}/" || true

echo "RPC api.createTodo"
CREATE=$(curl -sf -X POST "${API}" \
    -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"api.createTodo","params":["verify-script-todo"],"id":1}')
echo "$CREATE"

echo "RPC api.listTodos"
LIST=$(curl -sf -X POST "${API}" \
    -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","method":"api.listTodos","params":[],"id":2}')
echo "$LIST"

echo "OK"
