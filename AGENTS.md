# AGENTS

These instructions summarize the development guidelines from the official Vikunja docs and CI workflows. They apply to the entire repository.

## Formatting
- Respect the formatting rules from `.editorconfig` in the repository root and all subfolders.
- The root `.editorconfig` covers the entire repository, including the frontend.
- When changing frontend code adhere to the ESLint rules defined in `frontend/eslint.config.js`. Run `bun run lint` (or `bun run lint --fix`) to check and automatically fix issues.
- When changing styles, use Tailwind classes with the configured prefix. Keep SCSS only when explicitly requested and only modify the parts that change.

# Building

1. **Frontend**:
        - Requires Node.js (version defined in `frontend/.nvmrc`) and [Bun](https://bun.sh/).
        - Run `bun install` inside `frontend/`.
        - Build with `bun run build` to create the `dist/` bundle.
        - Lint with `bun run lint` and run TypeScript checks with `bun run typecheck`.
        - Run frontend unit tests with `bun x vitest run --dir ./src`.
2. **API**:
	- Requires Go (use version from `go.mod`) and Mage.
	- If the frontend bundle is missing, build it or create a dummy file with `mkdir -p frontend/dist && touch frontend/dist/index.html`.
	- Build with `mage build`.
	- Lint with `mage lint` and run `mage check:translations` when translation files change.
3. Cross‑compile with `mage release` or `mage release:{linux|windows|darwin}`.

## Testing
- Set `VIKUNJA_SERVICE_ROOTPATH` to the repository root before running tests so fixtures load correctly.
- Run API unit tests with `mage test:unit`.
- Run API integration tests with `mage test:integration`.
- Run frontend unit tests with `bun x vitest run --dir ./src` (run `bun install` in `frontend/` first).
- Run `bun run lint` and `bun run typecheck` to match CI checks. `typecheck` might fail. Only make sure you don't create new issues.

## Pull Requests
- PRs must be opened against the `main` branch.
- Keep PRs small and focused. Allow maintainers to edit your branch.
- Describe the problem in the PR title and provide a summary in the first comment.
- If the PR changes the UI, include after screenshots.
- Reference issues with `Fixes/Closes/Resolves #<number>` each on its own line.
- Conventional Commit messages are appreciated but not mandatory.
