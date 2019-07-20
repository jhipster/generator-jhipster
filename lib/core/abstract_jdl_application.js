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

const ApplicationOptions = require('./jhipster/application_options');
const mergeObjects = require('../utils/object_utils').merge;
const { COUCHBASE, CASSANDRA, MONGODB, NO } = require('./jhipster/database_types');
const ApplicationErrorCases = require('../exceptions/error_cases').ErrorCases.applications;
const { join } = require('../utils/set_utils');

class AbstractJDLApplication {
  constructor(args) {
    const merged = merge(args);
    this.config = generateConfigObject(merged.config);
    if (!this.config.baseName) {
      this.config.baseName = ApplicationOptions.baseName;
    }
    if (!this.config.buildTool) {
      this.config.buildTool = ApplicationOptions.buildTool.maven;
    }
    if (this.config.skipUserManagement !== true && this.config.skipUserManagement !== false) {
      this.config.skipUserManagement = ApplicationOptions.skipUserManagement;
    }
    if (this.config.clientFramework === ApplicationOptions.clientFramework.angular) {
      this.config.clientFramework = ApplicationOptions.clientFramework.angularX;
    }
    if (!this.config.clientPackageManager && ApplicationOptions.useNpm) {
      this.config.clientPackageManager = ApplicationOptions.clientPackageManager.npm;
    }
    if (typeof this.config.dtoSuffix === 'boolean') {
      this.config.dtoSuffix = '';
    }
    if (typeof this.config.entitySuffix === 'boolean') {
      this.config.entitySuffix = '';
    }
    if ([MONGODB, COUCHBASE, CASSANDRA, NO].includes(this.config.databaseType)) {
      this.config.devDatabaseType = this.config.databaseType;
      this.config.prodDatabaseType = this.config.databaseType;
    }
    if (this.config.reactive) {
      this.config.cacheProvider = 'no';
    }
    this.entityNames = new Set(args.entities);
  }

  addEntity(jdlEntity) {
    if (!jdlEntity) {
      throw new Error('An entity has to be passed so as to be added to the application.');
    }
    this.entityNames.add(jdlEntity.name);
  }

  static checkValidity(application) {
    const errors = [];
    if (!application || !application.config) {
      errors.push(ApplicationErrorCases.NoApplication);
      return errors;
    }
    if (!application.config.baseName) {
      errors.push(ApplicationErrorCases.NoName);
    }
    if (!application.config.authenticationType) {
      errors.push(ApplicationErrorCases.NoAuthenticationType);
    }
    if (!application.config.buildTool) {
      errors.push(ApplicationErrorCases.NoBuildTool);
    }
    if (application.config.enableTranslation && !application.config.nativeLanguage) {
      errors.push(ApplicationErrorCases.NoChosenLanguage);
    }
    return errors;
  }

  static isValid(application) {
    const errors = this.checkValidity(application);
    return errors.length === 0;
  }

  getEntityNames() {
    return this.entityNames;
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
    let stringifiedApplication = `application {\n${stringifyConfig(this.config)}\n`;
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
    if (Array.isArray(value) && (option === 'languages' || option === 'testFrameworks')) {
      config[option] = new Set(value);
    } else {
      config[option] = value;
    }
  });
  return config;
}

function stringifyConfig(applicationConfig) {
  let config = '  config {';
  Object.keys(applicationConfig).forEach(option => {
    config = `${config}\n    ${option}${stringifyOptionValue(option, applicationConfig[option])}`;
  });
  return `${config}\n  }`;
}

function stringifyOptionValue(name, value) {
  if (name === 'languages' || name === 'testFrameworks') {
    if (value.size === 0) {
      return ' []';
    }
    return ` [${join(value, ', ')}]`;
  }
  if (value === null || value === undefined) {
    return '';
  }
  return ` ${value}`;
}

function merge(args) {
  if (args.config) {
    if (!args.config.packageName && args.config.packageFolder) {
      args.config.packageName = args.config.packageFolder.replace(/\//g, '.');
    }
    if (!args.config.packageFolder && args.config.packageName) {
      args.config.packageFolder = args.config.packageName.replace(/\./g, '/');
    }
  }
  return {
    config: mergeObjects(defaults(), args.config)
  };
}

function defaults() {
  return {
    databaseType: ApplicationOptions.databaseType.sql,
    devDatabaseType: ApplicationOptions.devDatabaseType.h2Disk,
    enableHibernateCache: ApplicationOptions.enableHibernateCache,
    enableSwaggerCodegen: ApplicationOptions.enableSwaggerCodegen,
    enableTranslation: ApplicationOptions.enableTranslation,
    jhiPrefix: ApplicationOptions.jhiPrefix,
    languages: ApplicationOptions.languages,
    messageBroker: ApplicationOptions.messageBroker.false,
    nativeLanguage: ApplicationOptions.nativeLanguage,
    packageName: ApplicationOptions.packageName,
    packageFolder: ApplicationOptions.packageFolder,
    prodDatabaseType: ApplicationOptions.prodDatabaseType.mysql,
    searchEngine: ApplicationOptions.searchEngine.false,
    serviceDiscoveryType: false, // default value for this is treated specially based on application type
    skipClient: ApplicationOptions.skipClient,
    skipServer: ApplicationOptions.skipServer,
    testFrameworks: [],
    websocket: ApplicationOptions.websocket.false
  };
}

module.exports = AbstractJDLApplication;
