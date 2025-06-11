<script setup lang="ts">
import {ref, watch, onMounted} from 'vue'
import {EditorState} from '@codemirror/state'
import {EditorView, keymap} from '@codemirror/view'
import {defaultKeymap} from '@codemirror/commands'
import {filterLanguageSupport} from '@/codemirror/filterLanguage'

const props = defineProps<{modelValue: string}>()
const emit = defineEmits<{ 'update:modelValue':[value:string] }>()

const query = ref(props.modelValue)
let _view: EditorView | null = null

watch(
       () => props.modelValue,
       v => {
               if (v !== query.value) {
                       query.value = v
                       if (_view) {
                               _view.dispatch({
                                       changes: {from: 0, to: _view.state.doc.length, insert: v},
                               })
                       }
               }
       },
)
watch(
       query,
       v => {
               if (v !== props.modelValue) emit('update:modelValue', v)
       },
)

onMounted(() => {
	_view = new EditorView({
	 state: EditorState.create({
	 doc: query.value,
	 extensions: [
	  keymap.of(defaultKeymap),
	  filterLanguageSupport(),
	  EditorView.updateListener.of(update => {
	  if (update.docChanged) {
	query.value = update.state.doc.toString()
	  }
	  }),
	 ],
	 }),
	 parent: document.querySelector('#cmcontainer') as HTMLElement,
	})
})
</script>

<template>
	<div
		id="cmcontainer"
		class="filter-input-cm"
	/>
</template>

<style scoped>
.filter-input-cm {
	border: 1px solid var(--grey-300);
}
</style>
