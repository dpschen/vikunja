# Implementation Step 2: Accessibility and Keyboard Support

Based on the concept and `COMPOSABLE_GANTT.md`:

- Follow the ARIA grid pattern for keyboard navigation (arrow keys, home/end, page navigation).
- Expose `aria-selected` and `data-state="selected"` attributes for styling and accessibility.
- Handle focus management and outside-click deselection using VueUse's `onClickOutside`.
- Use explicit roles on each element:
  - `role="grid"` on the chart container with `tabindex="0"` for initial focus.
  - `role="row"` on row groups and `role="gridcell"` on each bar container.
  - Manage active cells via `aria-activedescendant` or `tabindex` handling.
  - Optionally set `aria-colindex`, `aria-rowindex` and `aria-disabled` for stateful bars.

### Example markup

```vue
<GanttChartPrimitive
    role="grid"
    tabindex="0"
    @keydown="onGridKeydown"
>
    <g role="row" v-for="(row, rowIndex) in rows" :key="row.id">
        <g
            role="gridcell"
            :aria-colindex="bar.col"
            :aria-rowindex="rowIndex + 1"
            :aria-selected="isSelected(bar)"
            :data-state="isSelected(bar) ? 'selected' : undefined"
            tabindex="-1"
            @keydown="onCellKeydown(bar)"
        >
            <!-- bar rendering here -->
        </g>
    </g>
</GanttChartPrimitive>
```

- `onGridKeydown` handles Home/End/PageUp/PageDown navigation across the grid.
- `onCellKeydown` manages Enter, Space, and arrow key movement between bars.

## Task
- Develop a comprehensive accessibility guide referencing `COMPOSABLE_GANTT.md` and WAI-ARIA resources, covering all keyboard interactions and ARIA roles.
- [ ] ARIA role mapping table
- [ ] Keyboard interaction matrix
- [ ] Focus management examples

## Testing with VoiceOver or NVDA
- On macOS, enable VoiceOver with `Cmd-F5` and use Control+Option+arrow keys to navigate the grid. Ensure row, column and selection information is announced.
- On Windows, start NVDA with `Ctrl-Alt-N` and use the arrow keys to move through cells. Verify that each cell's text and `aria-selected` state are read aloud.

----

Back to [index](index.md)
