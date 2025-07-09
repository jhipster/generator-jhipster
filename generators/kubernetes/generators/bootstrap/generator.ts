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
import assert from 'node:assert';
import { randomBytes } from 'crypto';
import { defaults } from 'lodash-es';
import BaseWorkspacesGenerator from '../../../base-workspaces/index.js';
import { BaseKubernetesGenerator } from '../../generator.ts';
import { helmConstants, kubernetesConstants } from '../../support/constants.ts';
import { loadDockerDependenciesTask } from '../../../base-workspaces/internal/docker-dependencies.ts';
import { checkDocker } from '../../../docker/support/index.ts';
import { createBase64Secret } from '../../../../lib/utils/secret.ts';

export default class KubernetesBootstrapGenerator extends BaseKubernetesGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      this.jhipsterConfig.deploymentType ??= 'kubernetes';
      assert.equal(this.jhipsterConfig.deploymentType, 'kubernetes', 'Deployment type must be kubernetes');

      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.composeWithJHipster('jhipster:bootstrap-workspaces');
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async checkKubernetes() {
        if (this.skipChecks) return;

        try {
          await this.spawnCommand('kubectl version');
        } catch {
          this.log.warn(
            'kubectl 1.2 or later is not installed on your computer.\n' +
              'Make sure you have Kubernetes installed. Read https://kubernetes.io/docs/setup/\n',
          );
        }
      },
      checkDocker,
    });
  }

  get [BaseWorkspacesGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      setWorkspacesRoot() {
        this.setWorkspacesRoot(this.destinationPath(this.jhipsterConfig.directoryPath));
      },
    });
  }

  get [BaseWorkspacesGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get configuringWorkspaces() {
    return this.asConfiguringWorkspacesTaskGroup({
      prepareApplication({ deployment, applications }) {
        for (const application of applications) {
          application.dbPeerCount ??= deployment.clusteredDbApps?.includes(application.appFolder!) ? 3 : 1;
        }
      },
      generateSecrets() {
        this.jhipsterConfig.jwtSecretKey ??= createBase64Secret(this.options.reproducibleTests);
        this.jhipsterConfig.dbRandomPassword ??= this.options.reproducibleTests ? 'SECRET-PASSWORD' : randomBytes(30).toString('hex');
      },
    });
  }

  get [BaseWorkspacesGenerator.CONFIGURING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.configuringWorkspaces);
  }

  get loadingWorkspaces() {
    return this.asLoadingWorkspacesTaskGroup({
      loadConstants({ deployment }) {
        defaults(deployment, kubernetesConstants, helmConstants);
      },
      async loadDockerDependenciesTask({ deployment }) {
        await loadDockerDependenciesTask.call(this, { context: deployment });
      },
      appsConfigs({ deployment, applications }) {
        deployment.appConfigs = applications;
        deployment.gatewayNb = applications.filter(app => app.applicationTypeGateway).length;
        deployment.monolithicNb = applications.filter(app => app.applicationTypeMonolith).length;
        deployment.microserviceNb = applications.filter(app => app.applicationTypeMicroservice).length;

        deployment.portsToBind = deployment.monolithicNb + deployment.gatewayNb;
      },
    });
  }

  get [BaseWorkspacesGenerator.LOADING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.loadingWorkspaces);
  }
}
