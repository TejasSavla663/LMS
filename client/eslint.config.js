import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  {
    ignores: ['dist'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: '18.3',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // ----------------------------------
      // Base recommended rules
      // ----------------------------------
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,

      // ----------------------------------
      // CI-SAFE OVERRIDES (IMPORTANT)
      // ----------------------------------

      // React 17+ JSX transform (no need to import React)
      'react/react-in-jsx-scope': 'off',

      // Do not fail CI for unused variables
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Disable PropTypes (modern React / TS-friendly)
      'react/prop-types': 'off',

      // Avoid CI failure for text like: don't, it's
      'react/no-unescaped-entities': 'off',

      // Hooks dependency warnings should not fail build
      'react-hooks/exhaustive-deps': 'warn',

      // Fast refresh rule (keep as warning)
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Security rule you already disabled
      'react/jsx-no-target-blank': 'off',
    },
  },
]
