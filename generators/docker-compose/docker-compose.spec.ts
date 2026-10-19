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

import { before, describe, expect, it } from 'expect-node';
import { join, resolve } from 'node:path';
import { stripVTControlCharacters } from 'node:util';

import { APPLICATION_TYPE_MICROSERVICE, APPLICATION_TYPE_MONOLITH } from '../../lib/core/application-types.ts';
import monitoringTypes from '../../lib/jhipster/monitoring-types.ts';

import { defaultHelpers as helpers, runResult } from '#testing';

const GENERATOR_DOCKER_COMPOSE = 'docker-compose';

const { PROMETHEUS } = monitoringTypes;

const NO_MONITORING = monitoringTypes.NO;

const expectedFiles = {
  dockercompose: ['docker-compose/docker-compose.yml', 'docker-compose/central-server-config/application.yml'],
  prometheus: [
    'docker-compose/prometheus-conf/alert_rules.yml',
    'docker-compose/prometheus-conf/prometheus.yml',
    'docker-compose/alertmanager-conf/config.yml',
  ],
  monolith: ['docker-compose/docker-compose.yml'],
};

describe('generator - Docker Compose', () => {
  describe('with an application whose docker files are not in the default folder', () => {
    const chosenApps = ['02-mysql'];

    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();
      // The applications are in the in-memory file system the deployment run shares.
      const appFolder = join(runResult.cwd, chosenApps[0]);
      runResult.fs.move(join(appFolder, 'src/main/docker/**'), join(appFolder, 'docker'));

      await helpers
        .runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE)
        .onGenerator(generator => {
          // A blueprint, like the NodeJS one, may keep the docker files of its applications in another folder.
          const { preparingWorkspaces } = generator as any;
          Object.defineProperty(generator, 'preparingWorkspaces', {
            value: {
              ...preparingWorkspaces,
              dockerServicesDir({ applications }: { applications: { dockerServicesDir: string }[] }) {
                for (const application of applications) {
                  application.dockerServicesDir = 'docker/';
                }
              },
            },
          });
        })
        .withAnswers({
          deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
          directoryPath: '../',
          appsFolders: chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        });
    });
    it('reads the docker files of the application from its folder', () => {
      runResult.assertNoFile(`${chosenApps[0]}/src/main/docker/app.yml`);
      runResult.assertFile(`${chosenApps[0]}/docker/app.yml`);
      runResult.assertFileContent('docker-compose/docker-compose.yml', /mysql-mysql:/);
    });
  });

  describe('with a blueprint of the deployment', () => {
    const chosenApps = ['02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      // The cli passes the blueprints of the deployment .yo-rc.json as the blueprints option.
      await helpers
        .runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE)
        .withFakeTestBlueprint('generator-jhipster-deployment-blueprint')
        .withOptions({ blueprints: 'generator-jhipster-deployment-blueprint' })
        .withAnswers({
          deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
          directoryPath: '../',
          appsFolders: chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        });
    });
    it('stores the blueprint in the deployment only', () => {
      runResult.assertJsonFileContent('docker-compose/.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-deployment-blueprint' }] },
      });
      const appConfig = runResult.fs.readJSON(`${runResult.cwd}/${chosenApps[0]}/.yo-rc.json`) as any;
      expect(appConfig['generator-jhipster'].blueprints).toBeUndefined();
    });
  });

  describe('with a global blueprint', () => {
    const chosenApps = ['02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE)
        .withFakeTestBlueprint('generator-jhipster-global-blueprint')
        .withOptions({ globalBlueprints: 'generator-jhipster-global-blueprint' })
        .withAnswers({
          deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
          directoryPath: '../',
          appsFolders: chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        });
    });
    it('stores the blueprint in the deployment and in the applications', () => {
      runResult.assertJsonFileContent('docker-compose/.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-global-blueprint' }] },
      });
      runResult.assertJsonFileContent(`${chosenApps[0]}/.yo-rc.json`, {
        'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-global-blueprint' }] },
      });
    });
  });

  describe('with an application without a Java build tool', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    const messages: string[] = [];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE)
        .onGenerator(generator => {
          const { log } = generator as any;
          const logMessage = log.log.bind(log);
          log.log = (message: unknown, ...args: unknown[]) => {
            messages.push(stripVTControlCharacters(String(message)));
            return logMessage(message, ...args);
          };
          // Each application has the docker:build script.
          for (const app of chosenApps) {
            generator.fs.writeJSON(resolve(generator.destinationRoot(), '..', app, 'package.json'), {
              scripts: { 'docker:build': 'npm run java:docker' },
            });
          }
          // A blueprint backend, like the NodeJS one, has no Java build tool.
          const { preparingWorkspaces } = generator as any;
          Object.defineProperty(generator, 'preparingWorkspaces', {
            value: {
              ...preparingWorkspaces,
              withoutBuildTool({ applications }: { applications: Record<string, unknown>[] }) {
                Object.assign(
                  applications.find(application => application.appFolder === '02-mysql')!,
                  {
                    buildTool: undefined,
                    buildToolMaven: false,
                    buildToolGradle: false,
                  },
                );
              },
            },
          });
        })
        .withAnswers({
          deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
          directoryPath: '../',
          appsFolders: chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        });
    });
    it('suggests the docker:build script of each application', () => {
      const commands = messages.find(message => message.includes('To generate the missing Docker image(s)'))!;
      expect(commands).toMatch(/npm run docker:build in .*01-gateway/);
      expect(commands).toMatch(/npm run docker:build in .*02-mysql/);
      expect(commands).not.toMatch(/mvnw|gradlew/);
    });
  });

  describe('with an application without the docker:build script', () => {
    const chosenApps = ['02-mysql'];
    const messages: string[] = [];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE)
        .onGenerator(generator => {
          const { log } = generator as any;
          const logMessage = log.log.bind(log);
          log.log = (message: unknown, ...args: unknown[]) => {
            messages.push(stripVTControlCharacters(String(message)));
            return logMessage(message, ...args);
          };
          // A blueprint backend, like the NodeJS one, without the docker:build script.
          generator.fs.writeJSON(resolve(generator.destinationRoot(), '..', '02-mysql', 'package.json'), { scripts: {} });
        })
        .withAnswers({
          deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
          directoryPath: '../',
          appsFolders: chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        });
    });
    it('suggests no command for it', () => {
      const commands = messages.find(message => message.includes('To generate the missing Docker image(s)'))!;
      expect(commands).toMatch(/build the Docker image of .*02-mysql, which has no docker:build script/);
      expect(commands).not.toMatch(/npm run docker:build/);
    });
  });

  describe('only gateway', () => {
    const chosenApps = ['01-gateway'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
        monitoring: NO_MONITORING,
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('only one microservice', () => {
    const chosenApps = ['02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
        monitoring: NO_MONITORING,
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('one microservice and a directory path without a trailing slash', () => {
    const chosenApps = ['02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '..',
        appsFolders: chosenApps,
        clusteredDbApps: [],
        monitoring: NO_MONITORING,
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('Correct the directory path by appending a trailing slash', () => {
      runResult.assertFileContent('docker-compose/.yo-rc.json', '"directoryPath": "../"');
    });
  });

  describe('gateway and one microservice, without monitoring', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
        monitoring: NO_MONITORING,
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('gateway generated with skipServer', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withWorkspaceApplicationAtFolder('client-gateway', { applicationType: 'gateway', baseName: 'clientGateway', skipServer: true })
        .withGenerateWorkspaceApplications();
    });
    it('should fail with a message naming the application', async () => {
      await expect(
        helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
          deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
          directoryPath: '../',
          appsFolders: [...chosenApps, 'client-gateway'],
          clusteredDbApps: [],
        }),
      ).rejects.toThrow('Applications generated with skipServer have no docker image to compose: client-gateway');
    });
  });
  describe('gateway and one microservice', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('no prometheus files', () => {
      runResult.assertNoFile(expectedFiles.prometheus);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice, with curator', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('no prometheus files', () => {
      runResult.assertNoFile(expectedFiles.prometheus);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice, with prometheus', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
        monitoring: PROMETHEUS,
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates expected prometheus files', () => {
      runResult.assertFile(expectedFiles.prometheus);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices', () => {
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices, with 1 mongodb cluster', () => {
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE)

        .withAnswers({
          deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
          directoryPath: '../',
          appsFolders: chosenApps,
          clusteredDbApps: ['04-mongo'],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('gateway and 1 microservice, with Cassandra', () => {
    const chosenApps = ['01-gateway', '05-cassandra'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('monolith', () => {
    const chosenApps = ['08-monolith'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MONOLITH,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.monolith);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('monolith and an application of a type of a blueprint', () => {
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspaceApplicationAtFolder('mobile', { baseName: 'mobile', applicationType: 'expo' })
        .withWorkspacesSamples('08-monolith')
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MONOLITH,
        directoryPath: '../',
        appsFolders: ['mobile', '08-monolith'],
        clusteredDbApps: [],
      });
    });
    it('should deploy the monolith only', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /samplemysql:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /mobile/);
    });
  });

  describe('gateway and multi microservices using oauth2', () => {
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '10-couchbase', '07-mariadb'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ authenticationType: 'oauth2' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot({
        'docker-compose/realm-config/jhipster-realm.json': {
          contents: expect.any(String),
          stateCleared: 'modified',
        },
      });
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices, with couchbase', () => {
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '10-couchbase', '07-mariadb'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('gateway and 1 microservice, with 1 couchbase cluster', () => {
    const chosenApps = ['01-gateway', '10-couchbase'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MICROSERVICE,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: ['10-couchbase'],
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose/docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose/docker-compose.yml', /links:/);
    });
  });

  describe('oracle monolith', () => {
    const chosenApps = ['12-oracle'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: APPLICATION_TYPE_MONOLITH,
        directoryPath: '../',
        appsFolders: chosenApps,
        clusteredDbApps: [],
        monitoring: NO_MONITORING,
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.monolith);
    });
  });

  describe('with a config holding only the type and the applications', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();
      await helpers.runJHipsterDeployment(GENERATOR_DOCKER_COMPOSE).withFiles({
        'docker-compose/.yo-rc.json': { 'generator-jhipster': { deploymentType: 'docker-compose', appsFolders: chosenApps } },
      });
    });
    it('should generate with the defaults, without asking', () => {
      expect(runResult.askedQuestions).toEqual([]);
      runResult.assertFile(expectedFiles.dockercompose);
    });
  });
});
