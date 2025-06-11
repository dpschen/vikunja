<template>
	<div
		v-if="showBanner"
		class="cookie-banner"
	>
		<p class="message">
			{{ $t('cookieBanner.message') }}
		</p>
		<div class="buttons">
			<BaseButton
				variant="primary"
				@click="acceptAll"
			>
				{{ $t('cookieBanner.accept') }}
			</BaseButton>
			<BaseButton
				variant="secondary"
				@click="rejectAll"
			>
				{{ $t('cookieBanner.reject') }}
			</BaseButton>
		</div>
	</div>
</template>

<script lang="ts" setup>
import {computed} from 'vue'
import {useLocalStorage} from '@vueuse/core'
import BaseButton from '@/components/base/BaseButton.vue'

const consent = useLocalStorage<'accepted' | 'rejected' | null>('cookieConsent', null)

const showBanner = computed(() => consent.value === null)

function acceptAll() {
    consent.value = 'accepted'
}

function rejectAll() {
    consent.value = 'rejected'
}
</script>

<style lang="scss" scoped>
.cookie-banner {
    position: fixed;
    bottom: 1rem;
    inset-inline: 1rem;
    max-width: max-content;
    margin-inline: auto;
    padding: .5rem 1rem;
    background: var(--grey-900);
    border-radius: $radius;
    color: var(--grey-200);
    z-index: 5000;

    display: flex;
    flex-direction: column;
    gap: .5rem;

    .buttons {
        display: flex;
        gap: .5rem;
        justify-content: center;
    }
}
</style>
