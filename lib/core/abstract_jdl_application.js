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

const { OptionNames, OptionValues } = require('./jhipster/new_application_options');
const { COUCHBASE, CASSANDRA, MONGODB, NO } = require('./jhipster/database_types');
const { join } = require('../utils/set_utils');
const { getDefaultConfigForNewApplication } = require('./jhipster/default_application_options');

class AbstractJDLApplication {
  constructor(args) {
    const merged = merge(args);
    this.config = generateConfigObject(merged.config);
    if (this.config[OptionNames.CLIENT_FRAMEWORK] === OptionValues[OptionNames.CLIENT_FRAMEWORK].angular) {
      this.config[OptionNames.CLIENT_FRAMEWORK] = OptionValues[OptionNames.CLIENT_FRAMEWORK].angularX;
    }
    if (!this.config[OptionNames.CLIENT_PACKAGE_MANAGER] && OptionValues[OptionNames.USE_NPM]) {
      this.config[OptionNames.CLIENT_PACKAGE_MANAGER] = OptionValues[OptionNames.CLIENT_PACKAGE_MANAGER].npm;
    }
    if (typeof this.config[OptionNames.DTO_SUFFIX] === 'boolean') {
      this.config[OptionNames.DTO_SUFFIX] = '';
    }
    if (typeof this.config[OptionNames.ENTITY_SUFFIX] === 'boolean') {
      this.config[OptionNames.ENTITY_SUFFIX] = '';
    }
    if ([MONGODB, COUCHBASE, CASSANDRA, NO].includes(this.config[OptionNames.DATABASE_TYPE])) {
      this.config.devDatabaseType = this.config[OptionNames.DATABASE_TYPE];
      this.config.prodDatabaseType = this.config[OptionNames.DATABASE_TYPE];
    }
    if (this.config[OptionNames.REACTIVE]) {
      this.config[OptionNames.CACHE_PROVIDER] = OptionValues[OptionNames.CACHE_PROVIDER].no;
    }
    this.entityNames = new Set(args.entities || []);
  }

  addEntity(jdlEntity) {
    if (!jdlEntity) {
      throw new Error('An entity has to be passed so as to be added to the application.');
    }
    this.entityNames.add(jdlEntity.name);
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
}

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

function merge({ config }) {
  if (config) {
    if (!config[OptionNames.PACKAGE_NAME] && config[OptionNames.PACKAGE_FOLDER]) {
      config[OptionNames.PACKAGE_NAME] = config[OptionNames.PACKAGE_FOLDER].replace(/\//g, '.');
    }
    if (!config[OptionNames.PACKAGE_FOLDER] && config[OptionNames.PACKAGE_NAME]) {
      config[OptionNames.PACKAGE_FOLDER] = config[OptionNames.PACKAGE_NAME].replace(/\./g, '/');
    }
  }
  return {
    config: {
      ...getDefaultConfigForNewApplication(),
      ...config
    }
  };
}

module.exports = AbstractJDLApplication;
