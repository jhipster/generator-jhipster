/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { existsSync } from 'fs';
import chalk from 'chalk';

import { convertSecretToBase64 } from '../../../lib/utils/index.js';
import { applicationTypes, buildToolTypes } from '../../../lib/jhipster/index.js';
import { loadDeploymentConfig } from '../../base-workspaces/internal/index.js';
import type { BaseKubernetesGenerator } from '../../kubernetes/generator.ts';
import type { Deployment, WorkspacesApplication } from '../types.js';

const { MAVEN } = buildToolTypes;
const { MONOLITH, MICROSERVICE } = applicationTypes;

export { checkDocker } from '../../docker/support/index.js';

/**
 * Check Images
 */
export function checkImages(this: BaseKubernetesGenerator, { applications }: { applications: WorkspacesApplication[] }) {
  this.log.log('\nChecking Docker images in applications directories...');

  let imagePath = '';
  let runCommand = '';
  this.hasWarning = false;
  this.warningMessage = 'To generate the missing Docker image(s), please run:\n';
  for (const app of applications) {
    if (app.buildTool === MAVEN) {
      imagePath = this.workspacePath(app.appFolder!, '/target/jib-cache');
      runCommand = `./mvnw -ntp -Pprod verify jib:dockerBuild${process.arch === 'arm64' ? ' -Djib-maven-plugin.architecture=arm64' : ''}`;
    } else {
      imagePath = this.workspacePath(app.appFolder!, '/build/jib-cache');
      runCommand = `./gradlew bootJar -Pprod jibDockerBuild${process.arch === 'arm64' ? ' -PjibArchitecture=arm64' : ''}`;
    }
    if (!existsSync(imagePath)) {
      this.hasWarning = true;
      this.warningMessage += `  ${chalk.cyan(runCommand)} in ${this.workspacePath(app.appFolder!)}\n`;
    }
  }
}

/**
 * Configure Image Names
 */
export function configureImageNames(this: BaseKubernetesGenerator, { applications }: { applications: WorkspacesApplication[] }) {
  for (const app of applications) {
    const originalImageName = app.baseName.toLowerCase();
    const targetImageName = this.dockerRepositoryName ? `${this.dockerRepositoryName}/${originalImageName}` : originalImageName;
    app.targetImageName = targetImageName;
  }
}

export async function loadFromYoRc(this: BaseKubernetesGenerator, { deployment }: { deployment: Deployment }) {
  loadDeploymentConfig.call(this);

  this.useKafka = false;
  this.usePulsar = false;
  this.useMemcached = false;
  this.useRedis = false;

  if (deployment.microserviceNb! > 0 || deployment.gatewayNb! > 0) {
    this.deploymentApplicationType = MICROSERVICE;
  } else {
    this.deploymentApplicationType = MONOLITH;
  }
  if (!this.adminPassword) {
    this.adminPassword = 'admin'; // TODO find a better way to do this
    this.adminPasswordBase64 = convertSecretToBase64(this.adminPassword);
  }
}
