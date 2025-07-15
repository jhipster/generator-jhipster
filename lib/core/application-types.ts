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
import type { JHipsterNamedChoice } from './types.js';

export const APPLICATION_TYPE_KEY = 'applicationType';

export const APPLICATION_TYPE_MONOLITH = 'monolith';
export const APPLICATION_TYPE_MICROSERVICE = 'microservice';
export const APPLICATION_TYPE_GATEWAY = 'gateway';

export const applicationTypesChoices = [
  {
    value: APPLICATION_TYPE_MONOLITH,
    name: 'Monolithic application (recommended for simple projects)',
  },
  {
    value: APPLICATION_TYPE_GATEWAY,
    name: 'Gateway application',
  },
  {
    value: APPLICATION_TYPE_MICROSERVICE,
    name: 'Microservice application',
  },
] as const satisfies JHipsterNamedChoice[];

export type ApplicationType = (typeof applicationTypesChoices)[number]['value'];
