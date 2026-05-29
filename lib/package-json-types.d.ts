/**
 * Local type override for @package-json/types.
 *
 * `@package-json/types@0.0.12` (the version pulled in transitively by
 * `eslint-plugin-import-x`) has internal contradictions in its d.ts where
 * optional properties (`node?: string`, `extends?: string`, `main?: string`,
 * `browser?: string`) are declared alongside `[k: string]: string` index
 * signatures, producing four TS2411 errors under `strict`.
 *
 * The `paths` mapping in tsconfig.json redirects all `@package-json/types`
 * imports to this file, bypassing the broken upstream. This file exposes
 * only the symbols that `eslint-plugin-import-x` actually consumes (see
 * `eslint-plugin-import-x/lib/utils/read-pkg-up.d.ts` and
 * `eslint-plugin-import-x/lib/rules/no-extraneous-dependencies.d.ts`).
 *
 * Upstream status (as of 2026-05-18):
 * - The bug is fixed in `@package-json/types@0.0.13` via commit 5ff69e72,
 *   which landed through the package's `src/patch/` mechanism (the proper
 *   path for changes that need to survive `build:upstream` regeneration).
 * - `eslint-plugin-import-x` currently pins `^0.0.12`. A bump PR
 *   (https://github.com/un-ts/eslint-plugin-import-x/pull/478) is open,
 *   alongside discussions in issues #471, #476, and #477 exploring whether
 *   to bump the dependency or replace it with an inline `PackageJson` type.
 *   Either resolution would unblock consumers; the choice is up to the
 *   maintainers.
 *
 * Remove this override (and the `paths` entry in tsconfig.json) once
 * `eslint-plugin-import-x` ships with `@package-json/types@^0.0.13` or
 * adopts an inline type.
 */

declare module '@package-json/types' {
  export type Dependency = Record<string, string>;
  export type DevDependency = Record<string, string>;
  export type OptionalDependency = Record<string, string>;
  export type PeerDependency = Record<string, string>;

  export type PackageJson = {
    name?: string;
    version?: string;
    dependencies?: Dependency;
    devDependencies?: DevDependency;
    optionalDependencies?: OptionalDependency;
    peerDependencies?: PeerDependency;
    [key: string]: unknown;
  };
}
