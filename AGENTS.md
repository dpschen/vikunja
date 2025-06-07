# AGENTS

These instructions summarize the development guidelines from the official Vikunja docs and CI workflows. They apply to the entire repository.

## Development Environment
- Use [devenv](https://devenv.sh/) to get a shell with all required tools.
- Respect the formatting rules from `.editorconfig` in the repository root and
	all subfolders.

## Building From Source
1. Clone the repo and check out the desired version.
2. **Frontend**:
	- Requires Node.js 20+ and pnpm.
	- Run `pnpm install` inside `frontend/`.
	- Build with `pnpm run build` to create the `dist/` bundle.
	- Lint with `pnpm lint` and run TypeScript checks with `pnpm typecheck`.
	- Run frontend unit tests with `pnpm test:unit`.
3. **API**:
	- Requires Go 1.21+ and Mage.
	- If the frontend bundle is missing, create one or a dummy file with `mkdir -p frontend/dist && touch frontend/dist/index.html`.
	- Build with `mage build`.
	- Lint with `mage lint` and run `mage check:translations` when translation files change.
4. Cross‑compile with `mage release` or `mage release:{linux|windows|darwin}`.

## Testing
- Set `VIKUNJA_SERVICE_ROOTPATH` to the repository root before running tests so fixtures load correctly.
- Run API unit tests with `mage test:unit`.
- Run API integration tests with `mage test:integration`.
- Run frontend unit tests with `pnpm test:unit` (run `pnpm install` in `frontend/` first).

## Pull Requests
- PRs must be opened on our [Gitea instance](https://kolaente.dev/vikunja) against the `main` branch.
- Keep PRs small and focused. Allow maintainers to edit your branch.
- Describe the problem in the PR title and provide a summary in the first comment.
- If the PR changes the UI, include after screenshots.
- Reference issues with `Fixes/Closes/Resolves #<number>` each on its own line.
- Conventional Commit messages are appreciated but not mandatory.
