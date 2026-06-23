#!/usr/bin/env bash
# Create chapter-2 test users in Sandbox Cognito (email pre-verified, no mail).
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

POOL="$(node -p "require('./amplify_outputs.json').auth.user_pool_id")"
PASS="${CHAPTER2_TEST_PASSWORD:-TestPass1!}"

for U in "${CHAPTER2_USER_A:-user-a@example.com}" "${CHAPTER2_USER_B:-user-b@example.com}"; do
  if aws cognito-idp admin-get-user "${PROFILE_ARGS[@]}" --user-pool-id "$POOL" --username "$U" >/dev/null 2>&1; then
    echo "User exists: $U"
    continue
  fi
  echo "Creating user: $U"
  aws cognito-idp admin-create-user \
    "${PROFILE_ARGS[@]}" \
    --user-pool-id "$POOL" \
    --username "$U" \
    --user-attributes "Name=email,Value=$U" "Name=email_verified,Value=true" \
    --message-action SUPPRESS
  aws cognito-idp admin-set-user-password \
    "${PROFILE_ARGS[@]}" \
    --user-pool-id "$POOL" \
    --username "$U" \
    --password "$PASS" \
    --permanent
done
