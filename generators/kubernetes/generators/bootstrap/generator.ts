/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { randomBytes } from 'node:crypto';

import chalk from 'chalk';
import defaults from 'lodash-es/defaults.js';

import { mutateData } from '../../../../lib/utils/index.ts';
import { convertSecretToBase64, createBase64Secret } from '../../../../lib/utils/secret.ts';
import BaseWorkspacesGenerator from '../../../base-workspaces/index.ts';
import { loadDockerDependenciesTask, loadDockerElasticsearchVersion } from '../../../base-workspaces/internal/docker-dependencies.ts';
import { getJdbcUrl, getR2dbcUrl } from '../../../spring-boot/generators/data-relational/support/index.ts';
import { BaseKubernetesGenerator } from '../../generator.ts';
import { helmConstants, kubernetesConstants } from '../../support/constants.ts';

/** Consul accepts a gossip key of 16, 24 or 32 bytes, base64 encoded. */
const validateConsulGossipKey = (key: string) => {
  const isBase64 = key.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(key);
  if (!isBase64 || ![16, 24, 32].includes(Buffer.from(key, 'base64').length)) {
    throw new Error(
      'consulGossipKey must be a base64 encoded key of 16, 24 or 32 bytes. Generate one with `openssl rand -base64 32`, or remove it from .yo-rc.json to get a random one.',
    );
  }
};

