import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { getToken } from '@/helpers/auth'
import { error } from '@/message'

// Shared axios instance similar to `AuthenticatedHTTPFactory`.
// Used by `useApi` when the service classes are overkill.

const httpClient: AxiosInstance = axios.create({
	baseURL: window.API_URL,
})

httpClient.interceptors.request.use(config => {
	config.baseURL = window.API_URL
	config.headers = {
	...config.headers,
	'Content-Type': 'application/json',
	}
	const token = getToken()
	if (token) {
	config.headers['Authorization'] = `Bearer ${token}`
	}
	return config
})

httpClient.interceptors.response.use(
	response => response,
	err => {
	error(err)
	return Promise.reject(err)
	},
)

export default httpClient
