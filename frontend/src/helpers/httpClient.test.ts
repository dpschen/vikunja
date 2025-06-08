import { describe, it, expect, vi } from 'vitest'
import httpClient from './httpClient'
import * as auth from './auth'

describe('httpClient', () => {
	it('adds auth header and content type', async () => {
		vi.spyOn(auth, 'getToken').mockReturnValue('token')
		const config = { headers: {} as Record<string, string>, baseURL: '' }
		const result = await (httpClient.interceptors.request.handlers[0].fulfilled?.(config) ?? config)
		expect(result.headers['Authorization']).toBe('Bearer token')
		expect(result.headers['Content-Type']).toBe('application/json')
	})
})
