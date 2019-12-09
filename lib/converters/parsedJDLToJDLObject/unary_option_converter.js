/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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

const JDLUnaryOption = require('../../core/jdl_unary_option');
const { FILTER, NO_FLUENT_METHOD, READ_ONLY, SKIP_CLIENT, SKIP_SERVER } = require('../../core/jhipster/unary_options');

module.exports = { convertUnaryOptions };

/**
 * Converts parsed unary options to JDLUnaryOption objects.
 * @param {Object} unaryOptions - the object containing the parsed unary options.
 * @param {Object} unaryOptions.skipClientOption - the parsed skipClient option.
 * @param {Object} unaryOptions.skipServerOption - the parsed skipServer option.
 * @param {Object} unaryOptions.noFluentMethodOption - the parsed noFluentMethod option.
 * @param {Object} unaryOptions.filterOption - the parsed filter option.
 * @param {Object} unaryOptions.readOnlyOption - the parsed readOnlyOption.
 * @returns {Array<JDLUnaryOption>} the converted JDLUnaryOption array.
 */
function convertUnaryOptions(unaryOptions) {
  if (!unaryOptions) {
    throw new Error('Unary options have to be passed to be converted.');
  }
  const { skipClientOption, skipServerOption, filterOption, noFluentMethodOption, readOnlyOption } = unaryOptions;
  const options = [];
  if (skipClientOption.list.length !== 0) {
    options.push(
      new JDLUnaryOption({
        name: SKIP_CLIENT,
        entityNames: skipClientOption.list,
        excludedNames: skipClientOption.excluded
      })
    );
  }
  if (skipServerOption.list.length !== 0) {
    options.push(
      new JDLUnaryOption({
        name: SKIP_SERVER,
        entityNames: skipServerOption.list,
        excludedNames: skipServerOption.excluded
      })
    );
  }
  if (noFluentMethodOption.list.length !== 0) {
    options.push(
      new JDLUnaryOption({
        name: NO_FLUENT_METHOD,
        entityNames: noFluentMethodOption.list,
        excludedNames: noFluentMethodOption.excluded
      })
    );
  }
  if (filterOption.list.length !== 0) {
    options.push(
      new JDLUnaryOption({
        name: FILTER,
        entityNames: filterOption.list,
        excludedNames: filterOption.excluded
      })
    );
  }
  if (readOnlyOption.list.length !== 0) {
    options.push(
      new JDLUnaryOption({
        name: READ_ONLY,
        entityNames: readOnlyOption.list,
        excludedNames: readOnlyOption.excluded
      })
    );
  }
  return options;
}
