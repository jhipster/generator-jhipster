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
import { relative } from 'node:path';

import { getSourceRoot } from '../index.ts';
import { JHIPSTER_NAMESPACE_PREFIX, lookupGeneratorsMeta } from '../resolver/lookups.ts';

type LookupGeneratorsOptions = {
  firstLevelOnly?: boolean;
  absolute?: boolean;
};

/**
 * The jhipster generators of this installation, sorted by path, with their namespace without the `jhipster:` prefix.
 * The path is relative to the source root, or absolute with `absolute`.
 */
export const lookupGeneratorsWithNamespace = ({ firstLevelOnly, absolute }: LookupGeneratorsOptions = {}): {
  generator: string;
  namespace: string;
}[] => {
  const sourceRoot = getSourceRoot();
  return lookupGeneratorsMeta()
    .map(meta => ({
      generator: absolute ? meta.resolved : relative(sourceRoot, meta.resolved).replaceAll('\\', '/'),
      namespace: meta.namespace.slice(JHIPSTER_NAMESPACE_PREFIX.length),
    }))
    .filter(({ namespace }) => !firstLevelOnly || !namespace.includes(':'));
};

/**
 * The paths of the jhipster generators of this installation, sorted, relative to the source root or absolute.
 */
export const lookupGenerators = (options?: LookupGeneratorsOptions): string[] =>
  lookupGeneratorsWithNamespace(options).map(({ generator }) => generator);
