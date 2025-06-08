<script setup lang="ts">
import {ref, watch} from 'vue'
import {useAutoHeightTextarea} from '@/composables/useAutoHeightTextarea'
import DatepickerWithValues from '@/components/date/DatepickerWithValues.vue'
import AutocompleteDropdown from '@/components/input/AutocompleteDropdown.vue'
import XLabel from '@/components/tasks/partials/Label.vue'
import User from '@/components/misc/User.vue'
import {useFilterQuery} from '@/composables/useFilterQuery'
import {useDebounceFn} from '@vueuse/core'
import {createRandomID} from '@/helpers/randomId'

const props = defineProps<{
        modelValue: string,
        projectId?: number,
        inputLabel?: string,
}>()

const emit = defineEmits<{
        'update:modelValue': [value: string],
        'blur': [],
}>()

const {
        filterQuery,
        highlightedFilterQuery,
        currentDatepickerValue,
        datePickerPopupOpen,
        updateDateInQuery,
        autocompleteResults,
        autocompleteResultType,
        handleFieldInput,
        autocompleteSelect,
        updateQuery,
} = useFilterQuery(() => props.projectId)

const { textarea: filterInput, height } = useAutoHeightTextarea(filterQuery)

const id = ref(createRandomID())

watch(
        () => props.modelValue,
        () => updateQuery(props.modelValue),
        { immediate: true },
)

watch(
        () => filterQuery.value,
        () => {
                if (filterQuery.value !== props.modelValue) {
                        emit('update:modelValue', filterQuery.value)
                }
        },
)

const blurDebounced = useDebounceFn(() => emit('blur'), 500)
</script>
<!-- eslint-disable vue/no-v-html -->

<template>
	<div class="field">
		<label
			class="label"
			:for="id"
		>
			{{ inputLabel ?? $t('filters.query.title') }}
		</label>
		<AutocompleteDropdown
			:options="autocompleteResults"
			@blur="filterInput?.blur()"
			@update:modelValue="autocompleteSelect"
		>
			<template
				#input="{ onKeydown, onFocusField }"
			>
				<div class="control filter-input">
					<textarea
						:id
						ref="filterInput"
						v-model="filterQuery"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						class="input"
						:class="{'has-autocomplete-results': autocompleteResults.length > 0}"
						:placeholder="$t('filters.query.placeholder')"
						@input="handleFieldInput(filterInput)"
						@focus="onFocusField"
						@keydown="onKeydown"
						@keydown.enter.prevent="blurDebounced"
						@blur="blurDebounced"
					/>
					<div
						class="filter-input-highlight"
						:style="{'height': height}"
						v-html="highlightedFilterQuery"
					/>
					<DatepickerWithValues
						v-model="currentDatepickerValue"
						v-model:open="datePickerPopupOpen"
						@update:modelValue="updateDateInQuery"
					/>
				</div>
			</template>
			<template
				#result="{ item }"
			>
				<XLabel
					v-if="autocompleteResultType === 'labels'"
					:label="item"
				/>
				<User
					v-else-if="autocompleteResultType === 'assignees'"
					:user="item"
					:avatar-size="25"
				/>
				<template v-else>
					{{ item.title }}
				</template>
			</template>
		</AutocompleteDropdown>
	</div>
</template>

<style lang="scss">
.filter-input-highlight {

	&, button.filter-query__date_value {
		color: var(--card-color);
	}

	span {
		&.filter-query__field {
			color: var(--code-literal);
		}

		&.filter-query__operator {
			color: var(--code-keyword);
		}

		&.filter-query__join-operator {
			color: var(--code-section);
		}

		&.filter-query__date_value_placeholder {
			display: inline-block;
			color: transparent;
		}

		&.filter-query__assignee_value, &.filter-query__label_value {
			border-radius: $radius;
			background-color: var(--grey-200);
			color: var(--grey-700);
		}
	}

	button.filter-query__date_value {
		border-radius: $radius;
		position: absolute;
		margin-top: calc((0.25em - 0.125rem) * -1);
		height: 1.75rem;
		padding: 0;
		border: 0;
		background: transparent;
		font-size: 1rem;
		cursor: pointer;
		line-height: 1.5;
	}
}
</style>

<style lang="scss" scoped>
.filter-input {
	position: relative;

	textarea {
		position: absolute;
		background: transparent !important;
		resize: none;
		text-fill-color: transparent;
		-webkit-text-fill-color: transparent;

		&::placeholder {
			text-fill-color: var(--input-placeholder-color);
			-webkit-text-fill-color: var(--input-placeholder-color);
		}

		&.has-autocomplete-results {
			border-radius: var(--input-radius) var(--input-radius) 0 0;
		}
	}

	.filter-input-highlight {
		background: var(--white);
		height: 2.5em;
		line-height: 1.5;
		padding: .5em .75em;
		word-break: break-word;
	}
}
</style>
