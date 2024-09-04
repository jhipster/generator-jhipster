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
import type { BaseApplicationGeneratorDefinition } from '../base-application/tasks.js';
import { type Entity } from '../base-application/index.js';
import type { ClientServerApplication } from './types.js';

export { default } from './generator.js';
export { default as command } from './command.js';
export { commonFiles as files } from './files.js';

// TODO move to ./generator.mts
type ApplicationDefinition = {
  applicationType: ClientServerApplication;
  entityType: Entity;
  sourceType: Record<string, (...args: any[]) => any>;
};

// TODO move to ./generator.mts
export type GeneratorDefinition<Definition extends ApplicationDefinition = ApplicationDefinition> =
  BaseApplicationGeneratorDefinition<Definition>;
