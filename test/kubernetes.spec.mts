import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import createMockedConfig from './support/mock-config.mjs';
import { getGenerator } from './support/index.mjs';

const expectedFiles = {
  eurekaregistry: ['./registry-k8s/jhipster-registry.yml', './registry-k8s/application-configmap.yml'],
  consulregistry: ['./registry-k8s/consul.yml', './registry-k8s/consul-config-loader.yml', './registry-k8s/application-configmap.yml'],
  jhgate: ['./jhgate-k8s/jhgate-deployment.yml', './jhgate-k8s/jhgate-mysql.yml', './jhgate-k8s/jhgate-service.yml'],
  jhgateingress: ['./jhgate-k8s/jhgate-ingress.yml'],
  customnamespace: ['./namespace.yml'],
  msmysql: ['./msmysql-k8s/msmysql-deployment.yml', './msmysql-k8s/msmysql-mysql.yml', './msmysql-k8s/msmysql-service.yml'],
  mspsql: [
    './mspsql-k8s/mspsql-deployment.yml',
    './mspsql-k8s/mspsql-postgresql.yml',
    './mspsql-k8s/mspsql-service.yml',
    './mspsql-k8s/mspsql-elasticsearch.yml',
  ],
  msmongodb: ['./msmongodb-k8s/msmongodb-deployment.yml', './msmongodb-k8s/msmongodb-mongodb.yml', './msmongodb-k8s/msmongodb-service.yml'],
  msmariadb: ['./msmariadb-k8s/msmariadb-deployment.yml', './msmariadb-k8s/msmariadb-mariadb.yml', './msmariadb-k8s/msmariadb-service.yml'],
  msmssqldb: ['./msmssqldb-k8s/msmssqldb-deployment.yml', './msmssqldb-k8s/msmssqldb-mssql.yml', './msmssqldb-k8s/msmssqldb-service.yml'],
  monolith: [
    './samplemysql-k8s/samplemysql-deployment.yml',
    './samplemysql-k8s/samplemysql-mysql.yml',
    './samplemysql-k8s/samplemysql-service.yml',
    './samplemysql-k8s/samplemysql-elasticsearch.yml',
  ],
  kafka: [
    './samplekafka-k8s/samplekafka-deployment.yml',
    './samplekafka-k8s/samplekafka-mysql.yml',
    './samplekafka-k8s/samplekafka-service.yml',
    './messagebroker-k8s/kafka.yml',
  ],
  prometheusmonit: [
    './monitoring-k8s/jhipster-prometheus-crd.yml',
    './monitoring-k8s/jhipster-prometheus-cr.yml',
    './monitoring-k8s/jhipster-grafana.yml',
    './monitoring-k8s/jhipster-grafana-dashboard.yml',
  ],
  jhgategateway: ['./jhgate-k8s/jhgate-gateway.yml', './jhgate-k8s/jhgate-destination-rule.yml', './jhgate-k8s/jhgate-virtual-service.yml'],
  applyScript: ['./kubectl-apply.sh'],
};

