# Learn More Links

The Vikunja frontend includes a reusable help link component which directs users to the official documentation.

## LearnMore Component

Use the `<LearnMore>` component to show a help icon and the text from the `misc.learnMore` translation key. Provide an optional `path` prop to append a documentation path to the configured docs URL:

```html
<LearnMore path="caldav/" />
```

## Configurable Docs URL

The component builds links using the `DOCS_URL` constant from `src/urls.ts`. The value defaults to `https://vikunja.io/docs/` but can be overridden by setting `window.DOCS_URL` before the app is loaded.

## Appearance

The component uses Tailwind CSS to render a small, light‑grey help icon and text.
