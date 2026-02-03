import js from '@eslint/js'
import ts from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import vitest from 'eslint-plugin-vitest'

export default ts.config(
  { ignores: ['dist', 'node_modules'] },

  js.configs.recommended,
  ...ts.configs.recommended,

  {
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      // ── Estilo ─────────────────────────────────────────────
      semi: ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'jsx-quotes': ['error', 'prefer-double'],

      // ── Mejores prácticas ──────────────────────────────────
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-console': 'error',

      // ── TypeScript (overrides sobre recommended) ───────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],

      // ── React ──────────────────────────────────────────────
      'react/jsx-key': 'error',
      'react/jsx-uses-vars': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/no-unescaped-entities': 'error',
      'react/no-deprecated': 'error',

      // ── React Hooks ────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── Silenciada: uso deliberado con guards (main.tsx:5, GameEngine.ts:110) ──
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },

  // ── Solo archivos de test ──────────────────────────────────
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'src/test/**/*.ts'],
    plugins: { vitest },
    rules: {
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'warn'
    }
  }
)
