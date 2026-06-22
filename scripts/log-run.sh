#!/usr/bin/env bash
# ハンズオン実行ログを docs/chapters/<章>/commands/ に残すヘルパー
set -euo pipefail

if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <chapter-dir> <log-name> [--] <command...>"
    echo "Example: $0 docs/chapters/00-clone-and-amplify-baseline 01-npm-install -- npm install"
    exit 1
fi

CHAPTER_DIR="$1"
LOG_NAME="$2"
shift 2

if [[ "${1:-}" == "--" ]]; then
    shift
fi

CMD_DIR="${CHAPTER_DIR}/commands"
LOG_FILE="${CMD_DIR}/${LOG_NAME}.log"
mkdir -p "$CMD_DIR"

{
    echo "=== $(date -Iseconds) ==="
    echo "pwd: $(pwd)"
    echo "node: $(node -v 2>/dev/null || echo n/a)"
    echo "npm: $(npm -v 2>/dev/null || echo n/a)"
    echo "git HEAD: $(git rev-parse HEAD 2>/dev/null || echo n/a)"
    echo "command: $*"
    echo "---"
} >>"$LOG_FILE"

"$@" 2>&1 | tee -a "$LOG_FILE"
exit "${PIPESTATUS[0]}"
