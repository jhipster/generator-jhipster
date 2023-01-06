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

import logger from '../utils/objects/logger.js';
import JDLApplicationConfiguration from './jdl-application-configuration.js';
import StringJDLApplicationConfigurationOption from './string-jdl-application-configuration-option.js';
import IntegerJDLApplicationConfigurationOption from './integer-jdl-application-configuration-option.js';
import BooleanJDLApplicationConfigurationOption from './boolean-jdl-application-configuration-option.js';
import ListJDLApplicationConfigurationOption from './list-jdl-application-configuration-option.js';
import { applicationOptions } from '../jhipster/index.mjs';

const { getTypeForOption, doesOptionExist, OptionTypes, shouldTheValueBeQuoted } = applicationOptions;

export default function createApplicationConfigurationFromObject(configurationObject = {}) {
  const configuration = new JDLApplicationConfiguration();
  Object.keys(configurationObject).forEach(optionName => {
    const optionValue = configurationObject[optionName];
    // TODO: This is probably a bug. The function does not expect two arguments!
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!doesOptionExist(optionName, optionValue)) {
      logger.debug(`Unrecognized application option name and value: ${optionName} and ${optionValue}`);
      return;
    }
    configuration.setOption(createJDLConfigurationOption(optionName, optionValue));
  });
  return configuration;
}

function createJDLConfigurationOption(name, value) {
  const type = getTypeForOption(name);
  switch (type) {
    case OptionTypes.STRING:
      return new StringJDLApplicationConfigurationOption(name, value, shouldTheValueBeQuoted(name));
    case OptionTypes.INTEGER:
      return new IntegerJDLApplicationConfigurationOption(name, value);
    case OptionTypes.BOOLEAN:
      return new BooleanJDLApplicationConfigurationOption(name, value);
    case OptionTypes.LIST:
      return new ListJDLApplicationConfigurationOption(name, value);
    /* istanbul ignore next */
    default:
      // It should not happen! This is a developer error.
      // If this is the case then an option's type isn't one of the cases
      // If there's a new option type, then you should handle it in the switch.
      // If there's no new option type, then you may have made a mistake.
      throw new Error(`Unrecognized option type: ${type}.`);
  }
}
