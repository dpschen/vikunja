<template>
	<div
		:class="{ 'is-loading': taskService.loading }"
		class="defer-task loading-container"
	>
		<label class="label">{{ $t('task.deferDueDate.title') }}</label>
		<div class="defer-days">
			<XButton
				:shadow="false"
				variant="secondary"
				@click.prevent.stop="() => deferDays(1)"
			>
				{{ $t('task.deferDueDate.1day') }}
			</XButton>
			<XButton
				:shadow="false"
				variant="secondary"
				@click.prevent.stop="() => deferDays(3)"
			>
				{{ $t('task.deferDueDate.3days') }}
			</XButton>
			<XButton
				:shadow="false"
				variant="secondary"
				@click.prevent.stop="() => deferDays(7)"
			>
				{{ $t('task.deferDueDate.1week') }}
			</XButton>
		</div>
		<flat-pickr
			v-model="dueDate"
			:class="{ disabled: taskService.loading }"
			:config="flatPickerConfig"
			:disabled="taskService.loading || undefined"
			class="input"
		/>
	</div>
</template>

<script setup lang="ts">
import {ref, shallowReactive, computed, watch, onBeforeUnmount} from 'vue'
import {useIntervalFn} from '@vueuse/core'
import {useI18n} from 'vue-i18n'
import flatPickr from 'vue-flatpickr-component'

import TaskService from '@/services/task'
import type {ITask} from '@/modelTypes/ITask'
import {useFlatpickrLanguage} from '@/helpers/useFlatpickrLanguage'

const props = defineProps<{
	modelValue: ITask,
}>()

const emit = defineEmits<{
	'update:modelValue': [value: ITask]
}>()

const {t} = useI18n({useScope: 'global'})

const taskService = shallowReactive(new TaskService())
const task = ref<ITask>()

// We're saving the due date seperately to prevent null errors in very short periods where the task is null.
const dueDate = ref<Date | null>()
const lastValue = ref<Date | null>()

watch(
	() => props.modelValue,
	(value) => {
		task.value = { ...value }
		dueDate.value = value.dueDate
		lastValue.value = value.dueDate
	},
	{immediate: true},
)

const { pause: stopUpdateInterval } = useIntervalFn(updateDueDate, 1000)

onBeforeUnmount(() => {
        stopUpdateInterval()
        updateDueDate()
})

const flatPickerConfig = computed(() => ({
	altFormat: t('date.altFormatLong'),
	altInput: true,
	dateFormat: 'Y-m-d H:i',
	enableTime: true,
	time_24hr: true,
	inline: true,
	locale: useFlatpickrLanguage().value,
}))

function deferDays(days: number) {
	dueDate.value = new Date(dueDate.value)
	const currentDate = new Date(dueDate.value).getDate()
	dueDate.value = new Date(dueDate.value).setDate(currentDate + days)
	updateDueDate()
}

async function updateDueDate() {
	if (!dueDate.value) {
		return
	}

	if (+new Date(dueDate.value) === +lastValue.value) {
		return
	}

	const newTask = await taskService.update({
		...task.value,
		dueDate: new Date(dueDate.value),
	})
	lastValue.value = newTask.dueDate
	task.value = newTask
	emit('update:modelValue', newTask)
}
</script>

<style lang="scss" scoped>
// 100px is roughly the size the pane is pulled to the right
$defer-task-max-width: 350px + 100px;

.defer-task {
	width: 100%;
	max-width: $defer-task-max-width;

	@media screen and (max-width: ($defer-task-max-width)) {
		left: .5rem;
		right: .5rem;
		max-width: 100%;
		width: calc(100vw - 1rem - 2rem);
	}
}

.defer-days {
	justify-content: space-between;
	display: flex;
	margin: .5rem 0;
}

:deep() {
	input.input {
		display: none;
	}

	.flatpickr-calendar {
		margin: 0 auto;
		box-shadow: none;

		@media screen and (max-width: ($defer-task-max-width)) {
			max-width: 100%;
		}

		span {
			width: auto !important;
		}

	}

	.flatpickr-innerContainer {
		@media screen and (max-width: ($defer-task-max-width)) {
			overflow: scroll;
		}
	}
}
</style>
