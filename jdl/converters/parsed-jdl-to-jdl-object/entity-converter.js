/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

const JDLEntity = require('../../models/jdl-entity');
const { formatComment } = require('../../utils/format-utils');

module.exports = { convertEntities };

/**
 * Converts parsed entities to JDLEntity Objects.
 * @param {Array<Object>} parsedEntities - parsed entities from JDL content.
 * @param {Function} jdlFieldGetterFunction - the function called to retrieve JDL fields for an entity.
 * @returns {Array<JDLEntity>} converted JDLEntity objects.
 */
function convertEntities(parsedEntities, jdlFieldGetterFunction) {
  if (!parsedEntities) {
    throw new Error('Entities have to be passed so as to be converted.');
  }
  return parsedEntities.map(parsedEntity => {
    const jdlEntity = new JDLEntity({
      name: parsedEntity.name,
      tableName: parsedEntity.tableName || parsedEntity.name,
      comment: formatComment(parsedEntity.javadoc),
    });
    const jdlFields = jdlFieldGetterFunction.call(undefined, parsedEntity);
    jdlEntity.addFields(jdlFields);
    return jdlEntity;
  });
}
