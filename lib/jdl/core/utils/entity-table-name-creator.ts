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

import { snakeCase } from 'lodash-es';
import { hibernateSnakeCase } from '../../../../generators/server/support/string.js';

/**
 * @deprecated TODO v9 drop this function and don't calculate entityTableName.
 * Returns an entity table name based on the passed entity name.
 * @param entityName - the entity's name
 * @returns the corresponding table name.
 */
export default function getTableNameFromEntityName(entityName: string): string {
  if (!entityName) {
    throw new Error('An entity name must be passed to get a table name.');
  }
  return snakeCase(entityName);
}

/**
 * @deprecated TODO v9 drop this function and don't calculate entityTableName.
 * Returns an entity table name based on the passed entity name if it conflicts with the default one.
 */
export const getTableNameFromEntityNameFallback = (entityName: string): string | undefined => {
  const snakeCasedEntityName = getTableNameFromEntityName(entityName);
  if (snakeCasedEntityName !== hibernateSnakeCase(entityName)) {
    return snakeCasedEntityName;
  }

  return undefined;
};

/**
 * @deprecated TODO v9 drop this function and always write entityTableName if exists.
 */
export const shouldWriteEntityTableName = (entityName: string, entityTableName: string): boolean => {
  return entityTableName !== snakeCase(entityName) || entityTableName !== hibernateSnakeCase(entityName);
};
