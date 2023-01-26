import { jestExpect as expect } from 'mocha-expect-snapshot';

import monitoringTypes from '../../jdl/jhipster/monitoring-types.js';
import applicationTypes from '../../jdl/jhipster/application-types.js';
import { deploymentTestSamples } from '../../test/support/mock-config.mjs';
import { getGenerator } from '../../test/support/index.mjs';
import { skipPrettierHelpers as helpers } from '../../test/support/helpers.mjs';

const { PROMETHEUS } = monitoringTypes;
const { MICROSERVICE, MONOLITH } = applicationTypes;

const NO_MONITORING = monitoringTypes.NO;

const mockedComposedGenerators = ['jhipster:common', 'jhipster:client', 'jhipster:languages', 'jhipster:cypress'];

const expectedFiles = {
  dockercompose: ['docker-compose.yml', 'central-server-config/application.yml'],
  prometheus: ['prometheus-conf/alert_rules.yml', 'prometheus-conf/prometheus.yml', 'alertmanager-conf/config.yml'],
  monolith: ['docker-compose.yml'],
};

const getTestApplicationWithEntitiesWithConfig = (additionalConfig, ...appNames) =>
  Object.fromEntries(
    Object.entries(deploymentTestSamples)
      .filter(([appName]) => appNames.includes(appName))
      .map(([appName, config]) => [appName, { config: { ...config, ...additionalConfig } }])
  );

const getTestApplicationWithEntities = (...appNames) => getTestApplicationWithEntitiesWithConfig({}, ...appNames);

const workspacesOptions = {
  skipChecks: true,
  reproducibleTests: true,
  generateApplications: true,
  generateWorkspaces: true,
  generateWith: 'docker',
  skipPriorities: ['prompting'],
};

describe('generator - Docker Compose', () => {
  describe('only gateway', () => {
    let runResult;
    const chosenApps = ['01-gateway'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('only one microservice', () => {
    let runResult;
    const chosenApps = ['02-mysql'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('one microservice and a directory path without a trailing slash', () => {
    let runResult;
    const chosenApps = ['02-mysql'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: '.',
          chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
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
    let runResult;
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice', () => {
    let runResult;
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
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
    let runResult;
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
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
    let runResult;
    const chosenApps = ['01-gateway', '02-mysql'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
          monitoring: PROMETHEUS,
        })
        .run();
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
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices', () => {
    let runResult;
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices, with 1 mongodb cluster', () => {
    let runResult;
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: ['04-mongo'],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and 1 microservice, with Cassandra', () => {
    let runResult;
    const chosenApps = ['01-gateway', '05-cassandra'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      // runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('monolith', () => {
    let runResult;
    const chosenApps = ['08-monolith'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MONOLITH,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
        })
        .run();
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
    let runResult;
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '10-couchbase', '07-mariadb'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntitiesWithConfig({ authenticationType: 'oauth2' }, ...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
        })
        .run();
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
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices, with couchbase', () => {
    let runResult;
    const chosenApps = ['01-gateway', '02-mysql', '03-psql', '10-couchbase', '07-mariadb'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and 1 microservice, with 1 couchbase cluster', () => {
    let runResult;
    const chosenApps = ['01-gateway', '10-couchbase'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: ['10-couchbase'],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      runResult.assertFileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      runResult.assertNoFileContent('docker-compose.yml', /container_name:/);
      runResult.assertNoFileContent('docker-compose.yml', /external_links:/);
      runResult.assertNoFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('oracle monolith', () => {
    let runResult;
    const chosenApps = ['12-oracle'];
    before(async () => {
      runResult = await helpers
        .create(getGenerator('workspaces'))
        .withMockedGenerators(mockedComposedGenerators)
        .withOptions({
          ...workspacesOptions,
          importState: {
            exportedApplicationsWithEntities: getTestApplicationWithEntities(...chosenApps),
          },
        })
        .run();

      runResult = await runResult
        .create(getGenerator('docker-compose'))
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MONOLITH,
          directoryPath: './',
          chosenApps,
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.monolith);
    });
  });
});
