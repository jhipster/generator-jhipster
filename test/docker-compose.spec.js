const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const expect = require('expect');
const monitoringTypes = require('../jdl/jhipster/monitoring-types');
const { MICROSERVICE, MONOLITH } = require('../jdl/jhipster/application-types');
const { PROMETHEUS } = require('../jdl/jhipster/monitoring-types');

const NO_MONITORING = monitoringTypes.NO;

const expectedFiles = {
  dockercompose: ['docker-compose.yml', 'central-server-config/application.yml'],
  prometheus: ['prometheus-conf/alert_rules.yml', 'prometheus-conf/prometheus.yml', 'alertmanager-conf/config.yml'],
  monolith: ['docker-compose.yml'],
};

describe('JHipster Docker Compose Sub Generator', () => {
  describe('only gateway', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway'],
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('only one microservice', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['02-mysql'],
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('one microservice and a directory path without a trailing slash', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: '.',
          chosenApps: ['02-mysql'],
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('Correct the directory path by appending a trailing slash', () => {
      assert.fileContent('.yo-rc.json', '"directoryPath": "./"');
    });
  });

  describe('gateway and one microservice', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql'],
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql'],
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('no prometheus files', () => {
      assert.noFile(expectedFiles.prometheus);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice, with curator', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql'],
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('no prometheus files', () => {
      assert.noFile(expectedFiles.prometheus);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql'],
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('no prometheus files', () => {
      assert.noFile(expectedFiles.prometheus);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and one microservice, with prometheus', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql'],
          clusteredDbApps: [],
          monitoring: PROMETHEUS,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates expected prometheus files', () => {
      assert.file(expectedFiles.prometheus);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
          fse.copySync(path.join(__dirname, './templates/compose/03-psql'), path.join(dir, './03-psql'));
          fse.copySync(path.join(__dirname, './templates/compose/04-mongo'), path.join(dir, './04-mongo'));
          fse.copySync(path.join(__dirname, './templates/compose/07-mariadb'), path.join(dir, './07-mariadb'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'],
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices, with 1 mongodb cluster', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
          fse.copySync(path.join(__dirname, './templates/compose/03-psql'), path.join(dir, './03-psql'));
          fse.copySync(path.join(__dirname, './templates/compose/04-mongo'), path.join(dir, './04-mongo'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo'],
          clusteredDbApps: ['04-mongo'],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and 1 microservice, with Cassandra cluster', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/05-cassandra'), path.join(dir, './05-cassandra'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '05-cassandra'],
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('monolith', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/08-monolith'), path.join(dir, './08-monolith'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MONOLITH,
          directoryPath: './',
          chosenApps: ['08-monolith'],
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.monolith);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and multi microservices, with couchbase', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/02-mysql'), path.join(dir, './02-mysql'));
          fse.copySync(path.join(__dirname, './templates/compose/03-psql'), path.join(dir, './03-psql'));
          fse.copySync(path.join(__dirname, './templates/compose/10-couchbase'), path.join(dir, './10-couchbase'));
          fse.copySync(path.join(__dirname, './templates/compose/07-mariadb'), path.join(dir, './07-mariadb'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql', '03-psql', '10-couchbase', '07-mariadb'],
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('gateway and 1 microservice, with 1 couchbase cluster', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/01-gateway'), path.join(dir, './01-gateway'));
          fse.copySync(path.join(__dirname, './templates/compose/10-couchbase'), path.join(dir, './10-couchbase'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MICROSERVICE,
          directoryPath: './',
          chosenApps: ['01-gateway', '10-couchbase'],
          clusteredDbApps: ['10-couchbase'],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.dockercompose);
    });
    it('creates jhipster-registry content', () => {
      assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
    });
    it('creates compose file without container_name, external_links, links', () => {
      assert.noFileContent('docker-compose.yml', /container_name:/);
      assert.noFileContent('docker-compose.yml', /external_links:/);
      assert.noFileContent('docker-compose.yml', /links:/);
    });
  });

  describe('oracle monolith', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/docker-compose'))
        .doInDir(dir => {
          fse.copySync(path.join(__dirname, './templates/compose/12-oracle'), path.join(dir, './12-oracle'));
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: MONOLITH,
          directoryPath: './',
          chosenApps: ['12-oracle'],
          clusteredDbApps: [],
          monitoring: NO_MONITORING,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.monolith);
    });
  });
});
