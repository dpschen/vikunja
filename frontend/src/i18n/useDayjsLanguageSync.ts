import {computed, ref, watch} from 'vue'
import type dayjs from 'dayjs'

import {i18n, type SupportedLocale} from '@/i18n'
import {LOCALE_MAPPING, loadDayjsLocale} from '@/i18n/localeMappings'

export {loadDayjsLocale}

export function useDayjsLanguageSync(dayjsGlobal: typeof dayjs) {

	const dayjsLanguageLoaded = ref(false)
	watch(
		() => i18n.global.locale.value,
		async (currentLanguage: string) => {
			if (!dayjsGlobal) {
				return
			}
			const mappingEntry = LOCALE_MAPPING[currentLanguage.toLowerCase() as SupportedLocale]
			const dayjsLanguageCode = mappingEntry?.dayjs || currentLanguage.toLowerCase()
			dayjsLanguageLoaded.value = dayjsGlobal.locale() === dayjsLanguageCode
			if (dayjsLanguageLoaded.value) {
			return
			}
						await loadDayjsLocale(currentLanguage as SupportedLocale)
			dayjsGlobal.locale(dayjsLanguageCode)
			dayjsLanguageLoaded.value = true
		},
		{immediate: true},
	)

	// we export the loading state since that's easier to work with
	const isLoading = computed(() => !dayjsLanguageLoaded.value)

	return isLoading
}
