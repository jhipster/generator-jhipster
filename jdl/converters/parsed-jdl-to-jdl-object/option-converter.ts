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

import JDLUnaryOption from '../../models/jdl-unary-option.js';
import JDLBinaryOption from '../../models/jdl-binary-option.js';
import { unaryOptions, binaryOptions } from '../../jhipster/index.mjs';

const { OptionValues, getOptionName } = binaryOptions;
export default { convertOptions };

/**
 * Convert unary and binary options to JDLUnary & JDLBinary option classes.
 * @param {Object} parsedOptions - the parsed option object.
 * @param {Array<Object>} useOptions - the parsed option object, using the use form.
 * @returns {Array<JDLUnaryOption|JDLBinaryOption>} the converted JDLUnaryOption & JDLBinaryOption objects.
 */
export function convertOptions(parsedOptions, useOptions) {
  if (!parsedOptions) {
    throw new Error('Options have to be passed so as to be converted.');
  }
  const convertedUnaryOptions = convertUnaryOptions(parsedOptions);
  const convertedBinaryOptions = convertBinaryOptions(parsedOptions);
  const convertedUseOptions = convertUseOptions(useOptions);
  return [...convertedUnaryOptions, ...convertedBinaryOptions, ...convertedUseOptions];
}

function convertUnaryOptions(parsedOptions) {
  const convertedUnaryOptions: JDLUnaryOption[] = [];
  unaryOptions.forEach(unaryOptionName => {
    const parsedUnaryOption = parsedOptions[unaryOptionName];
    if (!parsedUnaryOption || !parsedUnaryOption.list || parsedUnaryOption.list.length === 0) {
      return;
    }
    convertedUnaryOptions.push(
      new JDLUnaryOption({
        name: unaryOptionName,
        entityNames: parsedUnaryOption.list,
        excludedNames: parsedUnaryOption.excluded,
      })
    );
  });
  return convertedUnaryOptions;
}

function convertBinaryOptions(parsedOptions) {
  const convertedBinaryOptions: JDLBinaryOption[] = [];
  binaryOptions.forEach(binaryOptionName => {
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
          excludedNames: parsedBinaryOption.excluded,
        })
      );
    });
  });
  return convertedBinaryOptions;
}

function convertUseOptions(useOptions) {
  const convertedUseOptions: JDLBinaryOption[] = [];

  useOptions.forEach(useValue => {
    const { optionValues, list, excluded } = useValue;

    optionValues.forEach(optionValue => {
      if (!OptionValues[optionValue]) {
        return;
      }
      convertedUseOptions.push(
        new JDLBinaryOption({
          name: getOptionName(OptionValues[optionValue]),
          value: optionValue,
          entityNames: list,
          excludedNames: excluded,
        })
      );
    });
  });

  return convertedUseOptions;
}
