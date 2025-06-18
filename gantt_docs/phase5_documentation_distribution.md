# Phase 5: Documentation & Distribution

The final phase covers how to document and ship the library. Notes from `COMPOSABLE_GANTT.md`:

- Create interactive docs with VitePress and VueUse-style demos.
- Provide Storybook stories for each primitive and composed component.
- Publish the package to npm with side‑effect‑free entrypoints and type declarations.
- Follow semantic versioning with a CHANGELOG and a migration guide from vue-ganttastic.

### Proposed VitePress Structure

```text
docs/
├─ .vitepress/
│  └─ config.ts
├─ guide/
│  ├─ introduction.md
│  ├─ usage.md
│  └─ styling.md
├─ api/
│  └─ index.md
└─ examples/
   ├─ basic.md
   └─ advanced.md
```

Example navigation snippet:

```ts
export default defineConfig({
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/introduction' },
            { text: 'API', link: '/api/' },
            { text: 'Examples', link: '/examples/basic' }
        ],
        sidebar: {
            '/guide/': [
                { text: 'Introduction', link: '/guide/introduction' },
                { text: 'Usage', link: '/guide/usage' },
                { text: 'Styling', link: '/guide/styling' }
            ]
        }
    }
})
```

### npm Package Preparation

1. Run `pnpm run build` to bundle ESM and CJS outputs and generate declaration files.
2. Bump the version with `pnpm version <major|minor|patch>` following semver.
3. Commit the changes and push tags.
4. Publish with `pnpm publish --access public`.

### CHANGELOG and Migration Guide

- Keep a `CHANGELOG.md` using the [Keep a Changelog](https://keepachangelog.com) format.
- Document breaking changes in a `MIGRATION_GUIDE.md`, outlining steps for upgrading from vue-ganttastic.
- Reference both documents in release notes so users can track updates and migrations easily.

## Task
- Elaborate on distribution workflow and documentation site structure using information from `COMPOSABLE_GANTT.md` and related resources.

Back to [index](index.md)
