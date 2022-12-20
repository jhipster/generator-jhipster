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

import JDLValidation from '../../models/jdl-validation.js';
import { validations } from '../../jhipster/index.mjs';

const {
  Validations: { PATTERN },
} = validations;

export default { convertValidations };

/**
 * Converts a parsed JDL content corresponding to validations to an array of JDLValidation objects.
 * @param {Array} validations - parsed JDL validations.
 * @param constantValueGetter - the function to get a constant's value.
 * @return the converted JDLValidations.
 */
export function convertValidations(validations, constantValueGetter): JDLValidation[] {
  if (!validations) {
    throw new Error('Validations have to be passed so as to be converted.');
  }
  return validations.reduce((jdlValidations, parsedValidation) => {
    if (parsedValidation) {
      jdlValidations.push(convertValidation(parsedValidation, constantValueGetter));
    }
    return jdlValidations;
  }, []);
}

/**
 * Converts a parsed JDL content corresponding to a validation to a JDLValidation object.
 * @param {Object} validation - a parsed JDL validation.
 * @param {Function} constantValueGetter - the function to get a constant's value.
 * @return the converted JDLValidation.
 */
function convertValidation(validation, constantValueGetter): JDLValidation {
  let { value } = validation;
  if (validation.constant) {
    value = constantValueGetter.call(undefined, value);
  }
  if (validation.key === PATTERN) {
    value = formatThePatternValidationValue(value);
  }
  return new JDLValidation({
    name: validation.key,
    value,
  });
}

function formatThePatternValidationValue(value) {
  if (!value.includes("'")) {
    return value;
  }
  const chunks = value.split("'").map(chunk => {
    if (!chunk.endsWith('\\')) {
      return `${chunk}\\`;
    }
    return chunk;
  });
  return chunks.join("\\'");
}
