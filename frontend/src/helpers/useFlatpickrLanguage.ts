import {useAuthStore} from '@/stores/auth'
import type {CustomLocale} from 'flatpickr/dist/types/locale'
import english from 'flatpickr/dist/l10n/default.js'
import {computed, ref, watch} from 'vue'

// Normalize a user-supplied language string using Intl APIs. This ensures
// consistent casing (e.g. "de-DE" -> "de-DE") and gracefully handles invalid
// values.
function canonicalize(lang?: string): string | undefined {
       if (!lang) {
               return undefined
       }
       try {
               return Intl.getCanonicalLocales(lang)[0]?.toLowerCase()
       } catch {
               return undefined
       }
}

// Convert the given locale identifier to the corresponding first day of the
// week based on Intl locale data. Intl.Locale#weekInfo uses 1-7 for Monday-
// Sunday, while flatpickr expects 0-6 starting with Sunday.
function defaultFirstDay(locale: string): number {
       try {
               const first = new Intl.Locale(locale).weekInfo.firstDay
               return first % 7
       } catch {
               return english.firstDayOfWeek
       }
}

// Map of language identifiers to functions which dynamically load the
// corresponding flatpickr locale. Only the locale for the current user
// language will be loaded at runtime.

const FLATPICKR_LANGUAGE_IMPORTS: Record<string, () => Promise<{default: CustomLocale}>> = {
       'de-de': () => import('flatpickr/dist/l10n/de.js'),
       'de-swiss': () => import('flatpickr/dist/l10n/de.js'),
       'ru-ru': () => import('flatpickr/dist/l10n/ru.js'),
       'fr-fr': () => import('flatpickr/dist/l10n/fr.js'),
       'vi-vn': () => import('flatpickr/dist/l10n/vn.js'),
       'it-it': () => import('flatpickr/dist/l10n/it.js'),
       'cs-cz': () => import('flatpickr/dist/l10n/cs.js'),
       'pl-pl': () => import('flatpickr/dist/l10n/pl.js'),
       'nl-nl': () => import('flatpickr/dist/l10n/nl.js'),
       'pt-pt': () => import('flatpickr/dist/l10n/pt.js'),
       'zh-cn': () => import('flatpickr/dist/l10n/zh.js'),
       'no-no': () => import('flatpickr/dist/l10n/no.js'),
       'es-es': () => import('flatpickr/dist/l10n/es.js'),
       'da-dk': () => import('flatpickr/dist/l10n/da.js'),
       'ja-jp': () => import('flatpickr/dist/l10n/ja.js'),
       'hu-hu': () => import('flatpickr/dist/l10n/hu.js'),
       'ar-sa': () => import('flatpickr/dist/l10n/ar.js'),
       'sl-si': () => import('flatpickr/dist/l10n/sl.js'),
       'pt-br': () => import('flatpickr/dist/l10n/pt.js'),
       'hr-hr': () => import('flatpickr/dist/l10n/hr.js'),
       'uk-ua': () => import('flatpickr/dist/l10n/uk.js'),
       'lt-lt': () => import('flatpickr/dist/l10n/lt.js'),
       'bg-bg': () => import('flatpickr/dist/l10n/bg.js'),
       'ko-kr': () => import('flatpickr/dist/l10n/ko.js'),
       'tr-tr': () => import('flatpickr/dist/l10n/tr.js'),
       'fi-fi': () => import('flatpickr/dist/l10n/fi.js'),
       'he-il': () => import('flatpickr/dist/l10n/he.js'),
}

export function useFlatpickrLanguage() {
       const authStore = useAuthStore()
       const locale = ref<CustomLocale>(english)

       watch(
               () => [authStore.settings.language, authStore.settings.weekStart],
               // Load a new locale whenever the user's language changes. The
               // weekStart setting is also watched so it can override the
               // locale's default firstDayOfWeek value.
               async ([userLanguage]) => {
                       const weekStart = authStore.settings.weekStart
                       let lang: CustomLocale = english

                       const canonical = canonicalize(userLanguage)
                       if (canonical && canonical !== 'en') {
                               const importer =
                                       FLATPICKR_LANGUAGE_IMPORTS[canonical] ??
                                       FLATPICKR_LANGUAGE_IMPORTS[canonical.split('-')[0]]
                               if (importer) {
                                       try {
                                               // Dynamically import the locale module only when needed.
                                               lang = (await importer()).default
                                       } catch {
                                               // Fall back to English when the locale module cannot be loaded.
                                               lang = english
                                       }
                               }
                       }

                       const firstDay = weekStart ?? defaultFirstDay(canonical ?? 'en')
                       locale.value = {
                               ...lang,
                               firstDayOfWeek: firstDay,
                       }
               },
               {immediate: true},
       )

       // Expose the currently loaded locale as a computed ref so components can
       // react to updates.
       return computed(() => locale.value)
}
