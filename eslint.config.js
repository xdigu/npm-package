import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['**/*', '!src/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{test,spec}.ts', '**/__tests__/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          ignoreRestSiblings: true,
          argsIgnorePattern: '_+',
        },
      ],
    },
  },
  eslintConfigPrettier,
]
