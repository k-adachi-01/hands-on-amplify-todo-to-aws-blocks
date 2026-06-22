#!/usr/bin/env bash
# Chapter 2: Cognito user isolation smoke test (Sandbox Blocks API + Amplify SRP signIn).
#
# Prerequisites:
#   - amplify_outputs.json present (npm run sandbox)
#   - Test users (see docs/chapters/03-chapter2-cognito-auth/README.md)
#
# Usage:
#   npm run verify:chapter2
#   BLOCKS_API_URL=http://127.0.0.1:3000/aws-blocks/api npm run verify:chapter2

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec npx tsx scripts/verify-chapter2-auth.ts "$@"
