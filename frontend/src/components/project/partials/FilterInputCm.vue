<script setup lang="ts">
import {ref, watchEffect, onMounted, onBeforeUnmount, shallowRef} from 'vue'
import {useVModel} from '@vueuse/core'
import {EditorState} from '@codemirror/state'
import {EditorView, keymap} from '@codemirror/view'
import {defaultKeymap} from '@codemirror/commands'
import {filterLanguageSupport} from '@/codemirror/filterLanguage'

const props = defineProps<{modelValue: string}>()
const emit = defineEmits<{ 'update:modelValue':[value:string] }>()
const model = useVModel(props, 'modelValue', emit)

const container = ref<HTMLElement | null>(null)
const view = shallowRef<EditorView | null>(null)
defineExpose({model, view})

onMounted(() => {
        view.value = new EditorView({
                state: EditorState.create({
                        doc: model.value,
                        extensions: [
                                keymap.of(defaultKeymap),
                                filterLanguageSupport(),
                                EditorView.updateListener.of(update => {
                                        if (update.docChanged) {
                                                model.value = update.state.doc.toString()
                                        }
                                }),
                        ],
                }),
                parent: container.value!,
        })
})

watchEffect(() => {
        if (!view.value) return
        const current = view.value.state.doc.toString()
        if (current !== model.value) {
                view.value.dispatch({
                        changes: {from: 0, to: current.length, insert: model.value},
                })
        }
})

onBeforeUnmount(() => view.value?.destroy())
</script>

<template>
	<div
		ref="container"
		class="filter-input-cm"
	/>
</template>

<style scoped>
.filter-input-cm {
        border: 1px solid var(--grey-300);
}
</style>
