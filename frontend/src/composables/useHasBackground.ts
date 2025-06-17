import { computed } from 'vue'
import { createInjectionState } from '@vueuse/core'

import { useBaseStore } from '@/stores/base'

export const [useProvideHasBackground, useHasBackground] = createInjectionState(() => {
	const baseStore = useBaseStore()
	const hasBackground = computed(() => !!baseStore.background || !!baseStore.blurHash)
	return { hasBackground }
})
