#!/usr/bin/env bash
# Synchronize upstream-main with upstream/main and create a new feature branch.
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <new-branch-name>" >&2
  exit 1
fi

BRANCH_NAME="$1"

# Ensure we have an upstream remote
if ! git remote | grep -q '^upstream$'; then
  echo "Remote 'upstream' not found. Add it with:\n  git remote add upstream https://github.com/go-vikunja/vikunja.git" >&2
  exit 1
fi

# Fetch and update upstream-main
git fetch upstream
if git show-ref --quiet refs/heads/upstream-main; then
  git checkout upstream-main
else
  git checkout -b upstream-main upstream/main
fi

git reset --hard upstream/main

git checkout -b "$BRANCH_NAME"

echo "Created branch $BRANCH_NAME based on upstream/main"
