<template>
	<!-- This is a workaround to get the sw to "see" the to-be-cached version of the offline background image -->
	<div
		class="offline"
		style="height: 0;width: 0;"
	/>
	<div
		v-if="!online"
		class="app offline"
	>
		<div class="offline-message">
			<h1
				v-t="'offline.title'"
				class="title"
			/>
			<p v-t="'offline.text'" />
		</div>
	</div>
	<template v-else-if="baseStore.ready">
		<slot />
	</template>
	<section v-else-if="baseStore.error !== ''">
		<NoAuthWrapper>
			<p
				v-if="baseStore.error === ERROR_NO_API_URL"
				v-t="'ready.noApiUrlConfigured'"
			/>
			<Message
				v-else
				variant="danger"
				class="mb-4"
			>
				<p>
					<span v-t="'ready.errorOccured'" /><br>
					{{ baseStore.error }}
				</p>
				<p v-t="'ready.checkApiUrl'" />
			</Message>
			<ApiConfig
				:configure-open="true"
				@foundApi="baseStore.loadApp()"
			/>
		</NoAuthWrapper>
	</section>
	<CustomTransition name="fade">
		<section
			v-if="baseStore.loading"
			class="vikunja-loading"
		>
			<Logo class="logo" />
			<p>
				<span class="loader-container is-loading-small is-loading" />
				<span v-t="'ready.loading'" />
			</p>
		</section>
	</CustomTransition>
</template>

<script lang="ts" setup>
import Logo from '@/assets/logo.svg?component'
import ApiConfig from '@/components/misc/ApiConfig.vue'
import Message from '@/components/misc/Message.vue'
import CustomTransition from '@/components/misc/CustomTransition.vue'
import NoAuthWrapper from '@/components/misc/NoAuthWrapper.vue'

import {ERROR_NO_API_URL} from '@/helpers/checkAndSetApiUrl'

import {useOnline} from '@/composables/useOnline'
import {useBaseStore} from '@/stores/base'

const online = useOnline()
const baseStore = useBaseStore()
</script>

<style lang="scss" scoped>
.vikunja-loading {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	width: 100vw;
	flex-direction: column;
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	background: var(--grey-100);
	z-index: 99;
}

.logo {
	margin-bottom: 1rem;
	width: 100px;
	height: 100px;
}

.loader-container {
	margin-right: 1rem;

	&.is-loading::after {
		border-left-color: var(--grey-400);
		border-bottom-color: var(--grey-400);
	}
}

.offline {
	background: url('@/assets/llama-nightscape.jpg') no-repeat center;
	background-size: cover;
	height: 100vh;
}

.offline-message {
	text-align: center;
	position: absolute;
	width: 100vw;
	bottom: 5vh;
	color: $white;
	padding: 0 1rem;
}

.title {
	font-weight: bold;
	font-size: 1.5rem;
	text-align: center;
	color: $white;
	font-weight: 700 !important;
	font-size: 1.5rem;
}
</style>
