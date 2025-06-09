import type {SupportedLocale} from '@/i18n'
import english from 'flatpickr/dist/l10n/default.js'
import type {CustomLocale, key as FlatpickrKey} from 'flatpickr/dist/types/locale'

export const LOCALE_MAPPING = {
	'de-de': {dayjs: 'de', flatpickr: 'de'},
	'de-swiss': {dayjs: 'de-ch', flatpickr: 'de'},
	'ru-ru': {dayjs: 'ru', flatpickr: 'ru'},
	'fr-fr': {dayjs: 'fr', flatpickr: 'fr'},
	'vi-vn': {dayjs: 'vi', flatpickr: 'vn'},
	'it-it': {dayjs: 'it', flatpickr: 'it'},
	'cs-cz': {dayjs: 'cs', flatpickr: 'cs'},
	'pl-pl': {dayjs: 'pl', flatpickr: 'pl'},
	'nl-nl': {dayjs: 'nl', flatpickr: 'nl'},
	'pt-pt': {dayjs: 'pt', flatpickr: 'pt'},
	'zh-cn': {dayjs: 'zh-cn', flatpickr: 'zh'},
	'no-no': {dayjs: 'nb', flatpickr: 'no'},
	'es-es': {dayjs: 'es', flatpickr: 'es'},
	'da-dk': {dayjs: 'da', flatpickr: 'da'},
	'ja-jp': {dayjs: 'ja', flatpickr: 'ja'},
	'hu-hu': {dayjs: 'hu', flatpickr: 'hu'},
	'ar-sa': {dayjs: 'ar-sa', flatpickr: 'ar'},
	'sl-si': {dayjs: 'sl', flatpickr: 'sl'},
	'pt-br': {dayjs: 'pt-br', flatpickr: 'pt'},
	'hr-hr': {dayjs: 'hr', flatpickr: 'hr'},
	'uk-ua': {dayjs: 'uk', flatpickr: 'uk'},
	'lt-lt': {dayjs: 'lt', flatpickr: 'lt'},
	'bg-bg': {dayjs: 'bg', flatpickr: 'bg'},
	'ko-kr': {dayjs: 'ko', flatpickr: 'ko'},
	'tr-tr': {dayjs: 'tr', flatpickr: 'tr'},
	'fi-fi': {dayjs: 'fi', flatpickr: 'fi'},
	'he-il': {dayjs: 'he', flatpickr: 'he'},
} as const satisfies Partial<Record<SupportedLocale, {dayjs: string; flatpickr: FlatpickrKey}>>

export async function loadFlatpickrLocale(lang: SupportedLocale): Promise<CustomLocale> {
	if (lang === 'en') {
	return english.default
}
	const entry = LOCALE_MAPPING[lang.toLowerCase() as SupportedLocale]
	const code = entry?.flatpickr
	if (!code || code === 'en') {
	return english.default
}
	try {
const mod: unknown = await import(/* @vite-ignore */ `flatpickr/dist/l10n/${code}.js`)
// flatpickr's locale modules export the locale inside mod.default.default
const localeData = (mod as {default?: {default?: Record<string, CustomLocale>}}).default
return localeData?.default?.[code] || english.default
} catch (e) {
	console.error('Failed to load flatpickr locale', e)
	return english.default
}
}

export async function loadDayjsLocale(lang: SupportedLocale): Promise<void> {
	if (lang === 'en') {
	return
}
	const entry = LOCALE_MAPPING[lang.toLowerCase() as SupportedLocale]
	const code = entry?.dayjs
	if (!code || code === 'en') {
	return
}
	await import(/* @vite-ignore */ `dayjs/locale/${code}`)
}
