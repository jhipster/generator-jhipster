import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import createMockedConfig from './support/mock-config.mjs';
import { getGenerator } from './support/index.mjs';

const expectedFiles = {
  csvcfiles: ['./csvc-helm/Chart.yaml', './csvc-helm/requirements.yaml', './csvc-helm/values.yaml', './csvc-helm/templates/_helpers.tpl'],
  eurekaregistry: ['./csvc-helm/templates/jhipster-registry.yml', './csvc-helm/templates/application-configmap.yml'],
  consulregistry: [
    './csvc-helm/templates/consul.yml',
    './csvc-helm/templates/consul-config-loader.yml',
    './csvc-helm/templates/application-configmap.yml',
  ],
  jhgate: [
    './jhgate-helm/templates/jhgate-deployment.yml',
    './jhgate-helm/templates/jhgate-service.yml',
    './jhgate-helm/Chart.yaml',
    './jhgate-helm/requirements.yaml',
    './jhgate-helm/values.yaml',
    './jhgate-helm/templates/_helpers.tpl',
  ],
  jhgateingress: ['./jhgate-helm/templates/jhgate-ingress.yml'],
  customnamespace: ['./namespace.yml'],
  msmysql: [
    './msmysql-helm/Chart.yaml',
    './msmysql-helm/requirements.yaml',
    './msmysql-helm/values.yaml',
    './msmysql-helm/templates/_helpers.tpl',
    './msmysql-helm/templates/msmysql-deployment.yml',
    './msmysql-helm/templates/msmysql-service.yml',
  ],
  mspsql: [
    './mspsql-helm/Chart.yaml',
    './mspsql-helm/requirements.yaml',
    './mspsql-helm/values.yaml',
    './mspsql-helm/templates/_helpers.tpl',
    './mspsql-helm/templates/mspsql-deployment.yml',
    './mspsql-helm/templates/mspsql-service.yml',
  ],
  msmongodb: [
    './msmongodb-helm/Chart.yaml',
    './msmongodb-helm/requirements.yaml',
    './msmongodb-helm/values.yaml',
    './msmongodb-helm/templates/_helpers.tpl',
    './msmongodb-helm/templates/msmongodb-deployment.yml',
    './msmongodb-helm/templates/msmongodb-service.yml',
  ],
  msmariadb: [
    './msmariadb-helm/Chart.yaml',
    './msmariadb-helm/requirements.yaml',
    './msmariadb-helm/values.yaml',
    './msmariadb-helm/templates/_helpers.tpl',
    './msmariadb-helm/templates/msmariadb-deployment.yml',
    './msmariadb-helm/templates/msmariadb-service.yml',
  ],
  monolith: [
    './samplemysql-helm/Chart.yaml',
    './samplemysql-helm/requirements.yaml',
    './samplemysql-helm/values.yaml',
    './samplemysql-helm/templates/_helpers.tpl',
    './samplemysql-helm/templates/samplemysql-deployment.yml',
    './samplemysql-helm/templates/samplemysql-service.yml',
    './samplemysql-helm/templates/samplemysql-elasticsearch.yml',
  ],
  kafka: ['./samplekafka-helm/templates/samplekafka-deployment.yml', './samplekafka-helm/templates/samplekafka-service.yml'],
  jhgategateway: [
    './jhgate-helm/templates/jhgate-gateway.yml',
    './jhgate-helm/templates/jhgate-destination-rule.yml',
    './jhgate-helm/templates/jhgate-virtual-service.yml',
  ],
  applyScript: ['./helm-apply.sh', './helm-upgrade.sh'],
};

