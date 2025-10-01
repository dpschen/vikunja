# Branch Sync Instructions

This file documents the local steps taken to sync the repository with the upstream `go-vikunja/vikunja` repository and prepare a branch that can be pushed to the `dpschen` fork.

1. Added the upstream remote as `gh` pointing to `https://github.com/go-vikunja/vikunja.git`.
2. Fetched the latest changes from the upstream repository.
3. Created the `dpschen-sync` branch from the local base while setting it to track `gh/main`.
4. Added the fork remote `dpschen` pointing to `https://github.com/dpschen/vikunja.git`.
5. Attempted to push the new branch to the fork (requires valid GitHub credentials).

> Note: Pushing to the fork from this environment requires valid credentials. Provide credentials when prompted to complete the push.
