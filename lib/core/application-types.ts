/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import type { ValueOf } from 'type-fest';
import type { JHipsterNamedChoice } from './types.js';

export const APPLICATION_TYPE_MONOLITH = 'monolith';
export const APPLICATION_TYPE_MICROSERVICE = 'microservice';
export const APPLICATION_TYPE_GATEWAY = 'gateway';

const applicationTypes = {
  MONOLITH: {
    value: APPLICATION_TYPE_MONOLITH,
    name: 'Monolithic application (recommended for simple projects)',
  },
  MICROSERVICE: {
    value: APPLICATION_TYPE_MICROSERVICE,
    name: 'Microservice application',
  },
  GATEWAY: {
    value: APPLICATION_TYPE_GATEWAY,
    name: 'Gateway application',
  },
} as const satisfies Record<string, JHipsterNamedChoice>;

export const applicationTypesChoices = Object.values(applicationTypes);

export type ApplicationType = ValueOf<typeof applicationTypes>['value'];
