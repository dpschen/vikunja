# Gantt Components Overview

This document summarizes the planned structure of the headless Gantt chart library. The design is based on **COMPOSABLE_GANTT.md**.

## Three‑Layer Architecture

As described in [COMPOSABLE_GANTT.md](../COMPOSABLE_GANTT.md) lines 457‑466, the library separates concerns into three layers:

```
Core primitives   ->  useGantt, <GanttChart>, <GanttRow>, <GanttBar>
Styled wrappers   ->  <StyledGanttChart> adds default classes
Domain layer      ->  <GanttTask> components binding application data
```

The core layer exposes unstyled components with full ARIA roles and keyboard behaviour. Styled wrappers provide optional Tailwind tokens while the domain layer connects tasks and dependencies.

## Example TypeScript Interface

The following interface and composable skeleton reflect the proposal in [COMPOSABLE_GANTT.md](../COMPOSABLE_GANTT.md) lines 488‑514:

```ts
export interface UseGanttOptions {
    startDate: Date
    endDate: Date
    precision?: 'hour' | 'day'
    window?: ConfigurableWindow
}

export function useGantt(options: UseGanttOptions) {
    const { startDate, endDate, precision, window = defaultWindow } = options
    const timeScale = ref(generateScale(startDate, endDate, precision))
    const bars = shallowRef([])
    const isDragSupported = ref(isPointerEventsSupported(window))
    // ...
    return { timeScale, bars, isDragSupported }
}
```

This skeleton showcases the reactive state returned from `useGantt` and demonstrates how the composable follows VueUse conventions.

A `<GanttChart>` component would consume this composable and render slots for rows and bars. It should apply `role="application"` as shown in the same section of **COMPOSABLE_GANTT.md**.
