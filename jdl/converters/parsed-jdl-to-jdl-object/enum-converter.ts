/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { JDLEnum } from '../../models/index.mjs';
import { formatComment } from '../../utils/format-utils.js';

export default { convertEnums };

/**
 * Converts a parsed JDL content corresponding to enumerations to an array of JDLEnum objects.
 * @param {Array} enumerations - parsed JDL enumerations.
 * @return the converted JDLEnums.
 */
export function convertEnums(enumerations): JDLEnum[] {
  if (!enumerations) {
    throw new Error('Enumerations have to be passed so as to be converted.');
  }
  return enumerations.map(enumeration => convertEnum(enumeration));
}

/**
 * Converts a parsed JDL content corresponding to an enumeration to a JDLEnum object.
 * @param {Object} enumeration - a parsed JDL enumeration.
 * @return the converted JDLEnum.
 */
function convertEnum(enumeration): JDLEnum {
  return new JDLEnum({
    name: enumeration.name,
    values: enumeration.values,
    comment: formatComment(enumeration.javadoc),
  });
}
