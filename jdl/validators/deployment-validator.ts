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

import Validator from './validator.js';
import ApplicationTypes from '../jhipster/application-types.js';
import DatabaseTypes from '../jhipster/database-types.js';
import SearchEngineTypes from '../jhipster/search-engine-types.js';
import DeploymentOptions from '../jhipster/deployment-options.js';

const { MICROSERVICE } = ApplicationTypes;
const { NO } = DatabaseTypes;
const { ELASTICSEARCH } = SearchEngineTypes;
const { Options } = DeploymentOptions;

export default class DeploymentValidator extends Validator {
  constructor() {
    super('deployment', ['deploymentType', 'appsFolders', 'directoryPath']);
  }

  validate(jdlDeployment, options = {}) {
    super.validate(jdlDeployment);

    switch (jdlDeployment.deploymentType) {
      case Options.deploymentType.dockerCompose:
        validateDockerComposeRelatedDeployment(jdlDeployment, options);
        break;
      case Options.deploymentType.kubernetes:
        validateKubernetesRelatedDeployment(jdlDeployment);
        break;
      case Options.deploymentType.openshift:
        validateOpenshiftRelatedDeployment(jdlDeployment, options);
        break;
      default:
        throw new Error(`The deployment type ${jdlDeployment.deploymentType} isn't supported.`);
    }
  }
}

function validateDockerComposeRelatedDeployment(jdlDeployment, options: any = {}) {
  if (jdlDeployment.gatewayType !== Options.gatewayType.springCloudGateway && options.applicationType === MICROSERVICE) {
    throw new Error('A gateway type must be provided when dealing with microservices and the deployment type is docker-compose.');
  }
}

function validateKubernetesRelatedDeployment(jdlDeployment) {
  if (!jdlDeployment.kubernetesServiceType) {
    throw new Error('A kubernetes service type must be provided when dealing with kubernetes-related deployments.');
  }
  if (jdlDeployment.istio && !jdlDeployment.ingressDomain) {
    throw new Error(
      'An ingress domain must be provided when dealing with kubernetes-related deployments, with istio and when the service type is ingress.'
    );
  }
  if (jdlDeployment.kubernetesServiceType === Options.kubernetesServiceType.ingress && !jdlDeployment.ingressType) {
    throw new Error('An ingress type is required when dealing with kubernetes-related deployments and when the service type is ingress.');
  }
}

function validateOpenshiftRelatedDeployment(jdlDeployment, options) {
  if (jdlDeployment.storageType) {
    if (options.prodDatabaseType === NO) {
      throw new Error("Can't have the storageType option set when there is no prodDatabaseType.");
    }

    if (options.searchEngine === ELASTICSEARCH) {
      throw new Error("Can't have the storageType option set when elasticsearch is the search engine.");
    }

    if (jdlDeployment.monitoring === Options.monitoring.prometheus) {
      throw new Error("Can't have the storageType option set when the monitoring is done with prometheus.");
    }
  }
}
