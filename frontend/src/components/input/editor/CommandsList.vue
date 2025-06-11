<template>
	<div class="items">
		<template v-if="items.length">
			<button
				v-for="(item, index) in items"
				:key="index"
				class="item"
				:class="{ 'is-selected': index === selectedIndex }"
				@click="selectItem(index)"
			>
				<Icon :icon="item.icon" />
				<div class="description">
					<p>{{ item.title }}</p>
					<p>{{ item.description }}</p>
				</div>
			</button>
		</template>
		<div
			v-else
			class="item"
		>
			No result
		</div>
	</div>
</template>

<script setup lang="ts">
// Renders the suggestion dropdown inside the editor.
// VueRenderer relies on the exposed onKeyDown handler and emitted events.
import {ref, watch, defineProps, defineExpose, defineEmits} from 'vue'
import type {IconProp} from '@fortawesome/fontawesome-svg-core'

interface CommandItem {
        title: string
        description: string
        icon: IconProp
        command: ({editor, range}: { editor: unknown; range: unknown }) => void
}

interface Props {
        items: CommandItem[]
        command: (item: CommandItem) => void
}

const props = defineProps<Props>()

// allow consumers (e.g. VueRenderer) to react to key events
const emit = defineEmits<{
    keydown: (event: KeyboardEvent) => void
}>()


const selectedIndex = ref(0)

// Reset the highlighted index whenever the list of commands changes
watch(() => props.items, () => {
       selectedIndex.value = 0
})

function upHandler() {
        selectedIndex.value = ((selectedIndex.value + props.items.length) - 1) % props.items.length
}

function downHandler() {
        selectedIndex.value = (selectedIndex.value + 1) % props.items.length
}

function selectItem(index: number) {
        const item = props.items[index]

        if (item) {
                props.command(item)
        }
}

function enterHandler() {
        selectItem(selectedIndex.value)
}

function onKeyDown({event}: {event: KeyboardEvent}) {
       // Let the parent component react to raw key events
       emit('keydown', event)
       if (event.key === 'ArrowUp') {
               upHandler()
               return true
       }

        if (event.key === 'ArrowDown') {
                downHandler()
                return true
        }

        if (event.key === 'Enter') {
                enterHandler()
                return true
        }

        return false
}

// expose the handler so VueRenderer can access it
defineExpose({
        onKeyDown,
})
</script>

<style lang="scss" scoped>
.items {
	padding: 0.2rem;
	position: relative;
	border-radius: 0.5rem;
	background: var(--white);
	color: var(--grey-900);
	overflow: hidden;
	font-size: 0.9rem;
	box-shadow: var(--shadow-md);
}

.item {
	display: flex;
	align-items: center;
	margin: 0;
	width: 100%;
	text-align: left;
	background: transparent;
	border-radius: $radius;
	border: 0;
	padding: 0.2rem 0.4rem;
	transition: background-color $transition;

	&.is-selected, &:hover {
		background: var(--grey-100);
		cursor: pointer;
	}
	
	> svg {
		box-sizing: border-box;
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--grey-300);
		padding: .5rem;
		margin-right: .5rem;
		border-radius: $radius;
		color: var(--grey-700);
	}
}

.description {
	display: flex;
	flex-direction: column;
	font-size: .9rem;
	color: var(--grey-800);
	
	p:last-child {
		font-size: .75rem;
		color: var(--grey-500);
	}
}
</style>
