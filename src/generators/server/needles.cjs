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
const { createBaseNeedle } = require('../../lib/support/needles.cjs');

/**
 * @typedef {Object} ApplicationPropertiesNeedles - creates a new type named 'SpecialType'
 * @property {string} [property] - property declaration
 * @property {string} [propertyGetter] - property getter
 * @property {string} [propertyClass] - property class
 */

/**
 * Insert content into ApplicationProperties class
 * @example
 * insertContentIntoApplicationProperties(generator, {
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
 * @param {ApplicationPropertiesNeedles} needles
 * @returns {import('../../generators/generator-base.js').CascatedEditFileCallback | import('../../generators/generator-base.js').EditFileCallback}
 */
const insertContentIntoApplicationProperties = (generator, needles) => {
  if (!needles) {
    needles = generator;
    generator = null;
  }

  return createBaseNeedle(
    {
      generator,
      filePath: generator ? `${generator.SERVER_MAIN_SRC_DIR}${generator.javaDir}config/ApplicationProperties.java` : undefined,
      needlesPrefix: 'application-properties',
    },
    needles
  );
};

module.exports = {
  insertContentIntoApplicationProperties,
};
