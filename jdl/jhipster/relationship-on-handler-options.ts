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

const validOptions = ['NO ACTION', 'RESTRICT', 'CASCADE', 'SET NULL', 'SET DEFAULT'];

/**
 * Checks that the value is a valid option for foreign key on handlers, and returns it if it is. If it isn't, resets the value to undefined.
 * @param onValue
 * @param generator
 * @returns
 */
export default function checkAndReturnRelationshipOnValue(onValue, generator) {
  let result = onValue;

  if (result) {
    if (!validOptions.includes(result)) {
      generator.log.warn(`Invalid value '${result}' for onDelete or onUpdate - resetting to undefined.`);

      result = undefined;
    }
  }

  return result;
}
