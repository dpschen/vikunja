import {defineConfig} from 'cypress'

export default defineConfig({
       env: {
               API_URL: 'http://localhost:3456/api/v1',
               // Set this token via the CYPRESS_TEST_SECRET env var.
               // Never commit a real testing token here.
               TEST_SECRET: process.env.CYPRESS_TEST_SECRET ?? '<testing-secret>',
       },
	video: false,
	retries: {
		runMode: 2,
	},
	projectId: '181c7x',
	e2e: {
		specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
		baseUrl: 'http://127.0.0.1:4173',
		experimentalRunAllSpecs: true,
		// testIsolation: false,
	},
	component: {
		devServer: {
			framework: 'vue',
			bundler: 'vite',
		},
	},
	viewportWidth: 1600,
	viewportHeight: 900,
	experimentalMemoryManagement: true,
})
