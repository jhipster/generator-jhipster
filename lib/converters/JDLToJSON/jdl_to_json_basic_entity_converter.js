/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const JSONEntity = require('../../core/jhipster/json_entity');
const { formatComment, formatDateForLiquibase } = require('../../utils/format_utils');
const { getTableNameFromEntityName } = require('../../core/jhipster/entity_table_name_creator');
const logger = require('../../utils/objects/logger');

const USER = 'user';
const AUTHORITY = 'authority';
const builtInEntities = new Set([USER, AUTHORITY]);

module.exports = {
  convert
};

/**
 * Converts JDL entities to JSONEntity objects with basic information.
 * @param {Array<JDLEntity>} jdlEntities - the JDL entities to convert.
 * @param {Date} creationTimestamp - the creation timestamp to use when creating JSON entity, optional.
 * @return {Map<String, JSONEntity>} a map having for keys entity names and for values the corresponding JSON entities.
 */
function convert(jdlEntities, creationTimestamp) {
  if (!jdlEntities) {
    throw new Error('JDL entities must be passed to get the basic entity information.');
  }
  return createJSONEntities(jdlEntities, creationTimestamp || new Date());
}

function createJSONEntities(jdlEntities, creationTimestamp) {
  const convertedEntities = new Map();
  jdlEntities.forEach((jdlEntity, index) => {
    const entityName = jdlEntity.name;
    /*
     * If the user adds a 'User' entity we consider it as the already
     * created JHipster User entity and none of its fields and owner-side
     * relationships will be considered.
     */
    if (builtInEntities.has(entityName.toLowerCase())) {
      logger.warn(
        `An Entity name '${entityName}' was used: '${entityName}' is an entity created by default by JHipster.` +
          ' All relationships toward it will be kept but any attributes and relationships from it will be disregarded.'
      );
      return;
    }
    convertedEntities.set(
      entityName,
      new JSONEntity({
        entityName,
        entityTableName: getTableNameFromEntityName(jdlEntity.tableName),
        changelogDate: formatDateForLiquibase({ date: new Date(creationTimestamp), increment: index + 1 }),
        javadoc: formatComment(jdlEntity.comment)
      })
    );
  });
  return convertedEntities;
}
