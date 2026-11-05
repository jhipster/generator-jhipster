/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { coerce, lt } from 'semver';

/**
 * Entries of the server `libs.versions.toml` that are applied over the versions Spring Boot manages, to pick up security fixes.
 * The `<name>.version` property of each one is overridden while Spring Boot manages an older patch release of the same line.
 */
export const MANAGED_VERSION_OVERRIDES = ['jackson-bom', 'jackson-2-bom', 'mariadb'] as const;

export type ManagedVersionOverride = (typeof MANAGED_VERSION_OVERRIDES)[number];

/**
 * Whether `managedVersion` is an older release than `version` on the same major.minor line.
 * Maven versions that are not semver, like `2.13.4.20221013` or `3.5.11.Final`, are compared by their first three numbers,
 * and versions without them are never considered older.
 */
export const isOlderPatchVersion = (managedVersion: string, version: string): boolean => {
  const managed = coerce(managedVersion);
  const override = coerce(version);
  if (!managed || !override) return false;
  return managed.major === override.major && managed.minor === override.minor && lt(managed, override);
};

/**
 * Returns the `<name>.version` properties to override, with the version of `dependencies` that replaces the managed one.
 */
export const getManagedVersionOverrides = ({
  names = MANAGED_VERSION_OVERRIDES,
  managedProperties,
  dependencies,
}: {
  names?: readonly string[];
  managedProperties: Record<string, string | null | undefined>;
  dependencies: Record<string, string | undefined>;
}): { property: string; value: string }[] =>
  names.flatMap(name => {
    const property = `${name}.version`;
    const managedVersion = managedProperties[property];
    const value = dependencies[name];
    return managedVersion && value && isOlderPatchVersion(managedVersion, value) ? [{ property, value }] : [];
  });
