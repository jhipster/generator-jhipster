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
import { defaults } from 'lodash-es';
import { applicationOptions, deploymentOptions } from '../../../lib/jhipster/index.js';
import { loadDerivedPlatformConfig, loadDerivedServerAndPlatformProperties, loadPlatformConfig } from '../../server/support/index.js';
import type { GeneratorBaseCore } from '../../index.js';

const { OptionNames } = applicationOptions;
const { Options: DeploymentOptions } = deploymentOptions;

const { JWT_SECRET_KEY } = OptionNames;

export function loadDeploymentConfig(
  this: GeneratorBaseCore,
  {
    config = defaults({}, this.jhipsterConfig, DeploymentOptions.defaults(this.jhipsterConfig.deploymentType)),
    deployment = this,
  }: { config?: any; deployment?: any } = {},
) {
  deployment.appsFolders = config.appsFolders;
  deployment.directoryPath = config.directoryPath;
  deployment.clusteredDbApps = config.clusteredDbApps;
  deployment.dockerRepositoryName = config.dockerRepositoryName;
  deployment.dockerPushCommand = config.dockerPushCommand;
  deployment.adminPassword = config.adminPassword;
  deployment.jwtSecretKey = config[JWT_SECRET_KEY];
  loadPlatformConfig({ config, application: deployment });
  loadDerivedPlatformConfig({ application: deployment });
  loadDerivedServerAndPlatformProperties({ application: deployment });
}
