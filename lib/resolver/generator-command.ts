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
import type { StoreGeneratorMeta } from 'yeoman-environment';

import type { JHipsterCommandDefinition } from '../command/types.ts';

/**
 * The command of a generator of a store: the default export of its sibling `command` module, read without loading the
 * generator and its imports. A generator without a `command` module has no command.
 */
export const requireGeneratorCommand = (meta: object | undefined): JHipsterCommandDefinition | undefined =>
  (
    (meta as Pick<StoreGeneratorMeta, 'requireSibling'> | undefined)?.requireSibling?.('command') as
      { default?: JHipsterCommandDefinition } | undefined
  )?.default;
