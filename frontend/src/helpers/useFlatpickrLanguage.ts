import {useAuthStore} from '@/stores/auth'
import type {key, Locale} from 'flatpickr/dist/types/locale'
import {computed, ref, watchEffect} from 'vue'

const localeCache: Record<string, Promise<Locale>> = {}

async function loadLocale(code: string): Promise<Locale> {
	 if (!localeCache[code]) {
		  if (code === 'en') {
			localeCache[code] = import('flatpickr/dist/esm/l10n/default.js').then(m => m.default as Locale)
		  } else {
			localeCache[code] = import(/* @vite-ignore */ `flatpickr/dist/esm/l10n/${code}.js`)
			        .then(m => (m.default as Record<key, Locale>)[code as key])
			        .catch(() => loadLocale('en'))
		  }
	 }
	 return localeCache[code]
}

export function useFlatpickrLanguage() {
	 const authStore = useAuthStore()
	 const locale = ref<Locale>()
	 loadLocale('en').then(l => (locale.value = l))

	 watchEffect(async () => {
		  const userLanguage = authStore.settings.language
		  const langPair = userLanguage?.split('-') || []
		  const code = userLanguage === 'vi-VN' ? 'vn' : (langPair[0] || 'en')

		  locale.value = await loadLocale(code)
		  if (authStore.settings.weekStart !== undefined) {
			locale.value.firstDayOfWeek = authStore.settings.weekStart
		  }
	 })

	 return computed(() => locale.value)
}
