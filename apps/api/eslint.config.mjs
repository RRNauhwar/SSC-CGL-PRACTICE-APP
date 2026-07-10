import { nestjsConfig } from '@ssc/eslint-config/nestjs';

/**
 * ESLint flat config for the API app.
 * Extends the shared NestJS preset and points the type-aware rules at this
 * project's tsconfig so `projectService` can resolve types correctly.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  ...nestjsConfig,
  {
    languageOptions: {
      parserOptions: {
        // Use an explicit lint tsconfig that also includes test files, so
        // type-aware rules can resolve every linted file.
        projectService: false,
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', 'prisma/generated/**'],
  },
];