describe('generator - Kubernetes Helm', () => {
  describe('only gateway', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('01-gateway', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['01-gateway'],
          adminPassword: 'meetup',
          dockerRepositoryName: 'jhipsterrepository',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'jhipsternamespace',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files and content', () => {
      assert.file(expectedFiles.eurekaregistry);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files and content', () => {
      assert.file(expectedFiles.jhgate);
      assert.fileContent('./jhgate-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('gateway and mysql microservice', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('01-gateway', dir);
          createMockedConfig('02-mysql', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files', () => {
      assert.file(expectedFiles.jhgate);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
      assert.fileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('mysql microservice with custom namespace', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('02-mysql', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['02-mysql'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'mynamespace',
          jhipsterConsole: true,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
      assert.fileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected namespace file', () => {
      assert.file(expectedFiles.customnamespace);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('gateway and ingress', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('01-gateway', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['01-gateway'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          istio: false,
          kubernetesServiceType: 'Ingress',
          ingressType: 'gke',
          ingressDomain: 'example.com',
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files', () => {
      assert.file(expectedFiles.jhgate);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected ingress files', () => {
      assert.file(expectedFiles.jhgate);
      assert.file(expectedFiles.csvcfiles);
      assert.file(expectedFiles.jhgateingress);
      assert.fileContent('./jhgate-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('MySQL and PostgreSQL microservices without gateway', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('02-mysql', dir);
          createMockedConfig('03-psql', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['02-mysql', '03-psql'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
      assert.file(expectedFiles.csvcfiles);
    });
    it("doesn't creates gateway files", () => {
      assert.noFile(expectedFiles.jhgate);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
      assert.fileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected psql files', () => {
      assert.file(expectedFiles.mspsql);
      assert.fileContent('./mspsql-helm/requirements.yaml', /name: postgresql/);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('gateway, mysql, psql, mongodb, mariadb microservices', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('01-gateway', dir);
          createMockedConfig('02-mysql', dir);
          createMockedConfig('03-psql', dir);
          createMockedConfig('04-mongo', dir);
          createMockedConfig('07-mariadb', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
          istio: false,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files', () => {
      assert.file(expectedFiles.jhgate);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
      assert.fileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected psql files', () => {
      assert.file(expectedFiles.mspsql);
      assert.fileContent('./mspsql-helm/requirements.yaml', /name: postgresql/);
    });
    it('creates expected mongodb files', () => {
      assert.file(expectedFiles.msmongodb);
      assert.fileContent('./msmongodb-helm/requirements.yaml', /name: mongodb-replicaset/);
    });
    it('creates expected mariadb files', () => {
      assert.file(expectedFiles.msmariadb);
      assert.fileContent('./msmariadb-helm/requirements.yaml', /name: mariadb/);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('monolith application', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('08-monolith', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'monolith',
          directoryPath: './',
          chosenApps: ['08-monolith'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it("doesn't creates registry files", () => {
      assert.noFile(expectedFiles.eurekaregistry);
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.monolith);
      assert.fileContent('./samplemysql-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('Kafka application', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('09-kafka', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'monolith',
          directoryPath: './',
          chosenApps: ['09-kafka'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      assert.file(expectedFiles.csvcfiles);
      assert.file(expectedFiles.kafka);
      assert.fileContent('./csvc-helm/requirements.yaml', /name: kafka/);
      assert.fileContent('./samplekafka-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('02-mysql', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['02-mysql'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'mynamespace',
          monitoring: 'prometheus',
          kubernetesServiceType: 'LoadBalancer',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
      assert.fileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected prometheus files', () => {
      assert.file(expectedFiles.csvcfiles);
      assert.fileContent('./csvc-helm/requirements.yaml', /name: prometheus/);
      assert.fileContent('./csvc-helm/requirements.yaml', /name: grafana/);
    });
    it('creates expected namespace file', () => {
      assert.file(expectedFiles.customnamespace);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('gateway with istio', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes-helm'))
        .doInDir(dir => {
          createMockedConfig('01-gateway', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['01-gateway'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          ingressDomain: 'example.com',
          clusteredDbApps: [],
          istio: true,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected service gateway files', () => {
      assert.file(expectedFiles.jhgate);
      assert.file(expectedFiles.csvcfiles);
    });
    it('creates expected routing gateway and istio files', () => {
      assert.file(expectedFiles.jhgategateway);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });
});
