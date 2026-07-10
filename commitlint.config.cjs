/**
 * Commit message linting using Conventional Commits.
 * Enforced via the Husky `commit-msg` hook so history stays machine-parseable
 * (enables automated changelogs and semantic versioning later).
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'api',
        'web',
        'ai',
        'db',
        'infra',
        'ci',
        'deps',
        'config',
        'auth',
        'content',
        'assessment',
        'analytics',
        'release',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
  },
};
