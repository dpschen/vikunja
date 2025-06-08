# AGENTS

These instructions summarize the development guidelines from the official Vikunja docs and CI workflows. They apply to the entire repository.

## Development Environment
- Use [devenv](https://devenv.sh/) to get a shell with all required tools.

## Building From Source
1. Clone the repo and check out the desired version.

2. **Frontend**:
	- Requires Node.js (version defined in `frontend/.nvmrc`) and pnpm (install via corepack).
	- Run `pnpm install --frozen-lockfile` inside `frontend/`.
	- Build with `pnpm run build` to create the `dist/` bundle.
	- Lint with `pnpm lint` and run TypeScript checks with `pnpm typecheck`.
	- Run frontend unit tests with `pnpm test:unit`.
3. **API**:
	- Requires Go (use version from `go.mod`) and Mage.
	- If the frontend bundle is missing, build it or create a dummy file with `mkdir -p frontend/dist && touch frontend/dist/index.html`.
	- Build with `mage build`.
	- Lint with `mage lint` and run `mage check:translations` when translation files change.
4. Cross‑compile with `mage release` or `mage release:{linux|windows|darwin}`.

## Formatting
- Respect the formatting rules from `.editorconfig` in the repository root and all subfolders.
- Adhere to the ESLint rules defined in `frontend/eslint.config.js`. Run `pnpm lint` (or `pnpm lint:fix`) to check and automatically fix issues.
- Tabs should display as 4 spaces; both `.editorconfig` files set `tab_width = 4`.
- Avoid barrel index files that only re-export modules.

## Testing
- Set `VIKUNJA_SERVICE_ROOTPATH` to the repository root before running tests so fixtures load correctly.
- Run API unit tests with `mage test:unit`.
- Run API integration tests with `mage test:integration`.
- Run frontend unit tests with `pnpm test:unit` (run `pnpm install --frozen-lockfile` in `frontend/` first).
- Run `pnpm lint` and `pnpm typecheck` to match CI checks. `typecheck` might fail. Only make sure you don't create new issues.

## Pull Requests
- PRs must be opened against the `main` branch.
- Keep PRs small and focused. Allow maintainers to edit your branch.
- Describe the problem in the PR title and provide a summary in the first comment.
- If the PR changes the UI, include after screenshots.
- Reference issues with `Fixes/Closes/Resolves #<number>` each on its own line.
- Conventional Commit messages are appreciated but not mandatory.
