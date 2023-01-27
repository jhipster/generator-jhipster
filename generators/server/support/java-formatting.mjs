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
import _ from 'lodash';

/**
 * @private
 * Convert to Java bean name case
 *
 * Handle the specific case when the second letter is capitalized
 * See http://stackoverflow.com/questions/2948083/naming-convention-for-getters-setters-in-java
 *
 * @param {string} beanName
 * @return {string}
 */
export const javaBeanCase = beanName => {
  const secondLetter = beanName.charAt(1);
  if (secondLetter && secondLetter === secondLetter.toUpperCase()) {
    return beanName;
  }
  return _.upperFirst(beanName);
};

/**
 * @private
 * Create a java getter of reference.
 *
 * @param {object|string[]} reference
 * @return {string}
 */
export const buildJavaGet = reference => {
  let refPath;
  if (typeof refPath === 'string') {
    refPath = [reference];
  } else if (Array.isArray(reference)) {
    refPath = reference;
  } else {
    refPath = [reference.name];
  }
  return refPath.map(partialPath => `get${javaBeanCase(partialPath)}()`).join('.');
};

/**
 * @private
 * Create a java getter method of reference.
 *
 * @param {object} reference
 * @param {string} type
 * @return {string}
 */
export const buildJavaGetter = (reference, type = reference.type) => {
  return `${type} get${javaBeanCase(reference.name)}()`;
};

/**
 * @private
 * Create a java getter method of reference.
 *
 * @param {object} reference
 * @param {string} valueDefinition
 * @return {string}
 */
export const buildJavaSetter = (reference, valueDefinition = `${reference.type} ${reference.name}`) => {
  return `set${javaBeanCase(reference.name)}(${valueDefinition})`;
};
