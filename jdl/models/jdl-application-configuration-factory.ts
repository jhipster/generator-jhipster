/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import JDLApplicationDefinition from './jdl-application-definition.js';

const applicationDefinition = new JDLApplicationDefinition();

export default function createApplicationConfigurationFromObject(configurationObject = {}) {
  const configuration = new JDLApplicationConfiguration();
  Object.keys(configurationObject).forEach(optionName => {
    const optionValue = configurationObject[optionName];
    if (!applicationDefinition.doesOptionExist(optionName)) {
      logger.debug(`Unrecognized application option name and value: '${optionName}' and '${optionValue}'.`);
      return;
    }
    configuration.setOption(createApplicationJDLConfigurationOption(optionName, optionValue));
  });
  return configuration;
}

export function createApplicationNamespaceConfigurationFromObject(
  parsedNamespaceConfigs: Record<string, Record<string, any>> = {},
): Array<JDLApplicationConfiguration> {
  return Object.entries(parsedNamespaceConfigs).map(([namespace, parsedConfig]) => {
    const configuration = new JDLApplicationConfiguration(namespace);
    for (const [optionName, optionValue] of Object.entries(parsedConfig)) {
      configuration.setOption(createUnknownJDLConfigurationOption(optionName, optionValue));
    }
    return configuration;
  });
}

function createUnknownJDLConfigurationOption(name, value) {
  let type;
  if (typeof value === 'boolean') {
    type = 'boolean';
  } else if (/^\d+$/.test(value)) {
    value = parseInt(value, 10);
    type = 'integer';
  } else if (Array.isArray(value)) {
    type = 'list';
  } else if (typeof value === 'string') {
    type = 'string';
  } else {
    throw new Error(`Unknown value type for option ${name}`);
  }
  return createJDLConfigurationOption(type, name, value);
}

function createApplicationJDLConfigurationOption(name: string, value: any) {
  const type = applicationDefinition.getTypeForOption(name);
  return createJDLConfigurationOption(type, name, value);
}

function createJDLConfigurationOption(type: string, name: string, value: any) {
  switch (type) {
    case 'string':
      return new StringJDLApplicationConfigurationOption(name, value, applicationDefinition.shouldTheValueBeQuoted(name));
    case 'integer':
      return new IntegerJDLApplicationConfigurationOption(name, value);
    case 'boolean':
      return new BooleanJDLApplicationConfigurationOption(name, value);
    case 'list':
      return new ListJDLApplicationConfigurationOption(name, value);
    case 'quotedList':
      return new ListJDLApplicationConfigurationOption(name, value, true);
    /* istanbul ignore next */
    default:
      // It should not happen! This is a developer error.
      // If this is the case then an option's type isn't one of the cases
      // If there's a new option type, then you should handle it in the switch.
      // If there's no new option type, then you may have made a mistake.
      throw new Error(`Unrecognized option type: ${type}.`);
  }
}
