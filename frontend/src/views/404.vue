<template>
	<div class="content has-text-centered">
		<h1 v-t="'404.title'" />
		<p v-t="'404.text'" />
	</div>
</template>

<script setup lang="ts">
import {useTitle} from '@/composables/useTitle'

useTitle(() => '404')
</script>
