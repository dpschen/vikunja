<template>
	<div class="content">
		<h1 v-t="'user.export.downloadTitle'" />
		<template v-if="isLocalUser">
			<p v-t="'user.export.descriptionPasswordRequired'" />
			<div class="field">
				<label
					v-t="'user.settings.currentPassword'"
					class="label"
					for="currentPasswordDataExport"
				/>
				<div class="control">
					<input
						id="currentPasswordDataExport"
						ref="passwordInput"
						v-model="password"
						class="input"
						:class="{'is-danger': errPasswordRequired}"
						:placeholder="$t('user.settings.currentPasswordPlaceholder')"
						type="password"
						@keyup="() => errPasswordRequired = password === ''"
					>
				</div>
				<p
					v-if="errPasswordRequired"
					v-t="'user.deletion.passwordRequired'"
					class="help is-danger"
				/>
			</div>
		</template>

		<XButton
			v-focus
			:loading="dataExportService.loading"
			class="mt-4"
			@click="download()"
		>
			{{ $t('misc.download') }}
		</XButton>
	</div>
</template>

<script setup lang="ts">
import {ref, computed, reactive} from 'vue'
import DataExportService from '@/services/dataExport'
import {useAuthStore} from '@/stores/auth'

const dataExportService = reactive(new DataExportService())
const password = ref('')
const errPasswordRequired = ref(false)
const passwordInput = ref(null)

const authStore = useAuthStore()
const isLocalUser = computed(() => authStore.info?.isLocalUser)

function download() {
	if (password.value === '' && isLocalUser.value) {
		errPasswordRequired.value = true
		passwordInput.value.focus()
		return
	}

	dataExportService.download(password.value)
}
</script>
