<template>
	<Card
		:title="$t('user.settings.general.title')"
		class="general-settings"
		:loading="loading"
	>
		<div class="tw-grid tw-grid-cols-[1fr_2fr] tw-gap-3 tw-mb-3">
			<label
				class="tw-mt-2 tw-font-bold tw-text-[--label-color] tw-text-right"
				:for="`new-name-${id}`"
			>{{ $t('user.settings.general.name') }}</label>
			<input
				:id="`new-name-${id}`"
				v-model="settings.name"
				v-cy="'username-input'"
				class="input"
				type="text"
				:placeholder="$t('user.settings.general.newName')"
				@keyup.enter="updateSettings"
			>

			<label
				for="default-project"
				class="tw-mt-2 tw-font-bold tw-text-[--label-color] tw-text-right"
			>
				{{ $t('user.settings.general.defaultProject') }}
			</label>
			<ProjectSearch
				id="default-project"
				v-model="defaultProject"
			/>

			<label
				for="default-view"
				class="tw-mt-2 tw-font-bold tw-text-[--label-color] tw-text-right"
			>
				{{ $t('user.settings.general.defaultView') }}
			</label>
			<div class="select">
				<select class="tw-w-full" id="default-view" v-model="settings.frontendSettings.defaultView">
					<option
						v-for="view in DEFAULT_PROJECT_VIEW_SETTINGS"
						:key="view"
						:value="view"
					>
						{{ $t(`project.${view}.title`) }}
					</option>
				</select>
			</div>

			<template v-if="hasFilters">
				<label
					for="filterUsedInOverview"
					class="tw-font-bold tw-text-[--label-color] tw-text-right"
				>
					{{ $t('user.settings.general.filterUsedOnOverview') }}
				</label>
				<ProjectSearch
					id="filterUsedInOverview"
					v-model="filterUsedInOverview"
					:saved-filters-only="true"
				/>
			</template>

			<FancyCheckbox
				class="tw-justify-self-end"
				id="email-reminders-enabled"
				v-model="settings.emailRemindersEnabled"
			/>
			<label for="email-reminders-enabled">
				{{ $t('user.settings.general.emailReminders') }}
			</label>

			<FancyCheckbox
				class="tw-justify-self-end"
				id="discoverableByName"
				v-model="settings.discoverableByName"
			/>
			<label for="discoverableByName">
				{{ $t('user.settings.general.discoverableByName') }}
			</label>

			<FancyCheckbox
				class="tw-justify-self-end"
				id="discoverableByEmail"
				v-model="settings.discoverableByEmail"
			/>
			<label for="discoverableByEmail">
				{{ $t('user.settings.general.discoverableByEmail') }}
			</label>

			<FancyCheckbox
				class="tw-justify-self-end"
				id="playSoundWhenDone"
				v-model="settings.frontendSettings.playSoundWhenDone"
			/>
			<label for="playSoundWhenDone">
				{{ $t('user.settings.general.playSoundWhenDone') }}
			</label>

			<FancyCheckbox
				class="tw-justify-self-end"
				id="overdueTasksRemindersEnabled"
				v-model="settings.overdueTasksRemindersEnabled"
			/>
			<div>
				<label for="overdueTasksRemindersEnabled">
					{{ $t('user.settings.general.overdueReminders') }}
				</label>

				<div v-if="settings.overdueTasksRemindersEnabled" class="flex gap-4">
					<div class="control">
						<input
							id="overdueTasksReminderTime"
							v-model="settings.overdueTasksRemindersTime"
							class="input"
							type="time"
							@keyup.enter="updateSettings"
						>
					</div>
					<label for="overdueTasksReminderTime">
						{{ $t('user.settings.general.overdueTasksRemindersTime') }}
					</label>
				</div>
			</div>

			<label
				for="week-start"
				class="tw-mt-2 tw-font-bold tw-text-[--label-color] tw-text-right"
			>
				{{ $t('user.settings.general.weekStart') }}
			</label>
			<div class="select">
				<select class="tw-w-full" id="week-start" v-model.number="settings.weekStart">
					<option value="0">{{ $t('user.settings.general.weekStartSunday') }}</option>
					<option value="1">{{ $t('user.settings.general.weekStartMonday') }}</option>
				</select>
			</div>

			<label
				for="language"
				class="tw-mt-2 tw-font-bold tw-text-[--label-color] tw-text-right"
			>{{ $t('user.settings.general.language') }}</label>
			<div class="select">
				<select class="tw-w-full" id="language" v-model="settings.language">
					<option
						v-for="lang in availableLanguageOptions"
						:key="lang.code"
						:value="lang.code"
					>{{ lang.title }}
					</option>
				</select>
			</div>

			<label
				for="quick-add-magic-mode"
				class="tw-mt-2 tw-font-bold tw-text-[--label-color] tw-text-right"
			>{{ $t('user.settings.quickAddMagic.title') }}</label>
			<div class="select">
				<select class="tw-w-full" id="quick-add-magic-mode" v-model="settings.frontendSettings.quickAddMagicMode">
					<option
						v-for="set in PrefixMode"
						:key="set"
						:value="set"
					>
						{{ $t(`user.settings.quickAddMagic.${set}`) }}
					</option>
				</select>
			</div>

			<label
				for="color-schema"
				class="tw-mt-2 tw-font-bold tw-text-[--label-color] tw-text-right"
			>{{ $t('user.settings.appearance.title') }}</label>
			<div class="select">
				<select class="tw-w-full" id="color-schema" v-model="settings.frontendSettings.colorSchema">
					<!-- TODO: use the Vikunja logo in color scheme as option buttons -->
					<option
						v-for="(title, schemeId) in colorSchemeSettings"
						:key="schemeId"
						:value="schemeId"
					>
						{{ title }}
					</option>
				</select>
			</div>

			<label
				for="timezone"
				class="tw-mt-2 tw-font-bold tw-text-[--label-color] tw-text-right"
			>{{ $t('user.settings.general.timezone') }}</label>
			<div class="select">
				<select class="tw-w-full" id="timezone" v-model="settings.timezone">
					<option
						v-for="tz in availableTimezones"
						:key="tz"
					>
						{{ tz }}
					</option>
				</select>
			</div>
		</div>

		<template #footer>
			<x-button
				v-cy="'saveGeneralSettings'"
				:loading="loading"
				class="tw-w-full"
				@click="updateSettings()"
			>
				{{ $t('misc.save') }}
			</x-button>
		</template>
	</Card>
