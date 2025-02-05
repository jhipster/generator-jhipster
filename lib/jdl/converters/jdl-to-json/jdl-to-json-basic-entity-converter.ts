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

import JSONEntity from '../../core/basic-types/json-entity.js';
import { formatComment } from '../../core/utils/format-utils.js';
import { getTableNameFromEntityNameFallback } from '../../core/utils/entity-table-name-creator.js';
import type { JDLEntity } from '../../core/models/index.js';

export default {
  convert,
};

/**
 * Converts JDL entities to JSONEntity objects with basic information.
 * @param jdlEntities - the JDL entities to convert.
 * @return a map having for keys entity names and for values the corresponding JSON entities.
 */
export function convert(jdlEntities: JDLEntity[]): Map<string, JSONEntity> {
  if (!jdlEntities) {
    throw new Error('JDL entities must be passed to get the basic entity information.');
  }
  return createJSONEntities(jdlEntities);
}

function createJSONEntities(jdlEntities: JDLEntity[]): Map<string, JSONEntity> {
  const convertedEntities = new Map<string, JSONEntity>();

  jdlEntities.forEach((jdlEntity: JDLEntity) => {
    const entityName = jdlEntity.name;
    convertedEntities.set(
      entityName,
      new JSONEntity({
        entityName,
        entityTableName: jdlEntity.tableName ?? getTableNameFromEntityNameFallback(entityName),
        documentation: formatComment(jdlEntity.comment),
        annotations: jdlEntity.annotations,
      }),
    );
  });
  return convertedEntities;
}
