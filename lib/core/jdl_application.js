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

const { join } = require('../utils/set_utils');

module.exports = class JDLApplication {
  constructor({ config = {}, entityNames = [] } = {}) {
    this.config = generateConfigObject(config);
    this.entityNames = new Set(entityNames);
  }

  addEntityName(entityName) {
    if (!entityName) {
      throw new Error('An entity name has to be passed so as to be added to the application.');
    }
    this.entityNames.add(entityName);
  }

  getEntityNames() {
    return this.entityNames;
  }

  setEntityNames(entityNames = []) {
    this.entityNames = new Set([...this.entityNames, ...entityNames]);
  }

  forEachEntityName(passedFunction) {
    if (!passedFunction) {
      return;
    }
    this.entityNames.forEach(entityName => {
      passedFunction(entityName);
    });
  }

  toString() {
    const exportableConfiguration = sanitizeConfigurationForStringifying(this.config);
    let stringifiedApplication = `application {\n${stringifyConfig(exportableConfiguration)}\n`;
    if (this.entityNames.size !== 0) {
      stringifiedApplication += `\n  entities ${join(this.entityNames, ', ')}\n`;
    }
    stringifiedApplication += '}';
    return stringifiedApplication;
  }
};

function generateConfigObject(passedConfig) {
  const config = {};
  Object.keys(passedConfig).forEach(option => {
    const value = passedConfig[option];
    if (Array.isArray(value) && ['languages', 'testFrameworks', 'otherModules'].includes(option)) {
      config[option] = new Set(value);
    } else {
      config[option] = value;
    }
  });
  return config;
}

function sanitizeConfigurationForStringifying(applicationConfiguration) {
  const optionsThatShouldNotBeExportedUnlessTheyHaveAValue = new Set([
    'entitySuffix',
    'dtoSuffix',
    'clientThemeVariant'
  ]);
  const optionsThatShouldNotBeExported = new Set(['packageFolder', 'blueprints']);
  const sanitizedConfiguration = {};
  Object.keys(applicationConfiguration).forEach(optionName => {
    const optionValue = applicationConfiguration[optionName];
    const optionShouldBeSkipped =
      optionsThatShouldNotBeExported.has(optionName) ||
      (optionsThatShouldNotBeExportedUnlessTheyHaveAValue.has(optionName) && !optionValue);
    if (optionShouldBeSkipped) {
      return;
    }
    sanitizedConfiguration[optionName] = optionValue;
  });
  return sanitizedConfiguration;
}

function stringifyConfig(applicationConfig) {
  if (Object.keys(applicationConfig).length === 0) {
    return '  config {}';
  }
  let config = '  config {';
  Object.keys(applicationConfig)
    .sort()
    .forEach(option => {
      config = `${config}\n    ${option}${stringifyOptionValue(option, applicationConfig[option])}`;
    });
  return `${config}\n  }`;
}

function stringifyOptionValue(name, value) {
  if (['languages', 'testFrameworks', 'otherModules'].includes(name)) {
    if (value.size === 0) {
      return ' []';
    }
    return ` [${join(value, ', ')}]`;
  }
  const optionsToQuoteIfNeedBe = new Set(['jhipsterVersion', 'jwtSecretKey', 'rememberMeKey']);
  if (optionsToQuoteIfNeedBe.has(name) && !value.startsWith('"')) {
    value = `"${value}"`;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return ` ${value}`;
}
