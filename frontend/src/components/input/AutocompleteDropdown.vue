<script setup lang="ts">
import {type ComponentPublicInstance, nextTick, ref, watch} from 'vue'
import {useDropdownNavigation} from '@/composables/useDropdownNavigation'

withDefaults(defineProps<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: any[],
        suggestion?: string,
        maxHeight?: number,
}>(), {
        maxHeight: 200,
        suggestion: '',
})

const emit = defineEmits(['blur'])

const ESCAPE = 27,
	ARROW_UP = 38,
	ARROW_DOWN = 40

type StateType = 'unfocused' | 'focused'

const {
        selectedIndex,
        setResultRef,
        focusItem,
        moveSelection,
} = useDropdownNavigation<HTMLElement | ComponentPublicInstance>()

const state = ref<StateType>('unfocused')
const val = ref<string>('')
const model = defineModel<string>()

const suggestionScrollerRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLInputElement | null>(null)
const editorRef = ref<HTMLInputElement | null>(null)

watch(
        () => model.value,
        newValue => {
                val.value = newValue
        },
)

watch(selectedIndex, updateSuggestionScroll)

function updateSuggestionScroll() {
	nextTick(() => {
		const scroller = suggestionScrollerRef.value
		const selectedItem = scroller?.querySelector('.selected')
		scroller.scrollTop = selectedItem ? selectedItem.offsetTop : 0
	})
}

function setState(stateName: StateType) {
	state.value = stateName
	if (stateName === 'unfocused') {
		emit('blur')
	}
}

function onFocusField() {
	setState('focused')
}

function onKeydown(e) {
	switch (e.keyCode || e.which) {
		case ESCAPE:
			e.preventDefault()
			setState('unfocused')
			break
                case ARROW_UP:
                        e.preventDefault()
                        moveSelection(-1)
                        break
                case ARROW_DOWN:
                        e.preventDefault()
                        moveSelection(1)
                        break
        }
}


function onSelectValue(value) {
        model.value = value
        focusItem(0)
        setState('unfocused')
}

function onUpdateField(e) {
	setState('focused')
	model.value = e.currentTarget.value
}
</script>

<template>
	<div
		ref="containerRef"
		class="autocomplete"
	>
		<div class="entry-box">
			<slot
				name="input"
				:on-update-field
				:on-focus-field
				:on-keydown
			>
				<textarea
					ref="editorRef"
					class="field"
					:class="state"
					:value="val"
					@input="onUpdateField"
					@focus="onFocusField"
					@keydown="onKeydown"
				/>
			</slot>
		</div>
		<div
			v-if="state === 'focused' && options.length"
			class="suggestion-list"
		>
			<div
				v-if="options && options.length"
				class="scroll-list"
			>
				<div
					ref="suggestionScrollerRef"
					class="items"
					@keydown="onKeydown"
				>
					<button
						v-for="(item, index) in options"
						:key="item"
                                               :ref="(el: Element | ComponentPublicInstance | null) => setResultRef(el, index)"
						class="item"
						:class="{ selected: index === selectedIndex }"
						@focus="() => focusItem(index)"
						@click="onSelectValue(item)"
					>
						<slot
							name="result"
							:item
							:selected="index === selectedIndex"
						>
							{{ item }}
						</slot>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.autocomplete {
	position: relative;

	.suggestion-list {
		position: absolute;

		background: var(--white);
		border-radius: 0 0 var(--input-radius) var(--input-radius);
		border: 1px solid var(--primary);
		border-top: none;

		max-height: 50vh;
		overflow-x: auto;
		z-index: 100;
		max-width: 100%;
		min-width: 100%;
		margin-top: -2px;

		button {
			width: 100%;
			background: transparent;
			border: 0;

			font-size: .9rem;
			width: 100%;
			color: var(--grey-800);
			text-align: left;
			box-shadow: none;
			text-transform: none;
			font-family: $family-sans-serif;
			font-weight: normal;
			padding: .5rem .75rem;
			border: none;
			cursor: pointer;

			&:focus,
			&:hover {
				background: var(--grey-100);
				box-shadow: none !important;
			}

			&:active {
				background: var(--grey-100);
			}
		}
	}
}
</style>
