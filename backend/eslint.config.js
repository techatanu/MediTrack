import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['coverage'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Health data: route all diagnostics through the deliberate, PII-free log lines.
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
  {
    // CLI scripts and the startup banner print progress to stdout on purpose.
    files: ['scripts/**/*.js', 'src/server.js', 'src/config/db.js'],
    rules: { 'no-console': 'off' },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } },
  },
  // Last, so formatting is left entirely to Prettier.
  prettier,
];
