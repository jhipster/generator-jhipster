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

import BaseGenerator from '../../../generators/base/index.ts';
import BaseApplicationGenerator from '../../../generators/base-application/index.ts';
import BaseCoreGenerator from '../../../generators/base-core/index.ts';
import BaseSimpleApplicationGenerator from '../../../generators/base-simple-application/index.ts';
import BaseWorkspacesGenerator from '../../../generators/base-workspaces/index.ts';

// eslint-disable-next-line no-prototype-builtins
const isPrototypeOfOrIsSame = (base: any, obj: any): boolean => base === obj || base.prototype.isPrototypeOf(obj.prototype);

type BASE_TYPES = 'base-core' | 'base' | 'base-simple-application' | 'base-application' | 'base-workspaces';

const EXPORTED_TYPES_BY_BASE_TYPE: Record<BASE_TYPES, string[]> = {
  'base-core': ['Config', 'Features', 'Options'],
  base: ['Config', 'Features', 'Options', 'Source'],
  'base-simple-application': ['Config', 'Features', 'Options', 'Source', 'Application'],
  'base-application': ['Config', 'Features', 'Options', 'Source', 'Application', 'Entity', 'Field', 'Relationship'],
  'base-workspaces': ['Config', 'Features', 'Options', 'Source', 'Deployment', 'WorkspacesApplication'],
} as const;

export const getExportedTypesForBaseType = (baseType: BASE_TYPES): string[] => EXPORTED_TYPES_BY_BASE_TYPE[baseType];

export const detectGeneratorType = async (generatorOrModule: string | { default: unknown }): Promise<BASE_TYPES> => {
  const module: { default: unknown } = typeof generatorOrModule === 'string' ? await import(generatorOrModule) : generatorOrModule;
  const isCoreGenerator = isPrototypeOfOrIsSame(BaseCoreGenerator, module.default);
  if (!isCoreGenerator) {
    throw new Error(`Generator ${generatorOrModule} does not extend BaseCoreGenerator`);
  }
  if (isPrototypeOfOrIsSame(BaseWorkspacesGenerator, module.default)) {
    return 'base-workspaces';
  }
  if (isPrototypeOfOrIsSame(BaseApplicationGenerator, module.default)) {
    return 'base-application';
  }
  if (isPrototypeOfOrIsSame(BaseSimpleApplicationGenerator, module.default)) {
    return 'base-simple-application';
  }
  if (isPrototypeOfOrIsSame(BaseGenerator, module.default)) {
    return 'base';
  }
  return 'base-core';
};
