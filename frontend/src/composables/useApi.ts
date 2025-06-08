import { ref } from 'vue'
import httpClient from '@/helpers/httpClient'

// Basic helper for direct API calls without using the service classes.

// Delay before marking requests as loading so fast responses don't flicker
const LOADING_DELAY = 100

export function useApi() {
	const loading = ref(false)
	const apiError = ref<unknown>(null)

	function setLoading() {
		const timeout = setTimeout(() => {
			loading.value = true
		}, LOADING_DELAY)
		return () => {
			clearTimeout(timeout)
			loading.value = false
		}
	}

	async function request<T>(method: 'get' | 'post' | 'put' | 'delete', ...args: unknown[]): Promise<T> {
		const cancel = setLoading()
		try {
			const { data } = await httpClient[method]<T>(...args as never[])
			return data
		} catch (e) {
			apiError.value = e as unknown
			throw e
		} finally {
			cancel()
		}
	}

	return {
		loading,
		apiError,
		get: (url: string, config?: unknown) => request('get', url, config),
		post: (url: string, data?: unknown, config?: unknown) => request('post', url, data, config),
		put: (url: string, data?: unknown, config?: unknown) => request('put', url, data, config),
		delete: (url: string, config?: unknown) => request('delete', url, config),
	}
}
