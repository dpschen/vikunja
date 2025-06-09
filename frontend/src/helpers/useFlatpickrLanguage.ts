import {useAuthStore} from '@/stores/auth'
import type {SupportedLocale} from '@/i18n'
import english from 'flatpickr/dist/l10n/default.js'
import type {CustomLocale} from 'flatpickr/dist/types/locale'
import {computed, ref, watch} from 'vue'
import {loadFlatpickrLocale} from '@/i18n/localeMappings'

export function useFlatpickrLanguage() {
const authStore = useAuthStore()
const locale = ref<CustomLocale>(english.default)

watch(
() => [authStore.settings.language, authStore.settings.weekStart] as const,
async ([userLanguage, weekStart]) => {
locale.value = await loadFlatpickrLocale(userLanguage?.toLowerCase() as SupportedLocale)

if (typeof weekStart !== 'undefined' && weekStart !== null) {
locale.value.firstDayOfWeek = weekStart
}
},
{immediate: true},
)

return computed(() => locale.value)
}
