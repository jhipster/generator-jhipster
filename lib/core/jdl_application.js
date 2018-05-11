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

const crypto = require('crypto');
const ApplicationTypes = require('./jhipster/application_types');
const ApplicationOptions = require('./jhipster/application_options');
const mergeObjects = require('../utils/object_utils').merge;
const Set = require('../utils/objects/set');
const ApplicationErrorCases = require('../exceptions/error_cases').ErrorCases.applications;

class JDLApplication {
  constructor(args) {
    const merged = merge(args);
    this.config = generateConfigObject(merged.config);
    this.config = fixApplicationConfig(this.config);
    this.entities = new Set(args.entities);
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
    if (application.config.authenticationType === ApplicationOptions.authenticationType.jwt
        && !application.config.jwtSecretKey) {
      errors.push(ApplicationErrorCases.NoJWTSecret);
    }
    if (application.config.authenticationType === ApplicationOptions.authenticationType.session
        && !application.config.rememberMeKey) {
      errors.push(ApplicationErrorCases.NoRememberMeKey);
    }
    if ((application.config.applicationType === ApplicationTypes.MICROSERVICE
        || application.config.applicationType === ApplicationTypes.UAA) && !application.config.skipClient) {
      errors.push(ApplicationErrorCases.ShouldSkipClient);
    }
    if (!application.config.uaaBaseName && (application.config.applicationType === ApplicationTypes.UAA
        || application.config.applicationType === ApplicationTypes.MICROSERVICE)
      && application.config.authenticationType === ApplicationOptions.authenticationType.uaa) {
      errors.push(ApplicationErrorCases.NoUAAAppFolderPath);
    }
    return errors;
  }

  static isValid(application) {
    const errors = this.checkValidity(application);
    return errors.length === 0;
  }

  toString() {
    return `application {\n${stringifyConfig(this.config)}\n}`;
  }
}

function generateConfigObject(passedConfig) {
  const config = {};
  Object.keys(passedConfig).forEach((option) => {
    if (Array.isArray(passedConfig[option]) && (option === 'languages' || option === 'testFrameworks')) {
      config[option] = new Set(passedConfig[option]);
    } else {
      config[option] = passedConfig[option];
    }
  });
  if (config.authenticationType === 'session') {
    config.rememberMeKey = generateRememberMeKey();
  }
  if (config.authenticationType === 'jwt') {
    config.jwtSecretKey = generateJWTSecretKey();
  }
  return config;
}

function fixApplicationConfig(passedConfig) {
  if (!passedConfig.authenticationType) {
    switch (passedConfig.applicationType) {
    case ApplicationTypes.UAA:
      passedConfig.authenticationType = ApplicationOptions.authenticationType.uaa;
      break;
    default:
      passedConfig.authenticationType = ApplicationOptions.authenticationType.jwt;
    }
  }
  if (!passedConfig.baseName) {
    passedConfig.baseName = ApplicationOptions.baseName;
  }
  if (!passedConfig.buildTool) {
    passedConfig.buildTool = ApplicationOptions.buildTool.maven;
  }
  if (!passedConfig.cacheProvider) {
    switch (passedConfig.applicationType) {
    case ApplicationTypes.MICROSERVICE:
    case ApplicationTypes.UAA:
      passedConfig.cacheProvider = ApplicationOptions.cacheProvider.hazelcast;
      break;
    default:
      passedConfig.cacheProvider = ApplicationOptions.cacheProvider.ehcache;
    }
  }
  if (!passedConfig.clientFramework) {
    passedConfig.clientFramework = ApplicationOptions.clientFramework.angularX;
  }
  if (passedConfig.authenticationType === ApplicationOptions.authenticationType.jwt
    && !passedConfig.jwtSecretKey) {
    passedConfig.jwtSecretKey = generateJWTSecretKey();
  }
  if (passedConfig.enableTranslation && !passedConfig.nativeLanguage) {
    passedConfig.nativeLanguage = ApplicationOptions.nativeLanguage;
  }
  if (passedConfig.authenticationType === ApplicationOptions.authenticationType.session
    && !passedConfig.rememberMeKey) {
    passedConfig.rememberMeKey = generateRememberMeKey();
  }
  if (!passedConfig.serverPort) {
    switch (passedConfig.applicationType) {
    case ApplicationTypes.MICROSERVICE:
      passedConfig.serverPort = '8081';
      break;
    case ApplicationTypes.UAA:
      passedConfig.serverPort = '9999';
      break;
    default:
      passedConfig.serverPort = ApplicationOptions.serverPort;
    }
  }
  if ((passedConfig.applicationType === ApplicationTypes.MICROSERVICE
      || passedConfig.applicationType === ApplicationTypes.UAA) && !passedConfig.skipClient) {
    passedConfig.skipClient = true;
  }
  if ((passedConfig.applicationType === ApplicationTypes.GATEWAY && passedConfig.authenticationType.uaa)
    || passedConfig.authenticationType === ApplicationOptions.authenticationType.oauth2) {
    passedConfig.skipUserManagement = true;
  }
  if (passedConfig.skipUserManagement !== true && passedConfig.skipUserManagement !== false) {
    passedConfig.skipUserManagement = ApplicationOptions.skipUserManagement;
  }
  return passedConfig;
}

function generateJWTSecretKey() {
  return generateRememberMeKey();
}

function generateRememberMeKey() {
  return crypto.randomBytes(20).toString('hex');
}

function stringifyConfig(applicationConfig) {
  let config = '  config {';
  Object.keys(applicationConfig).forEach((option) => {
    config = `${config}\n    ${option}${stringifyOptionValue(option, applicationConfig[option])}`;
  });
  return `${config.replace(/[[\]]/g, '')}\n  }`;
}

function stringifyOptionValue(name, value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (value === null || value === undefined || (name === 'testFrameworks' && value.size() === 0)) {
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
    config: mergeObjects(ApplicationOptions.defaults(), args.config)
  };
}

module.exports = JDLApplication;
