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
const Set = require('../utils/objects/set');
const ApplicationErrorCases = require('../exceptions/error_cases').ErrorCases.applications;

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
    this.entityNames = new Set(args.entities);
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
    return this.entityNames.toArray();
  }

  forEachEntityName(passedFunction, thisArg) {
    if (!passedFunction) {
      return;
    }
    this.entityNames.forEach(entityName => {
      passedFunction.call(thisArg, entityName);
    });
  }

  toString() {
    let stringifiedApplication = `application {\n${stringifyConfig(this.config)}\n`;
    if (this.entityNames.size() !== 0) {
      stringifiedApplication = `\n  entities ${this.entityNames.join(', ')}\n`;
    }
    stringifiedApplication += '}';
    return stringifiedApplication;
  }
}

function generateConfigObject(passedConfig) {
  const config = {};
  Object.keys(passedConfig).forEach(option => {
    if (Array.isArray(passedConfig[option]) && (option === 'languages' || option === 'testFrameworks')) {
      config[option] = new Set(passedConfig[option]);
    } else {
      config[option] = passedConfig[option];
    }
  });
  return config;
}

function stringifyConfig(applicationConfig) {
  let config = '  config {';
  Object.keys(applicationConfig).forEach(option => {
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

module.exports = AbstractJDLApplication;
