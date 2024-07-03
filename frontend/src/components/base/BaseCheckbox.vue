<template>
	<div
		v-cy="'checkbox'"
		class="base-checkbox"
	>
		<input
			:id="id || internalId"
			:name="name"
			type="checkbox"
			class="is-sr-only"
			:disabled="disabled || undefined"
			:required="required || undefined"
			:checked="modelValue"
			@change="(event) => emit('update:modelValue', (event.target as HTMLInputElement).checked)"
		>

		<slot name="icon" />

		<slot
			v-if="$slots.default"
			name="label"
			:checkbox-id="id || internalId"
		>
			<label
				:for="internalId"
				class="base-checkbox__label"
			>
				<slot />
			</label>
		</slot>
	</div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {createRandomID} from '@/helpers/randomId'

withDefaults(defineProps<{
	modelValue?: boolean,
	disabled?: boolean,
	required?: boolean,
	id?: string
	name?: string
}>(), {
	modelValue: false,
	disabled: false,
	required: false,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const internalId = ref(`checkbox_${createRandomID()}`)
</script>

<style lang="scss" scoped>
.base-checkbox__label {
	cursor: pointer;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
	display: inline-flex;
}

.base-checkbox:has(input:disabled) .base-checkbox__label {
	cursor:not-allowed;
	pointer-events: none;
}
</style>