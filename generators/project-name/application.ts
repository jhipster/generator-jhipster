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

import { kebabCase, startCase, upperFirst } from 'lodash-es';

import { type MutateDataParam, type MutateDataPropertiesWithRequiredProperties, upperFirstCamelCase } from '../../lib/utils/index.ts';
import { customCamelCase } from '../../lib/utils/string-utils.ts';

import { getHipster } from './internal/index.ts';

export type ProjectNameAddedApplicationProperties = {
  baseName: string;
  camelizedBaseName: string;
  capitalizedBaseName: string;
  dasherizedBaseName: string;
  humanizedBaseName: string;
  hipster: string;
  lowercaseBaseName: string;
  upperFirstCamelCaseBaseName: string;
};

export const mutateApplication = {
  __override__: false,
  baseName: 'JHipster',
  camelizedBaseName: ({ baseName }) => customCamelCase(baseName),
  capitalizedBaseName: ({ baseName }) => upperFirst(baseName),
  dasherizedBaseName: ({ baseName }) => kebabCase(baseName),
  hipster: ({ baseName }) => getHipster(baseName),
  humanizedBaseName: ({ baseName }) => (baseName.toLowerCase() === 'jhipster' ? 'JHipster' : startCase(baseName)),
  lowercaseBaseName: ({ baseName }) => baseName?.toLowerCase(),
  upperFirstCamelCaseBaseName: ({ baseName }) => upperFirstCamelCase(baseName),
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<ProjectNameAddedApplicationProperties>,
  ProjectNameAddedApplicationProperties
>;
