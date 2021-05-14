/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const { MICROSERVICE } = require('../jhipster/application-types');
const { Options } = require('../jhipster/deployment-options');
const Validator = require('./validator');

module.exports = class DeploymentValidator extends Validator {
  constructor() {
    super('deployment', ['deploymentType', 'appsFolders', 'directoryPath']);
  }

  validate(jdlDeployment, options = {}) {
    super.validate(jdlDeployment);
    if (jdlDeployment.deploymentType === Options.deploymentType.dockerCompose) {
      validateDockerComposeRelatedDeployment(jdlDeployment, options);
    }
  }
};

function validateDockerComposeRelatedDeployment(jdlDeployment, options = {}) {
  if (jdlDeployment.gatewayType !== Options.gatewayType.springCloudGateway && options.applicationType === MICROSERVICE) {
    throw new Error('A gateway type must be provided when dealing with microservices and the deployment type is docker-compose.');
  }
}
