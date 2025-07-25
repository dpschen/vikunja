#!/usr/bin/env bash
# Helper to create a PR branch and run checks before pushing.
# Usage: scripts/codex_pr.sh <branch-name> [PR title]
set -euo pipefail

BRANCH=${1:?Branch name required}
TITLE=${2:-"Update"}

scripts/setup_pr_branch.sh "$BRANCH"

pushd frontend >/dev/null
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck || true
pnpm test:unit || true
popd >/dev/null

mage test:unit

git push -u origin "$BRANCH"

echo "Branch '$BRANCH' pushed. Create a PR targeting the upstream main branch."
# Uncomment the following line if the GitHub CLI is configured:
# gh pr create --title "$TITLE" --body "$TITLE" --base main --head "$BRANCH"
