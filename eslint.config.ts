import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import markdown from '@eslint/markdown';
import json from '@eslint/json';
import globals from 'globals';
import js from '@eslint/js';

export default defineConfig([
	{
		...js.configs.recommended,
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		languageOptions: { globals: globals.node },
	},
	...tseslint.configs.recommended,
	{
		...json.configs.recommended,
		files: ['**/*.json', '**/*.jsonc'],
	},
	...markdown.configs.recommended,
	eslintPluginPrettierRecommended,
	{
		rules: {
			'no-console': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
				},
			],
			'prettier/prettier': [
				'warn',
				{
					singleQuote: true,
					printWidth: 140,
					semi: true,
					tabWidth: 2,
					trailingComma: 'es5',
					endOfLine: 'auto',
				},
			],
		},
	},
	{
		files: ['tsconfig.json', '.vscode/**/*', '.prettierrc', '.prettierignore', 'package.json'],
		rules: {
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	},
]);
