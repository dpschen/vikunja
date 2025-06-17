<template>
	<div>
		<Message v-if="loading">
			{{ $t('sharing.authenticating') }}
		</Message>
		<div
			v-if="authenticateWithPassword"
			class="box"
		>
			<p class="pb-2">
				{{ $t('sharing.passwordRequired') }}
			</p>
			<div class="field">
				<div class="control">
					<input
						id="linkSharePassword"
						v-model="password"
						v-focus
						type="password"
						class="input"
						:placeholder="$t('user.auth.passwordPlaceholder')"
						@keyup.enter.prevent="authenticate()"
					>
				</div>
			</div>

			<XButton
				:loading="loading"
				@click="authenticate()"
			>
				{{ $t('user.auth.login') }}
			</XButton>

			<Message
				v-if="errorMessage !== ''"
				variant="danger"
				class="mt-4"
			>
				{{ errorMessage }}
			</Message>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {ref, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useI18n} from 'vue-i18n'
import {useTitle} from '@vueuse/core'

import Message from '@/components/misc/Message.vue'
import {LINK_SHARE_HASH_PREFIX} from '@/constants/linkShareHash'

import {useBaseStore} from '@/stores/base'
import {useAuthStore} from '@/stores/auth'
import {useRedirectToLastVisited} from '@/composables/useRedirectToLastVisited'
import type {IProject} from '@/modelTypes/IProject.ts'
import {getErrorText} from '@/message'
import type {AxiosError} from 'axios'

const {t} = useI18n({useScope: 'global'})
useTitle(t('sharing.authenticating'))
const {getLastVisitedRoute} = useRedirectToLastVisited()

function useAuth() {
	const baseStore = useBaseStore()
	const authStore = useAuthStore()
	const route = useRoute()
	const router = useRouter()

	const loading = ref(false)
	const authenticateWithPassword = ref(false)
	const errorMessage = ref('')
	const password = ref('')

	const authLinkShare = computed(() => authStore.authLinkShare)
	
	function redirectToProject(projectId: IProject['id']) {
		const hash = LINK_SHARE_HASH_PREFIX + route.params.share
		
		const viewId = new URLSearchParams(window.location.search).get('view') || null
		
		const last = getLastVisitedRoute()
		if (last) {
			return router.push({
				...last,
				hash,
			})
		}
		
		if(viewId) {
			return router.push({
				name: 'project.view',
				params: {
					projectId,
					viewId,
				},
				hash,
			})
		}

		return router.push({
			name: 'project.index',
			params: {
				projectId,
			},
			hash,
		})
	}

	async function authenticate() {
		authenticateWithPassword.value = false
		errorMessage.value = ''

		if (authLinkShare.value) {
			// FIXME: push to 'project.list' since authenticated?
			return
		}

                loading.value = true

		try {
			const {project_id: projectId} = await authStore.linkShareAuth({
				hash: route.params.share,
				password: password.value,
			})
			const logoVisible = route.query.logoVisible
				? route.query.logoVisible === 'true'
				: true
			baseStore.setLogoVisible(logoVisible)

			return redirectToProject(projectId)
                } catch (e) {
                        const err = e as AxiosError<{ code?: number; message?: string }>
                        if (err?.response?.data?.code === 13001) {
                                authenticateWithPassword.value = true
                                return
                        }

                        errorMessage.value = getErrorText(err)
                } finally {
                        loading.value = false
                }
	}

	authenticate()

	return {
		loading,
		authenticateWithPassword,
		errorMessage,
		password,
		authenticate,
	}
}

const {
	loading,
	authenticateWithPassword,
	errorMessage,
	password,
	authenticate,
} = useAuth()
</script>
