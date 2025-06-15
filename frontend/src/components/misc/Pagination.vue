<template>
	<BasePagination
		:total-pages="totalPages"
		:current-page="currentPage"
	>
		<template #previous="{ disabled }">
			<RouterLink
				v-t="'misc.previous'"
				:disabled="disabled || undefined"
				:to="getRouteForPagination(currentPage - 1)"
				class="pagination-previous"
			/>
		</template>
		<template #next="{ disabled }">
			<RouterLink
				v-t="'misc.next'"
				:disabled="disabled || undefined"
				:to="getRouteForPagination(currentPage + 1)"
				class="pagination-next"
			/>
		</template>
		<template #page-link="{ page, isCurrent }">
			<RouterLink
				class="pagination-link"
				:aria-label="'Goto page ' + page.number"
				:class="{ 'is-current': isCurrent }"
				:to="getRouteForPagination(page.number)"
			>
				{{ page.number }}
			</RouterLink>
		</template>
	</BasePagination>
</template>

<script lang="ts" setup>
import BasePagination from '@/components/base/BasePagination.vue'

withDefaults(defineProps<{
	totalPages: number,
	currentPage?: number
}>(), {
	currentPage: 0,
})

function getRouteForPagination(page = 1, type = null) {
	return {
		name: type,
		params: {
			type: type,
		},
		query: {
			page: page,
		},
	}
}
</script>
