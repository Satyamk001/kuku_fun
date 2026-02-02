import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'dist/**', 'build/**', '*.config.js', '*.config.ts', '*.config.mjs']
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
];
