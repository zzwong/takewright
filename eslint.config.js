import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {ignores: ['node_modules', 'output', 'public/recordings']},
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {globals: {console: 'readonly', process: 'readonly', Buffer: 'readonly'}},
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['fixtures/*.mjs'],
    languageOptions: {globals: {console: 'readonly', process: 'readonly'}},
  },
);