describe('generator - Kubernetes', () => {
  describe('only gateway', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files and content', () => {
      assert.file(expectedFiles.eurekaregistry);
      assert.fileContent('./registry-k8s/jhipster-registry.yml', /# base64 encoded "meetup"/);
    });
    it('creates expected gateway files and content', () => {
      assert.file(expectedFiles.jhgate);
      assert.fileContent('./jhgate-k8s/jhgate-deployment.yml', /image: jhipsterrepository\/jhgate/);
      assert.fileContent('./jhgate-k8s/jhgate-deployment.yml', /jhipsternamespace.svc.cluster/);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('gateway and mysql microservice', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
    });
    it('creates expected gateway files', () => {
      assert.file(expectedFiles.jhgate);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('mysql microservice with custom namespace', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
        .create(getGenerator('kubernetes'))
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
          kubernetesServiceType: 'Ingress',
          ingressDomain: 'example.com',
          clusteredDbApps: [],
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
    });
    it('creates expected gateway files', () => {
      assert.file(expectedFiles.jhgate);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('MySQL and PostgreSQL microservices without gateway', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
    });
    it("doesn't creates gateway files", () => {
      assert.noFile(expectedFiles.jhgate);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
    });
    it('creates expected psql files', () => {
      assert.file(expectedFiles.mspsql);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('gateway, mysql, psql, mongodb, mariadb, mssql microservices', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
        .doInDir(dir => {
          createMockedConfig('01-gateway', dir);
          createMockedConfig('02-mysql', dir);
          createMockedConfig('03-psql', dir);
          createMockedConfig('04-mongo', dir);
          createMockedConfig('07-mariadb', dir);
          createMockedConfig('11-mssql', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb', '11-mssql'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
    });
    it('creates expected gateway files', () => {
      assert.file(expectedFiles.jhgate);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
    });
    it('creates expected psql files', () => {
      assert.file(expectedFiles.mspsql);
    });
    it('creates expected mongodb files', () => {
      assert.file(expectedFiles.msmongodb);
    });
    it('creates expected mariadb files', () => {
      assert.file(expectedFiles.msmariadb);
    });
    it('creates expected mssql files', () => {
      assert.file(expectedFiles.msmssqldb);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('monolith application', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('Kafka application', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
      assert.file(expectedFiles.kafka);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
    });
    it('creates expected prometheus files', () => {
      assert.file(expectedFiles.prometheusmonit);
    });
    it('creates expected namespace file', () => {
      assert.file(expectedFiles.customnamespace);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('gateway with istio routing', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
    });
    it('creates expected service gateway files', () => {
      assert.file(expectedFiles.jhgate);
    });
    it('creates expected routing gateway and istio files', () => {
      assert.file(expectedFiles.jhgategateway);
    });
    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });

  describe('mysql, psql, mongodb, mariadb, mssql microservices with dynamic storage provisioning', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('kubernetes'))
        .doInDir(dir => {
          createMockedConfig('01-gateway', dir);
          createMockedConfig('02-mysql', dir);
          createMockedConfig('03-psql', dir);
          createMockedConfig('04-mongo', dir);
          createMockedConfig('07-mariadb', dir);
          createMockedConfig('11-mssql', dir);
        })
        .withOptions({ skipChecks: true, reproducibleTests: true })
        .withPrompts({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb', '11-mssql'],
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.eurekaregistry);
    });
    it('creates expected gateway files', () => {
      assert.file(expectedFiles.jhgate);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
      assert.fileContent(expectedFiles.msmysql[1], /PersistentVolumeClaim/);
      assert.fileContent(expectedFiles.msmysql[1], /claimName:/);
    });

    it('creates expected psql files', () => {
      assert.file(expectedFiles.mspsql);
      assert.fileContent(expectedFiles.mspsql[1], /PersistentVolumeClaim/);
      assert.fileContent(expectedFiles.mspsql[1], /claimName:/);
    });
    it('creates expected mongodb files', () => {
      assert.file(expectedFiles.msmongodb);
      assert.fileContent(expectedFiles.msmongodb[1], /volumeClaimTemplates:/);
    });
    it('creates expected mariadb files', () => {
      assert.file(expectedFiles.msmariadb);
      assert.fileContent(expectedFiles.msmariadb[1], /PersistentVolumeClaim/);
      assert.fileContent(expectedFiles.msmariadb[1], /claimName:/);
    });
    it('creates expected mssql files', () => {
      assert.file(expectedFiles.msmssqldb);
      assert.fileContent(expectedFiles.msmssqldb[1], /PersistentVolumeClaim/);
      assert.fileContent(expectedFiles.msmssqldb[1], /claimName:/);
    });

    it('create the apply script', () => {
      assert.file(expectedFiles.applyScript);
    });
  });
});
