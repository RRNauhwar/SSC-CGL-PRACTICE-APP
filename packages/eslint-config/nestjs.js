// @ts-check
import { baseConfig } from './index.js';

/**
 * ESLint preset for NestJS applications.
 * NestJS relies heavily on decorators and dependency injection, which require a
 * few pragmatic relaxations on top of the strict base config.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nestjsConfig = [
  ...baseConfig,
  {
    rules: {
      // Decorator metadata and DI legitimately use interface-only classes.
      '@typescript-eslint/no-extraneous-class': 'off',
      // Nest providers frequently return `this` fluent builders / decorated methods.
      '@typescript-eslint/explicit-member-accessibility': 'off',
    },
  },
];

export default nestjsConfig;
