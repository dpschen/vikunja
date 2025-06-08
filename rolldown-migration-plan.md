# Rolldown-Vite Migration Plan

This document outlines the steps to experiment with `rolldown-vite` as the bundler for Vikunja's frontend.

1. **Install `rolldown-vite`**
   - Replace the existing `vite` dev dependency with an alias:
     ```json
     {
       "devDependencies": {
         "vite": "npm:rolldown-vite@latest"
       }
     }
     ```
   - Add a pnpm override so that all transitive packages use `rolldown-vite`:
     ```json
     {
       "pnpm": {
         "overrides": {
           "vite": "npm:rolldown-vite@latest"
         }
       }
     }
     ```

2. **Install and build**
   - Run `pnpm install` in `frontend/`.
   - Run `pnpm vite` for development or `pnpm vite build` for production builds.
   - If caches become stale, run `pnpm vite --force`.

3. **Dealing with incompatibilities**
   - Some Rollup options may not be supported yet. When builds fail, try running with:
     ```bash
     export ROLLDOWN_OPTIONS_VALIDATION=loose
     ```
   - Check for plugins that rely on unsupported features and apply tweaks as needed.
   - Patch `peerDependenciesMeta` or adjust overrides if pnpm reports unmet peers.

4. **Testing**
   - Run `pnpm lint`, `pnpm typecheck`, and `pnpm test:unit` to ensure the frontend still builds.
   - Run `mage test:unit` and `mage test:integration` for the API.
   - Keep the dummy `frontend/dist/index.html` in place when running Go tests without a build.

5. **Monitoring**
   - `rolldown-vite` may introduce breaking changes in patch releases. Review its changelog before upgrading.
   - Track build performance and resource usage to compare with the current setup.

This plan keeps the existing scripts in place—`pnpm run dev` and `pnpm run build` continue to work—while experimenting with Rolldown's speed improvements.
