import pluginVue from 'eslint-plugin-vue'
import js from '@eslint/js'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import pluginI18n from '@intlify/eslint-plugin-vue-i18n'

export default [
       {
               ...js.configs.recommended,
               files: ['**/*.js', '**/*.ts', '**/*.vue'],
               ignores: ['src/i18n/lang/**', 'src/version.json'],
       },
       ...pluginVue.configs['flat/recommended'],
       ...pluginI18n.configs['flat/recommended'],
       ...vueTsEslintConfig().map(c => ({...c, files: c.files || ['**/*.ts', '**/*.tsx', '**/*.vue']})),
	{
		ignores: [
			'**/*.test.ts',
			'./cypress',
		],
	},
       {
               files: ['**/*.js', '**/*.ts', '**/*.vue'],
               rules: {
			'quotes': ['error', 'single'],
			'comma-dangle': ['error', 'always-multiline'],
			'semi': ['error', 'never'],

			'vue/v-on-event-hyphenation': ['warn', 'never', {'autofix': true}],
			'vue/multi-word-component-names': 'off',

			// uncategorized rules:
			'vue/component-api-style': ['error', ['script-setup']],
			'vue/component-name-in-template-casing': ['error', 'PascalCase', {
				'globals': ['RouterView', 'RouterLink', 'Icon', 'Notifications', 'Modal', 'Card'],
			}],
			'vue/custom-event-name-casing': ['error', 'camelCase'],
			'vue/define-macros-order': 'error',
			'vue/match-component-file-name': ['error', {
				'extensions': ['.js', '.jsx', '.ts', '.tsx', '.vue'],
				'shouldMatchCase': true,
			}],
			'vue/match-component-import-name': 'error',
			'vue/prefer-separate-static-class': 'warn',

			'vue/padding-line-between-blocks': 'error',
			'vue/next-tick-style': ['error', 'promise'],
			'vue/block-lang': [
				'error',
				{'script': {'lang': 'ts'}},
			],
			'vue/no-duplicate-attr-inheritance': 'error',
			'vue/no-empty-component-block': 'error',
			'vue/html-indent': ['error', 'tab'],

			// vue3
			'vue/no-ref-object-reactivity-loss': 'error',
			'vue/no-setup-props-reactivity-loss': 'error',

                       '@typescript-eslint/no-unused-vars': [
                               'error',
                               {
                                       // 'args': 'all',
                                       // 'argsIgnorePattern': '^_',
                                       'caughtErrors': 'all',
                                       'caughtErrorsIgnorePattern': '^_',
                                       // 'destructuredArrayIgnorePattern': '^_',
                                       'varsIgnorePattern': '^_',
                                       'ignoreRestSiblings': true,
                               },
                       ],
                       '@intlify/vue-i18n/no-missing-keys': 'error',
                       '@intlify/vue-i18n/no-unused-keys': 'warn',
               },

               settings: {
                       'vue-i18n': {
                               localeDir: './src/i18n/lang/*.json',
                               messageSyntaxVersion: '^11.0.0',
                       },
               },

		// files: ['*.vue', '**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: '@typescript-eslint/parser',
				ecmaVersion: 'latest',
				tsconfigRootDir: '.',
			},
		},


		// 'parser': 'vue-eslint-parser',
		// 'parserOptions': {
		// 	'parser': '@typescript-eslint/parser',
		// 	'ecmaVersion': 'latest',
		// 	'tsconfigRootDir': __dirname,
		// },
		// 'ignorePatterns': [
		// 	'cypress/*',
		// ],
	},

]
