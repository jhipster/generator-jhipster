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

import type { JHipsterOptionDefinition } from '../../../lib/jdl/types/parsing.js';

export const DATABASE_MIGRATION = 'databaseMigration';
export const DATABASE_MIGRATION_LIQUIBASE = 'liquibase';

const ALPHANUMERIC_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;

const optionDefinition: JHipsterOptionDefinition = {
  name: DATABASE_MIGRATION,
  type: 'string',
  tokenType: 'NAME',
  tokenValuePattern: ALPHANUMERIC_PATTERN,
  knownChoices: [DATABASE_MIGRATION_LIQUIBASE],
};

export default optionDefinition;
