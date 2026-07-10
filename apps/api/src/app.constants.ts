/**
 * Static application metadata.
 *
 * Kept here (rather than importing `package.json`) so the compiler's `rootDir`
 * boundary stays intact and the bundled output has no dependency on the package
 * manifest at runtime. The version is surfaced in Swagger and traces; it is
 * overridden at runtime by `npm_package_version` when available (set by pnpm).
 */
export const APP_NAME = 'ssc-api';

export const APP_VERSION = process.env.npm_package_version ?? '0.1.0';