</template>

<script lang="ts">
export default {name: 'UserSettingsGeneral'}
</script>

<script setup lang="ts">
import {computed, watch, ref} from 'vue'
import {useI18n} from 'vue-i18n'

import {PrefixMode} from '@/modules/parseTaskText'

import FancyCheckbox from '@/components/input/FancyCheckbox.vue'
import ProjectSearch from '@/components/tasks/partials/ProjectSearch.vue'

import {SUPPORTED_LOCALES} from '@/i18n'
import {createRandomID} from '@/helpers/randomId'
import {AuthenticatedHTTPFactory} from '@/helpers/fetcher'

import {useTitle} from '@/composables/useTitle'

import {useProjectStore} from '@/stores/projects'
import {useAuthStore} from '@/stores/auth'
import type {IUserSettings} from '@/modelTypes/IUserSettings'
import {isSavedFilter} from '@/services/savedFilter'
import {DEFAULT_PROJECT_VIEW_SETTINGS} from '@/modelTypes/IProjectView'

const {t} = useI18n({useScope: 'global'})
useTitle(() => `${t('user.settings.general.title')} - ${t('user.settings.title')}`)

const DEFAULT_PROJECT_ID = 0

const colorSchemeSettings = computed(() => ({
	light: t('user.settings.appearance.colorScheme.light'),
	auto: t('user.settings.appearance.colorScheme.system'),
	dark: t('user.settings.appearance.colorScheme.dark'),
}))

function useAvailableTimezones() {
	const availableTimezones = ref([])

	const HTTP = AuthenticatedHTTPFactory()
	HTTP.get('user/timezones')
		.then(r => {
			if (r.data) {
				availableTimezones.value = r.data.sort()
				return
			}
			
			availableTimezones.value = []
		})

	return availableTimezones
}

const availableTimezones = useAvailableTimezones()

const authStore = useAuthStore()

const settings = ref<IUserSettings>({
	...authStore.settings,
	frontendSettings: {
		// Sub objects get exported as read only as well, so we need to 
		// explicitly spread the object here to allow modification
		...authStore.settings.frontendSettings,
		// Add fallback for old settings that don't have the default view set
		defaultView: authStore.settings.frontendSettings.defaultView ?? DEFAULT_PROJECT_VIEW_SETTINGS.FIRST,
	},
})
const id = ref(createRandomID())
const availableLanguageOptions = ref(
	Object.entries(SUPPORTED_LOCALES)
		.map(l => ({code: l[0], title: l[1]}))
		.sort((a, b) => a.title.localeCompare(b.title)),
)

watch(
	() => authStore.settings,
	() => {
		// Only set setting if we don't have edited values yet to avoid overriding
		if (Object.keys(settings.value).length !== 0) {
			return
		}
		settings.value = {...authStore.settings}
	},
	{immediate: true},
)

const projectStore = useProjectStore()
const defaultProject = computed({
	get: () => projectStore.projects[settings.value.defaultProjectId],
	set(l) {
		settings.value.defaultProjectId = l ? l.id : DEFAULT_PROJECT_ID
	},
})
const filterUsedInOverview = computed({
	get: () => projectStore.projects[settings.value.frontendSettings.filterIdUsedOnOverview],
	set(l) {
		settings.value.frontendSettings.filterIdUsedOnOverview = l ? l.id : null
	},
})
const hasFilters = computed(() => typeof projectStore.projectsArray.find(p => isSavedFilter(p)) !== 'undefined')
const loading = computed(() => authStore.isLoadingGeneralSettings)

async function updateSettings() {
	await authStore.saveUserSettings({
		settings: {...settings.value},
	})
}
</script>

<style scoped>
.select select {
	width: 100%;
}
</style>
