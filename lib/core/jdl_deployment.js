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
const { isEqual } = require('lodash');
const DeploymentOptions = require('./jhipster/deployment_options');
const mergeObjects = require('../utils/object_utils').merge;
const DeploymentErrorCases = require('../exceptions/error_cases').ErrorCases.deployments;
const { join } = require('../utils/set_utils');

const arrayTypes = ['appsFolders', 'clusteredDbApps', 'consoleOptions'];
class JDLDeployment {
  constructor(args) {
    if (!args || !args.deploymentType) {
      throw new Error('The deploymentType is mandatory to create a deployment.');
    }
    const merged = mergeObjects(defaults(args.deploymentType), args);
    Object.entries(merged).forEach(([key, option]) => {
      if (Array.isArray(option) && arrayTypes.includes(key)) {
        this[key] = new Set(option);
      } else if (key === 'serviceDiscoveryType' && option === DeploymentOptions.Options.serviceDiscoveryType.no) {
        this[key] = false;
      } else {
        this[key] = option;
      }
    });
  }

  static checkValidity(deployment) {
    const errors = [];
    if (!deployment) {
      errors.push(DeploymentErrorCases.NoDeployment);
      return errors;
    }
    if (!deployment.deploymentType) {
      errors.push(DeploymentErrorCases.NoDeploymentType);
    }
    if (!deployment.appsFolders) {
      errors.push(DeploymentErrorCases.NoApplications);
    }
    if (!deployment.dockerRepositoryName) {
      errors.push(DeploymentErrorCases.NoRepository);
    }
    return errors;
  }

  static isValid(application) {
    const errors = this.checkValidity(application);
    return errors.length === 0;
  }

  toString() {
    return stringifyConfig(this);
  }
}

function stringifyConfig(applicationConfig) {
  let config = 'deployment {';
  Object.entries(applicationConfig).forEach(([option, value]) => {
    if (!isEqual(defaults(applicationConfig.deploymentType)[option], value) || option === 'deploymentType') {
      config = `${config}\n    ${option}${stringifyOptionValue(option, value)}`;
    }
  });
  return `${config}\n  }`;
}

function stringifyOptionValue(name, value) {
  if (arrayTypes.includes(name)) {
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

function defaults(deploymentType) {
  return DeploymentOptions.Options.defaults(deploymentType);
}

module.exports = JDLDeployment;
