import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'docs/history/visual-reviews/**',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  {
    files: ['src/{engine,data}/**/*.js'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex:
                '(^|/)(app|features|state|shared)(/|$)|^react(?:-dom|-router-dom)?(?:/|$)|^@xyflow/',
              message:
                'El motor y los datos deben permanecer independientes de React, estado e interfaz.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/state/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)(app|features)(/|$)|(^|/)shared/(ui|hooks)(/|$)|^@xyflow/',
              message:
                'El estado puede usar datos, motor y utilidades puras; no depende de pantallas ni del editor.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '(^|/)(app|features|state)(/|$)',
              message:
                'Los módulos compartidos no deben depender de las funcionalidades ni de su estado.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex:
                '^\\.{1,2}/(?:\\.\\./)*(?:home|learning|progression|puzzle)/(?:components|hooks|services|data|assets|pages)(?:/|$)',
              message: 'Importa otras funcionalidades a través de su index.js público.',
            },
          ],
        },
      ],
    },
  },
];