export default class KubernetesBootstrapGenerator extends BaseKubernetesGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      this.jhipsterConfig.deploymentType ??= 'kubernetes';
      assert.equal(this.jhipsterConfig.deploymentType, 'kubernetes', 'Deployment type must be kubernetes');

      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('base-workspaces');
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async checkKubernetes() {
        if (this.skipChecks) return;

        // `--client` reports the kubectl version without contacting the current context's cluster.
        const { exitCode, stderr } = await this.spawnCommand('kubectl version --client', { reject: false, stdio: 'pipe' });
        if (exitCode !== 0) {
          this.log.warn(
            'kubectl is not installed on your computer or does not run.\n' +
              'Make sure you have kubectl installed. Read https://kubernetes.io/docs/tasks/tools/\n',
          );
          if (stderr) {
            this.log.debug(stderr);
          }
        }
      },
    });
  }

  get [BaseWorkspacesGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      setWorkspacesRoot() {
        this.setWorkspacesRoot(this.destinationPath(this.jhipsterConfigWithDefaults.directoryPath, { allowOutsideRoot: true }));
      },
    });
  }

  get [BaseWorkspacesGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get configuringWorkspaces() {
    return this.asConfiguringWorkspacesTaskGroup({
      generateSecrets() {
        this.jhipsterConfig.jwtSecretKey ??= createBase64Secret(this.options.reproducibleTests);
        this.jhipsterConfig.dbRandomPassword ??= this.options.reproducibleTests ? 'SECRET-PASSWORD' : randomBytes(30).toString('hex');
        // Only the Consul servers use it, a deployment switched to Consul later gets one then
        if (this.jhipsterConfigWithDefaults.serviceDiscoveryType === 'consul') {
          this.jhipsterConfig.consulGossipKey ??= (
            this.options.reproducibleTests ?
              Buffer.from('SECRET-GOSSIP-KEY'.padEnd(32, '-'))
            : randomBytes(32)).toString('base64');
          validateConsulGossipKey(this.jhipsterConfig.consulGossipKey);
        }
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
      loadDockerDependenciesTask({ deployment }) {
        loadDockerDependenciesTask.call(this, { context: deployment });
        loadDockerElasticsearchVersion.call(this, {
          dockerContainers: deployment.dockerContainers!,
        });
      },
      appsConfigs({ deployment, applications }) {
        // The deployment config is loaded into the context in this priority, read clusteredDbApps from it.
        for (const application of applications) {
          application.dbPeerCount ??= deployment.clusteredDbApps?.includes(application.appFolder!) ? 3 : 1;
        }
        deployment.appConfigs = applications;
        deployment.gatewayNb = applications.filter(app => app.applicationTypeGateway).length;
        deployment.monolithicNb = applications.filter(app => app.applicationTypeMonolith).length;
        deployment.microserviceNb = applications.filter(app => app.applicationTypeMicroservice).length;
        if (!deployment.deploymentApplicationType && deployment.gatewayNb + deployment.microserviceNb > 0) {
          deployment.deploymentApplicationType = 'microservice';
        }

        deployment.portsToBind = deployment.monolithicNb + deployment.gatewayNb;
      },
    });
  }

  get [BaseWorkspacesGenerator.LOADING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.loadingWorkspaces);
  }

  get preparingWorkspaces() {
    return this.asPreparingWorkspacesTaskGroup({
      derivedProperties({ deployment, applications }) {
        deployment.deploymentApplicationTypeMicroservice = deployment.deploymentApplicationType === 'microservice';
        deployment.kubernetesNamespaceDefault = deployment.kubernetesNamespace === 'default';
        deployment.generatorTypeK8s = deployment.generatorType === 'k8s';
        deployment.generatorTypeHelm = deployment.generatorType === 'helm';
        deployment.usesOauth2 = applications.some(appConfig => appConfig.authenticationTypeOauth2);
        deployment.useKafka = applications.some(appConfig => appConfig.messageBroker === 'kafka');
        deployment.usesIngress = deployment.kubernetesServiceType === 'Ingress';
        deployment.useKeycloak = deployment.usesOauth2 && deployment.usesIngress;
        deployment.keycloakRedirectUris = '';
        deployment.keycloakAppSchemes = [...new Set(applications.flatMap(appConfig => appConfig.oauth2AppSchemes ?? []))];
        deployment.entryPort = 8080;
        deployment.adminPassword ??= 'admin';
        deployment.adminPasswordBase64 ??= convertSecretToBase64(deployment.adminPassword);

        applications.forEach(appConfig => {
          if (appConfig.prodDatabaseTypeMysql || appConfig.prodDatabaseTypeMariadb || appConfig.prodDatabaseTypePostgresql) {
            const { prodDatabaseType } = appConfig;
            const hostname = `${appConfig.baseName.toLowerCase()}-${prodDatabaseType}.${deployment.kubernetesNamespace}.svc.cluster.local`;
            const databaseName = appConfig.baseName.toLowerCase();
            mutateData(appConfig, {
              __override__: false,
              kubernetesJdbcUrl: () => getJdbcUrl(prodDatabaseType, { hostname, databaseName }),
              kubernetesDatasourceJdbcUrl: ({ kubernetesJdbcUrl }) =>
                appConfig.prodDatabaseTypePostgresql ?
                  getJdbcUrl(prodDatabaseType, { hostname, databaseName: appConfig.baseName })
                : kubernetesJdbcUrl,
              kubernetesR2dbcUrl: () => getR2dbcUrl(prodDatabaseType, { hostname, databaseName }),
            });
          }
          // Add application configuration
          if (appConfig.applicationType === 'gateway' || appConfig.applicationType === 'monolith') {
            deployment.entryPort = appConfig.composePort!;
            if (deployment.ingressDomain) {
              deployment.keycloakRedirectUris += `"http://${appConfig.baseName.toLowerCase()}.${deployment.kubernetesNamespace}.${deployment.ingressDomain}/*",
            "https://${appConfig.baseName.toLowerCase()}.${deployment.kubernetesNamespace}.${deployment.ingressDomain}/*", `;
            } else {
              deployment.keycloakRedirectUris += `"http://${appConfig.baseName.toLowerCase()}:${appConfig.composePort}/*",
            "https://${appConfig.baseName.toLowerCase()}:${appConfig.composePort}/*", `;
            }

            deployment.keycloakRedirectUris += `"http://localhost:${appConfig.composePort}/*",
            "https://localhost:${appConfig.composePort}/*",`;

            if (appConfig.devServerPort !== undefined) {
              deployment.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPort}/*", `;
            }
            if (appConfig.devServerPortProxy !== undefined) {
              deployment.keycloakRedirectUris += `"http://localhost:${appConfig.devServerPortProxy}/*", `;
            }

            this.debug(chalk.red.bold(`${appConfig.baseName} has redirect URIs ${deployment.keycloakRedirectUris}`));
          }
        });
      },
    });
  }

  get [BaseWorkspacesGenerator.PREPARING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.preparingWorkspaces);
  }
}
