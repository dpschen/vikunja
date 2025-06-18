# Running a single Cypress test locally

This documents troubleshooting steps when running Cypress locally.

## Steps
1. Install frontend deps and build:
   ```bash
   cd frontend
   pnpm install --frozen-lockfile
   pnpm run build
   ```
2. Build the API binary from the repo root:
   ```bash
   mage build
   ```
3. Start the API with testing token and set the root path:
   ```bash
   export VIKUNJA_SERVICE_ROOTPATH=$(pwd)
   export VIKUNJA_SERVICE_TESTINGTOKEN=averyLongSecretToSe33dtheDB
   ./vikunja &
   ```
4. If Vite preview fails because port `4173` is already in use, stop the process holding it (check with `ss -ltnp`) and retry:
   ```bash
   kill <pid>
   ```
5. Run the frontend preview server in the background:
   ```bash
   cd frontend
   nohup pnpm run preview -- --port 4173 > /tmp/preview.log 2>&1 &
   ```
6. If Chrome is not installed locally, consider running Cypress inside the `cypress/browsers` Docker image. As a last resort you can install `xvfb` and run with Electron.
7. Run a single Cypress spec with Chrome (the same browser used in CI):
   ```bash
   CYPRESS_API_URL=http://127.0.0.1:3456/api/v1 \
   CYPRESS_TEST_SECRET=averyLongSecretToSe33dtheDB \
   pnpm exec cypress run --e2e --browser chrome --spec cypress/e2e/user/login.spec.ts
   ```

If Chrome is missing, the command will fail. After the run, stop the API and preview processes with `kill %1`.
If the test fails, check `/tmp/cypress.log` for details.

## Ensure a fresh binary cache

```bash
npx --no-install cypress cache clear
```
