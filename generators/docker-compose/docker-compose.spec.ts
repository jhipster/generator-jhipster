import { before, describe, expect, it } from 'esmocha';
import monitoringTypes from '../../lib/jhipster/monitoring-types.js';
import applicationTypes from '../../lib/jhipster/application-types.js';
import { GENERATOR_DOCKER_COMPOSE } from '../generator-list.js';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';

const { PROMETHEUS } = monitoringTypes;
const { MICROSERVICE, MONOLITH } = applicationTypes;

const NO_MONITORING = monitoringTypes.NO;

const expectedFiles = {
  dockercompose: ['docker-compose.yml', 'central-server-config/application.yml'],
  prometheus: ['prometheus-conf/alert_rules.yml', 'prometheus-conf/prometheus.yml', 'alertmanager-conf/config.yml'],
  monolith: ['docker-compose.yml'],
};

describe('generator - Docker Compose', () => {
  describe('only gateway', () => {
    const chosenApps = ['01-gateway'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('only one microservice', () => {
    const chosenApps = ['02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('one microservice and a directory path without a trailing slash', () => {
    const chosenApps = ['02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: '.',
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
      runResult.assertFileContent('.yo-rc.json', '"directoryPath": "./"');
    });
  });

  describe('gateway and one microservice, without monitoring', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('no prometheus files', () => {
      runResult.assertNoFile(expectedFiles.prometheus);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice, with curator', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('no prometheus files', () => {
      runResult.assertNoFile(expectedFiles.prometheus);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice, with prometheus', () => {
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices', () => {
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices, with 1 mongodb cluster', () => {
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and 1 microservice, with Cassandra', () => {
    const chosenApps = ['01-gateway', '05-cassandra'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('monolith', () => {
    const chosenApps = ['08-monolith'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MONOLITH,
        directoryPath: './',
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
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices using oauth2', () => {
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '10-couchbase', '07-mariadb'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ authenticationType: 'oauth2' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
        appsFolders: chosenApps,
        clusteredDbApps: [],
      });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot({
        'realm-config/jhipster-realm.json': {
          contents: expect.any(String),
          stateCleared: 'modified',
        },
      });
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates consul content', () => {
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices, with couchbase', () => {
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '10-couchbase', '07-mariadb'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and 1 microservice, with 1 couchbase cluster', () => {
    const chosenApps = ['01-gateway', '10-couchbase'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MICROSERVICE,
        directoryPath: './',
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
      runResult.assertFileContent('docker-compose.yml', /SPRING_CLOUD_CONSUL_HOST=consul/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('oracle monolith', () => {
    const chosenApps = ['12-oracle'];
    before(async () => {
      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers.runJHipsterInApplication(GENERATOR_DOCKER_COMPOSE).withAnswers({
        deploymentApplicationType: MONOLITH,
        directoryPath: './',
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
});
