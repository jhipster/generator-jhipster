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

/**
 * @private
 * Parse creationTimestamp option
 * @returns {number} representing the milliseconds elapsed since January 1, 1970, 00:00:00 UTC
 *                   obtained by parsing the given string representation of the creationTimestamp.
 */
const parseCreationTimestamp = (context, creationTimestampOption) => {
  let creationTimestamp;
  if (creationTimestampOption) {
    creationTimestamp = Date.parse(creationTimestampOption);
    if (!creationTimestamp) {
      context.warning(`Error parsing creationTimestamp ${creationTimestampOption}.`);
    } else if (creationTimestamp > new Date().getTime()) {
      throw new Error(`Creation timestamp should not be in the future: ${creationTimestampOption}.`);
    }
  }
  return creationTimestamp;
};

/**
 *
 * @param context the context to reset faker seed for
 * @param basename name of the file
 */
const resetFakerSeed = (context, basename) => {
  if (context.entityClass) {
    if (context.configOptions && context.configOptions.sharedEntities) {
      // TODO looks executed for each entity class, should be executed only once
      Object.values(context.configOptions.sharedEntities).forEach(entity => {
        entity.resetFakerSeed(`${context.entityClass}-${basename}`);
      });
    } else if (context.resetFakerSeed) {
      context.resetFakerSeed(basename);
    }
  }
};

export { parseCreationTimestamp, resetFakerSeed };
