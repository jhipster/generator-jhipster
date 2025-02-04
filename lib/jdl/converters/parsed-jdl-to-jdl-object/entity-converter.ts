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

import { lowerFirst } from 'lodash-es';
import { JDLEntity } from '../../core/models/index.js';
import { formatComment } from '../../core/utils/format-utils.js';
import type JDLField from '../../core/models/jdl-field.js';
import type { ParsedJDLEntity } from '../../core/types/parsed.js';

export default { convertEntities };

/**
 * Converts parsed entities to JDLEntity Objects.
 * @param {Array<Object>} parsedEntities - parsed entities from JDL content.
 * @param {Function} jdlFieldGetterFunction - the function called to retrieve JDL fields for an entity.
 * @returns converted JDLEntity objects.
 */
export function convertEntities(
  parsedEntities: ParsedJDLEntity[],
  jdlFieldGetterFunction: (entity: ParsedJDLEntity) => JDLField[],
): JDLEntity[] {
  if (!parsedEntities) {
    throw new Error('Entities have to be passed so as to be converted.');
  }
  return parsedEntities.map(parsedEntity => {
    const jdlEntity = new JDLEntity({
      name: parsedEntity.name,
      tableName: parsedEntity.tableName,
      comment: formatComment(parsedEntity.documentation),
      annotations: Object.fromEntries(
        parsedEntity.annotations?.map(annotation => [
          lowerFirst(annotation.optionName),
          annotation.type === 'UNARY' ? true : annotation.optionValue,
        ]) ?? [],
      ),
    });
    const jdlFields = jdlFieldGetterFunction.call(undefined, parsedEntity);
    jdlEntity.addFields(jdlFields);
    return jdlEntity;
  });
}
