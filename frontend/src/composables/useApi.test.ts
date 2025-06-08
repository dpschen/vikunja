import { describe, it, expect, vi } from 'vitest'
import { useApi } from './useApi'
import httpClient from '@/helpers/httpClient'

describe('useApi', () => {
	it('toggles loading ref', async () => {
		vi.useFakeTimers()
		vi.spyOn(httpClient, 'get').mockResolvedValue({ data: 'ok' })
		const api = useApi()
		const promise = api.get('/foo')
		expect(api.loading.value).toBe(false)
		vi.advanceTimersByTime(100)
		expect(api.loading.value).toBe(true)
		await promise
		expect(api.loading.value).toBe(false)
		vi.useRealTimers()
	})

	it('stores errors in apiError', async () => {
		vi.spyOn(httpClient, 'get').mockRejectedValue(new Error('fail'))
		const api = useApi()
		await expect(api.get('/foo')).rejects.toThrow('fail')
		expect(api.apiError.value).toBeInstanceOf(Error)
	})
})
