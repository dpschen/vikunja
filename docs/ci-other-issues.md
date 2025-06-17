# Remaining CI Workflow Issues

The following problems from the original review remain unresolved:

- **Weak commit message** – the latest commit lacks context about the change.
- **Redundant PNPM caching** – `setup-frontend` caches the pnpm store even though `actions/setup-node` already provides pnpm caching.
- **Missing Node/PNPM version in cache key** – the pnpm cache key does not include version information, risking corruption after upgrades.
- **Duplicated dependency installation** – Cypress is installed separately even though it is a dependency.
- **New job lacks documentation** – `install-deps` is not described in contributor docs.
- **Typecheck still fails** – running `pnpm typecheck` reports existing errors in unrelated files.
