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
import { createBaseNeedle } from '../../lib/support/needles.mjs';

/**
 * @typedef {Object} ApplicationPropertiesNeedles - creates a new type named 'SpecialType'
 * @property {string} [property] - property declaration
 * @property {string} [propertyGetter] - property getter
 * @property {string} [propertyClass] - property class
 */

/**
 * Insert content into ApplicationProperties class
 * @example
 * insertContentIntoApplicationProperties(generator, application, {
 *   property: 'private final bar = new Bar();',
 *   proppertyGetter: `
 * public getBar() {
 *     return bar;
 * }`,
 *   propertyClass: `
 * public static class Async {
 *     private String foo = "default";
 * }`,
 * })
 * @example
 * generator.editFile(
 *   'ApplicationProperties.java',
 *   insertContentIntoApplicationProperties({
 *     property: 'private final bar = new Bar();',
 *     proppertyGetter: `
 * public getBar() {
 *     return bar;
 * }`,
 *     propertyClass: `
 * public static class Async {
 *     private String foo = "default";
 * }`,
 *   });
 * );
 * @param {import('../generator-base.js')} [generator]
 * @param {any} context
 * @param {ApplicationPropertiesNeedles} needles
 * @returns {import('../generator-base.js').CascatedEditFileCallback | import('../generator-base.js').EditFileCallback}
 */
// eslint-disable-next-line import/prefer-default-export
export const insertContentIntoApplicationProperties = (generator, data, needles) => {
  if (!needles) {
    needles = generator;
    generator = null;
  }

  return createBaseNeedle(
    {
      generator,
      filePath: generator ? `${data.SERVER_MAIN_SRC_DIR}${data.javaDir}config/ApplicationProperties.java` : undefined,
      needlesPrefix: 'application-properties',
    },
    needles
  );
};
