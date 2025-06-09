<template>
	<BaseButton
		:href="href"
		target="_blank"
		class="tw-text-xs tw-text-gray-400 inline-flex items-center gap-1"
	>
		<Icon
			icon="circle-question"
			class="tw-w-4 tw-h-4"
		/>
		{{ $t('misc.learnMore') }}
	</BaseButton>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import Icon from '@/components/misc/Icon'
import {DOCS_URL} from '@/urls'

const props = defineProps<{
    path?: string
}>()

const href = computed(() => {
    if (!props.path) return DOCS_URL
    const cleaned = props.path.replace(/^\/+/, '')
    return `${DOCS_URL}${cleaned}`
})
</script>

