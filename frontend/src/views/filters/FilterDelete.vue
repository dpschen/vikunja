<template>
	<Modal
		@close="$router.back()"
		@submit="deleteFilter()"
	>
		<template #header>
			<span v-t="'filters.delete.header'" />
		</template>

		<template #text>
			<p v-t="'filters.delete.text'" />
		</template>
	</Modal>
</template>

<script setup lang="ts">
import type {IProject} from '@/modelTypes/IProject'
import {useSavedFilter} from '@/services/savedFilter'

const props = defineProps<{
	projectId: IProject['id'],
}>()

const {deleteFilter} = useSavedFilter(() => props.projectId)
</script>
