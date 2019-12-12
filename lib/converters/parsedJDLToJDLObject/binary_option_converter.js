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

const JDLBinaryOption = require('../../core/jdl_binary_option');
const { Options } = require('../../core/jhipster/binary_options');

module.exports = { convertBinaryOptions };

function convertBinaryOptions(binaryOptions, entityListGetter) {
  if (!binaryOptions) {
    throw new Error('Binary options have to be passed so as to be converted.');
  }
  const convertedBinaryOptions = [];
  const availableOptionNames = Object.values(Options);
  availableOptionNames.forEach(optionName => {
    if (!binaryOptions[optionName]) {
      return;
    }
    // because an option can be used more than one time, but with different option values
    const optionValues = Object.keys(binaryOptions[optionName]);
    optionValues.forEach(optionValue => {
      const convertedBinaryOption = convertBinaryOption(optionName, optionValue, entityListGetter);
      convertedBinaryOptions.push(convertedBinaryOption);
    });
  });
  return convertedBinaryOptions;
}

function convertBinaryOption(optionName, optionValue, entityListGetter) {
  const { entityList, excludedEntityList } = entityListGetter.call(undefined, optionName, optionValue);
  const args = {
    name: optionName,
    value: optionValue,
    entityNames: entityList,
    excludedNames: excludedEntityList
  };
  return new JDLBinaryOption(args);
}
