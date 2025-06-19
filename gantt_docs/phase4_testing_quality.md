# Phase 4: Testing & Quality

Testing and quality assurance goals from `COMPOSABLE_GANTT.md`:

- Unit test composables with Vitest.
- End-to-end tests for interactive behavior using Playwright.
- Apply ESLint, Prettier, and TypeScript rules following the Vue style guide.
- Configure GitHub Actions for build, test, and publishing workflows.

## Example configuration

Run Vitest with a simple setup:

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        globals: true
    }
})
```

Basic Playwright test:

```ts
import { test, expect } from '@playwright/test'

test('bars can be dragged', async ({ page }) => {
    await page.goto('http://localhost:4173')
    await page.locator('[data-bar-id="1"]').dragTo(
        page.locator('[data-drop-zone="timeline"]')
    )
    await expect(page.locator('[data-bar-id="1"]')).toHaveAttribute(
        'data-state',
        /dragging/
    )
})
```

## CI integration

- `COMPOSABLE_GANTT.md` calls for GitHub Actions to build, test and publish. The
  repository's `test.yml` workflow runs `pnpm lint` (ESLint and Prettier),
  `pnpm typecheck`, unit tests and Playwright E2E tests.
- Formatting fixes can be applied locally with `pnpm lint:fix` before pushing.

## Additional tips

- Mock external dependencies with `vi.mock` or dependency injection.
- Use Playwright's `--headless` flag or a Docker browser image to run tests
  without a visible UI.

## Task
- Build out a complete testing strategy referencing `COMPOSABLE_GANTT.md` and other resources on Vue testing best practices.
- [ ] Define unit and end-to-end test requirements
- [ ] Document linting and formatting checks
- [ ] Outline GitHub Actions workflow steps
- [ ] Include tips for mocking and headless browser usage

Back to [index](index.md)
