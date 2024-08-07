/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { parse } from '@iarna/toml';

type LibsToml = {
  versions?: Record<string, string>;
  libraries?: Record<string, string | { module: string; version: string } | { group: string; name: string; version: string }>;
  plugins?: Record<string, string | { id: string; version: string }>;
};

export function getGradleLibsVersionsProperties(libsVersionsContent: string): Record<string, string> {
  const parsed = parse(libsVersionsContent) as LibsToml;
  return {
    ...parsed.versions,
    ...Object.fromEntries([
      ...Object.entries(parsed.libraries ?? {}).map(([dependencyName, dependency]) => [
        dependencyName,
        typeof dependency === 'string' ? dependency.split(':')[2] : dependency.version,
      ]),
      ...Object.entries(parsed.plugins ?? {}).map(([dependencyName, dependency]) => [
        dependencyName,
        typeof dependency === 'string' ? dependency.split(':')[1] : dependency.version,
      ]),
    ]),
  };
}
