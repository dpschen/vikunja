# Branch Sync Instructions

This file records the local steps for preparing the `dpschen-sync` branch that mirrors `go-vikunja/vikunja`.

## Current local setup

1. Renamed the previous working branch `work` to `dpschen-sync`:
   ```bash
   git branch -m dpschen-sync
   ```
2. (Optional) Add the upstream remote and fetch the latest code:
   ```bash
   git remote add gh https://github.com/go-vikunja/vikunja.git
   git fetch gh
   ```
3. (Optional) Configure the local branch to track the upstream main branch:
   ```bash
   git branch --set-upstream-to=gh/main dpschen-sync
   ```
4. (Optional) Add the fork remote for `dpschen` and push the branch once credentials are available:
   ```bash
   git remote add dpschen https://github.com/dpschen/vikunja.git
   git push -u dpschen dpschen-sync
   ```

## Notes on GitHub CLI usage

Running commands such as `gh repo view` requires authentication in this environment. Provide a valid GitHub token via `gh auth login` or the `GH_TOKEN` environment variable before retrying.

> Note: Pushing to the fork from this environment requires valid credentials. Provide credentials when prompted to complete the push.
