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

import { lowerFirst } from 'lodash-es';

import { normalizeBlueprintName } from '../../../utils/blueprint-name.ts';

import type { JDLConversionCustomizations } from './ast-to-files.ts';

/**
 * What JHipster adds to the conversion of a jdl, outside what the jdl declares:
 * - an application without base name is named `jhipster`;
 * - a blueprint, and its namespace config, is named after its package, as a jdl names them without the
 *   generator-jhipster- prefix;
 * - a relationship naming no field on either side names both, after the entity of the other side with a lower-case
 *   first letter: it is bidirectional.
 */
export const jhipsterCustomizations: JDLConversionCustomizations = {
  application: ({ config, namespaceConfigs }) => ({
    config: {
      baseName: 'jhipster',
      ...config,
      ...(config.blueprints ? { blueprints: config.blueprints.map((name: string) => normalizeBlueprintName(name)) } : {}),
    },
    namespaceConfigs: Object.fromEntries(
      Object.entries(namespaceConfigs).map(([namespace, namespaceConfig]) => [normalizeBlueprintName(namespace), namespaceConfig]),
    ),
  }),
  relationship: relationship => {
    const { from, to } = relationship;
    if (from.injectedField || to.injectedField) return relationship;
    return { ...relationship, from: { ...from, injectedField: lowerFirst(to.name) }, to: { ...to, injectedField: lowerFirst(from.name) } };
  },
};
