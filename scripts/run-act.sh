#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v act >/dev/null 2>&1; then
    echo "act is required. Install it from https://github.com/nektos/act/releases" >&2
    exit 1
fi

# Install repo prerequisites if missing
"$SCRIPT_DIR/install-tools.sh" >/dev/null

docker pull ghcr.io/catthehacker/ubuntu:act-latest >/dev/null

act "$@"

