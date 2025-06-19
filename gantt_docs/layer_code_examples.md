# Layered Architecture Code Examples

This document demonstrates minimal Vue snippets for the three-layer architecture described in [COMPOSABLE_GANTT.md](../composable-gantt/COMPOSABLE_GANTT.md).

## Core Layer – `GanttBarPrimitive.vue`

```vue
<script setup lang="ts">
const props = defineProps({
  id: String,
  modelValue: Object,
  as: { type: String, default: 'rect' }
})
const { dragging, selected, onDragStart, onKeyDown } = useGanttBar(props)
</script>

<component
  :is="as"
  :data-state="[dragging && 'dragging', selected && 'selected'].filter(Boolean).join(' ')"
  role="slider"
  tabindex="0"
  @mousedown="onDragStart"
  @keydown="onKeyDown"
>
  <slot :dragging="dragging" :selected="selected" />
</component>
```

## Styled Layer – `StyledGanttBar.vue`

```vue
<script setup lang="ts">
import GanttBarPrimitive from './GanttBarPrimitive.vue'

defineProps<{ model: any }>()
</script>

<GanttBarPrimitive :model-value="model" as="rect" v-slot="{ dragging, selected }">
  <rect
    :x="model.start"
    :width="model.end - model.start"
    y="4"
    height="16"
    rx="3"
    :class="[
      'fill-blue-500',
      dragging && 'opacity-50',
      selected && 'stroke-blue-700'
    ]"
  />
</GanttBarPrimitive>
```

## Domain Layer – `TaskGanttChart.vue`

```vue
<script setup lang="ts">
import StyledGanttBar from './StyledGanttBar.vue'
import useGantt from './useGantt'

const { rows, bars } = useGantt({ start: new Date(), end: new Date() })
</script>

<svg>
  <g v-for="row in rows" :key="row.id">
    <StyledGanttBar
      v-for="bar in bars[row.id]"
      :key="bar.id"
      :model="bar"
    />
  </g>
</svg>
```

Back to [index](index.md).

