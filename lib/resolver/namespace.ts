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
import { requireNamespace } from '@yeoman/namespace';

/**
 * The namespace of a generator as a generator or a command names it:
 * - `:<generator>` is a generator of the package of the generator `from` names, its scope kept
 *   (`:server` from `@scope/jhipster-foo:app` is `@scope/jhipster-foo:server`);
 * - a name without `:` is a jhipster generator (`server` is `jhipster:server`);
 * - any other is the namespace itself.
 */
export const resolveGeneratorNamespace = (
  namespace: string,
  { from, namespacePrefix = 'jhipster' }: { from?: string; namespacePrefix?: string } = {},
): string => {
  if (namespace.startsWith(':')) {
    if (!from) {
      throw new Error(`The generator ${namespace} is of the package of the generator naming it, which is not known`);
    }
    return `${requireNamespace(from).packageNamespace}${namespace}`;
  }
  return namespace.includes(':') ? namespace : `${namespacePrefix}:${namespace}`;
};
