# Phase 1: Landscape & Style Research

This phase focuses on exploring best practices for headless component design and styling conventions. Key points from `COMPOSABLE_GANTT.md` include:

- Study Headless UI primitives and accessibility model.
- Review VueUse composable guidelines covering option objects, reactivity, and `isSupported` flags.
- Analyze Reka UI's class-through APIs and WAI-ARIA compliance.
- Inspect vue-ganttastic to understand its API surface and slot usage.

## Headless UI

Headless UI provides unstyled primitives which expose complete keyboard
interactions and ARIA states. Components like
[`<Listbox>`](https://headlessui.com/vue/listbox) manage focus and
selection logic while leaving all styling to the consumer via `class`
attributes.

## VueUse

VueUse organizes composables under the `use` prefix and guards browser
APIs with `isSupported` flags. For example,
[`useElementBounding`](https://vueuse.org/useElementBounding/) returns
reactive size information and disables updates during SSR when
`isSupported` is `false`.

## Reka UI

Reka UI focuses on class passthrough. Components such as
[`Button`](https://reka-ui.com/docs/button) forward the `class` prop and
`data-state` attribute so you can style them with Tailwind or another
framework while retaining WAI-ARIA semantics.

## vue-ganttastic

vue-ganttastic exposes a `<g-gantt-chart>` wrapper with slots including
`<g-gantt-row>` for bars. Its
[documentation](https://github.com/incubateur-charts/vue-ganttastic)
highlights slot props like `bar-start` and `bar-end` to customize bar
rendering and behavior.

## Task
- Expand this document with deeper research from `COMPOSABLE_GANTT.md` and other sources, detailing specific takeaways and references for each bullet point.
- [ ] Research summary covering headless libraries
- [ ] Styling comparison notes
- [ ] Reference links for further reading

Back to [index](index.md)
