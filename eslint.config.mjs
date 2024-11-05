import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import solid from 'eslint-plugin-solid/configs/typescript'
import * as tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['**/dist/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['vite.config.ts'],
    ...solid,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json', 'packages/core/tsconfig.json'],
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]
