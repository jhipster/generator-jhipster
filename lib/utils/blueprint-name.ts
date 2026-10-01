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
 * @private
 * Normalize blueprint name: prepend 'generator-jhipster-' if needed
 * @param {string} blueprint - name of the blueprint
 * @returns {string} the normalized blueprint name
 */
export function normalizeBlueprintName(blueprint: string): string {
  try {
    const ns = requireNamespace(blueprint);
    if (ns.unscoped.startsWith('generator-jhipster-')) {
      return ns.toString();
    }
    return ns.with({ unscoped: `generator-jhipster-${ns.unscoped}` }).toString();
    // eslint-disable-next-line no-empty
  } catch {}
  if (blueprint?.startsWith('@')) {
    return blueprint;
  }
  if (blueprint && !blueprint.startsWith('generator-jhipster')) {
    return `generator-jhipster-${blueprint}`;
  }
  return blueprint;
}
