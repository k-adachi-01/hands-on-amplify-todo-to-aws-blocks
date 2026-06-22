#!/usr/bin/env bash
# Amplify Sandbox — AWS_PROFILE / .env.local を読んで ampx に --profile を渡す
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.local ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env.local
    set +a
fi

PROFILE_ARGS=()
if [[ -n "${AWS_PROFILE:-}" ]]; then
    PROFILE_ARGS=(--profile "$AWS_PROFILE")
fi

export NODE_OPTIONS="--conditions=cdk"
export AMPLIFY_SANDBOX=true
exec npx ampx sandbox "${PROFILE_ARGS[@]}" "$@"
