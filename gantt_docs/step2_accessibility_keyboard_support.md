# Implementation Step 2: Accessibility and Keyboard Support

Based on the concept and `COMPOSABLE_GANTT.md`:

- Follow the ARIA grid pattern for keyboard navigation (arrow keys, home/end, page navigation).
- Expose `aria-selected` and `data-state="selected"` attributes for styling and accessibility.
- Handle focus management and outside-click deselection using VueUse's `onClickOutside`.

## Task
- Develop a comprehensive accessibility guide referencing `COMPOSABLE_GANTT.md` and WAI-ARIA resources, covering all keyboard interactions and ARIA roles.

## Testing with VoiceOver or NVDA
- On macOS, enable VoiceOver with `Cmd-F5` and use Control+Option+arrow keys to navigate the grid. Ensure row, column and selection information is announced.
- On Windows, start NVDA with `Ctrl-Alt-N` and use the arrow keys to move through cells. Verify that each cell's text and `aria-selected` state are read aloud.
