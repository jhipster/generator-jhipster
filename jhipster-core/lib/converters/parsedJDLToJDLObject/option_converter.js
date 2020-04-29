/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const JDLBinaryOption = require('../../core/jdl_binary_option');
const UnaryOptions = require('../../core/jhipster/unary_options');
const BinaryOptions = require('../../core/jhipster/binary_options');

module.exports = { convertOptions };

/**
 * Convert unary and binary options to JDLUnary & JDLBinary option classes.
 * @param {Object} parsedOptions - the parsed option object.
 * @returns {Array<JDLUnaryOption|JDLBinaryOption>} the converted JDLUnaryOption & JDLBinaryOption objects.
 */
function convertOptions(parsedOptions) {
  if (!parsedOptions) {
    throw new Error('Options have to be passed so as to be converted.');
  }
  const convertedUnaryOptions = convertUnaryOptions(parsedOptions);
  const convertedBinaryOptions = convertBinaryOptions(parsedOptions);
  return [...convertedUnaryOptions, ...convertedBinaryOptions];
}

function convertUnaryOptions(parsedOptions) {
  const convertedUnaryOptions = [];
  UnaryOptions.forEach(unaryOptionName => {
    const parsedUnaryOption = parsedOptions[unaryOptionName];
    if (!parsedUnaryOption || !parsedUnaryOption.list || parsedUnaryOption.list.length === 0) {
      return;
    }
    convertedUnaryOptions.push(
      new JDLUnaryOption({
        name: unaryOptionName,
        entityNames: parsedUnaryOption.list,
        excludedNames: parsedUnaryOption.excluded
      })
    );
  });
  return convertedUnaryOptions;
}

function convertBinaryOptions(parsedOptions) {
  const convertedBinaryOptions = [];
  BinaryOptions.forEach(binaryOptionName => {
    if (!parsedOptions[binaryOptionName]) {
      return;
    }
    const optionValues = Object.keys(parsedOptions[binaryOptionName]);
    optionValues.forEach(optionValue => {
      const parsedBinaryOption = parsedOptions[binaryOptionName][optionValue];
      convertedBinaryOptions.push(
        new JDLBinaryOption({
          name: binaryOptionName,
          value: optionValue,
          entityNames: parsedBinaryOption.list,
          excludedNames: parsedBinaryOption.excluded
        })
      );
    });
  });
  return convertedBinaryOptions;
}
