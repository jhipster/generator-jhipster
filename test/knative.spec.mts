import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import createMockedConfig from './support/mock-config.mjs';
import { getGenerator } from './support/index.mjs';

const expectedFiles = {
  eurekaregistry: ['./registry-knative/jhipster-registry.yml', './registry-knative/application-configmap.yml'],
  consulregistry: [
    './registry-knative/consul.yml',
    './registry-knative/consul-config-loader.yml',
    './registry-knative/application-configmap.yml',
  ],
  jhgate: ['./jhgate-knative/jhgate-mysql.yml', './jhgate-knative/jhgate-service.yml'],
  jhgateingress: ['./jhgate-knative/jhgate-ingress.yml'],
  customnamespace: ['./namespace.yml'],
  msmysql: ['./msmysql-knative/msmysql-service.yml', './msmysql-knative/msmysql-mysql.yml'],
  mspsql: [
    './mspsql-knative/mspsql-service.yml',
    './mspsql-knative/mspsql-postgresql.yml',
    './mspsql-knative/mspsql-service.yml',
    './mspsql-knative/mspsql-elasticsearch.yml',
  ],
  msmongodb: ['./msmongodb-knative/msmongodb-service.yml', './msmongodb-knative/msmongodb-mongodb.yml'],
  msmariadb: ['./msmariadb-knative/msmariadb-service.yml', './msmariadb-knative/msmariadb-mariadb.yml'],
  msmssqldb: ['./msmssqldb-knative/msmssqldb-service.yml', './msmssqldb-knative/msmssqldb-mssql.yml'],
  prometheusmonit: [
    './monitoring-knative/jhipster-prometheus-crd.yml',
    './monitoring-knative/jhipster-prometheus-cr.yml',
    './monitoring-knative/jhipster-grafana.yml',
    './monitoring-knative/jhipster-grafana-dashboard.yml',
  ],
  jhgategateway: [
    './jhgate-knative/jhgate-gateway.yml',
    './jhgate-knative/jhgate-destination-rule.yml',
    './jhgate-knative/jhgate-virtual-service.yml',
  ],
  applyScript: ['./kubectl-knative-apply.sh'],
};

const helmExpectedFiles = {
  csvcfiles: [
    './csvc-knative/Chart.yaml',
    './csvc-knative/requirements.yml',
    './csvc-knative/values.yml',
    './csvc-knative/templates/_helpers.tpl',
  ],
  eurekaregistry: ['./csvc-knative/templates/jhipster-registry.yml', './csvc-knative/templates/application-configmap.yml'],
  consulregistry: [
    './csvc-knative/templates/consul.yml',
    './csvc-knative/templates/consul-config-loader.yml',
    './csvc-knative/templates/application-configmap.yml',
  ],
  jhgate: [
    './jhgate-knative/templates/jhgate-service.yml',
    './jhgate-knative/Chart.yaml',
    './jhgate-knative/requirements.yml',
    './jhgate-knative/values.yml',
    './jhgate-knative/templates/_helpers.tpl',
  ],
  customnamespace: ['./namespace.yml'],
  msmysql: [
    './msmysql-knative/Chart.yaml',
    './msmysql-knative/requirements.yml',
    './msmysql-knative/values.yml',
    './msmysql-knative/templates/_helpers.tpl',
    './msmysql-knative/templates/msmysql-service.yml',
  ],
  mspsql: [
    './mspsql-knative/Chart.yaml',
    './mspsql-knative/requirements.yml',
    './mspsql-knative/values.yml',
    './mspsql-knative/templates/_helpers.tpl',
    './mspsql-knative/templates/mspsql-service.yml',
  ],
  msmongodb: [
    './msmongodb-knative/Chart.yaml',
    './msmongodb-knative/requirements.yml',
    './msmongodb-knative/values.yml',
    './msmongodb-knative/templates/_helpers.tpl',
    './msmongodb-knative/templates/msmongodb-service.yml',
  ],
  msmariadb: [
    './msmariadb-knative/Chart.yaml',
    './msmariadb-knative/requirements.yml',
    './msmariadb-knative/values.yml',
    './msmariadb-knative/templates/_helpers.tpl',
    './msmariadb-knative/templates/msmariadb-service.yml',
    './msmariadb-knative/templates/msmariadb-service.yml',
  ],
  kafka: ['./samplekafka-knative/templates/samplekafka-service.yml', './samplekafka-knative/templates/samplekafka-service.yml'],
  jhgategateway: [
    './jhgate-knative/templates/jhgate-gateway.yml',
    './jhgate-knative/templates/jhgate-destination-rule.yml',
    './jhgate-knative/templates/jhgate-virtual-service.yml',
  ],
  applyScript: ['./helm-knative-apply.sh', './helm-knative-upgrade.sh'],
};

describe('generator - Knative', () => {
  describe('Using K8s generator type', () => {
    describe('only gateway', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files and content', () => {
        assert.file(expectedFiles.eurekaregistry);
        assert.fileContent('./registry-knative/jhipster-registry.yml', /# base64 encoded "meetup"/);
      });
      it('creates expected gateway files and content', () => {
        assert.file(expectedFiles.jhgate);
        // assert.fileContent('./jhgate-knative/jhgate-service.yml', /image: jhipsterrepository\/jhgate/);
      });
      it('create the apply script', () => {
        assert.file(expectedFiles.applyScript);
      });
    });

    describe('gateway and mysql microservice', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
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
          .create(getGenerator('kubernetes-knative'))
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
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
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
          .create(getGenerator('kubernetes-knative'))
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
            generatorType: 'k8s',
            istio: true,
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
          .create(getGenerator('kubernetes-knative'))
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
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
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
          .create(getGenerator('kubernetes-knative'))
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
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
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

    describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            generatorType: 'k8s',
            istio: true,
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

    describe('gateway with istio routing files', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            generatorType: 'k8s',
            istio: true,
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
  });

  describe('Using Helm generator type', () => {
    describe('only gateway', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files and content', () => {
        assert.file(helmExpectedFiles.eurekaregistry);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected gateway files and content', () => {
        assert.file(helmExpectedFiles.jhgate);
        assert.fileContent('./jhgate-knative/requirements.yml', /name: mysql/);
      });
      it('create the apply script', () => {
        assert.file(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway and mysql microservice', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files', () => {
        assert.file(helmExpectedFiles.eurekaregistry);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected gateway files', () => {
        assert.file(helmExpectedFiles.jhgate);
      });
      it('creates expected mysql files', () => {
        assert.file(helmExpectedFiles.msmysql);
        assert.fileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('create the apply script', () => {
        assert.file(helmExpectedFiles.applyScript);
      });
    });

    describe('mysql microservice with custom namespace', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files', () => {
        assert.file(helmExpectedFiles.eurekaregistry);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected mysql files', () => {
        assert.file(helmExpectedFiles.msmysql);
        assert.fileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected namespace file', () => {
        assert.file(helmExpectedFiles.customnamespace);
      });
      it('create the apply script', () => {
        assert.file(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway and ingress', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            ingressType: 'gke',
            ingressDomain: 'example.com',
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files', () => {
        assert.file(helmExpectedFiles.eurekaregistry);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected gateway files', () => {
        assert.file(helmExpectedFiles.jhgate);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected ingress files', () => {
        assert.file(helmExpectedFiles.jhgate);
        assert.file(helmExpectedFiles.csvcfiles);
        assert.fileContent('./jhgate-knative/requirements.yml', /name: mysql/);
      });
      it('create the apply script', () => {
        assert.file(helmExpectedFiles.applyScript);
      });
    });

    describe('MySQL and PostgreSQL microservices without gateway', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files', () => {
        assert.file(helmExpectedFiles.eurekaregistry);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it("doesn't creates gateway files", () => {
        assert.noFile(helmExpectedFiles.jhgate);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected mysql files', () => {
        assert.file(helmExpectedFiles.msmysql);
        assert.fileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected psql files', () => {
        assert.file(helmExpectedFiles.mspsql);
        assert.fileContent('./mspsql-knative/requirements.yml', /name: postgresql/);
      });
      it('create the apply script', () => {
        assert.file(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway, mysql, psql, mongodb, mariadb microservices', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            generatorType: 'helm',
            istio: true,
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files', () => {
        assert.file(helmExpectedFiles.eurekaregistry);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected gateway files', () => {
        assert.file(helmExpectedFiles.jhgate);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected mysql files', () => {
        assert.file(helmExpectedFiles.msmysql);
        assert.fileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected psql files', () => {
        assert.file(helmExpectedFiles.mspsql);
        assert.fileContent('./mspsql-knative/requirements.yml', /name: postgresql/);
      });
      it('creates expected mongodb files', () => {
        assert.file(helmExpectedFiles.msmongodb);
        assert.fileContent('./msmongodb-knative/requirements.yml', /name: mongodb-replicaset/);
      });
      it('creates expected mariadb files', () => {
        assert.file(helmExpectedFiles.msmariadb);
        assert.fileContent('./msmariadb-knative/requirements.yml', /name: mariadb/);
      });
      it('create the apply script', () => {
        assert.file(helmExpectedFiles.applyScript);
      });
    });

    describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            generatorType: 'helm',
            istio: true,
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files', () => {
        assert.file(helmExpectedFiles.eurekaregistry);
      });
      it('creates expected mysql files', () => {
        assert.file(helmExpectedFiles.msmysql);
        assert.fileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected prometheus files', () => {
        assert.file(helmExpectedFiles.csvcfiles);
        assert.fileContent('./csvc-knative/requirements.yml', /name: prometheus/);
        assert.fileContent('./csvc-knative/requirements.yml', /name: grafana/);
      });
      it('creates expected namespace file', () => {
        assert.file(helmExpectedFiles.customnamespace);
      });
      it('create the apply script', () => {
        assert.file(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway with istio routing files', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(getGenerator('kubernetes-knative'))
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
            generatorType: 'helm',
            istio: true,
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files', () => {
        assert.file(helmExpectedFiles.eurekaregistry);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected service gateway files', () => {
        assert.file(helmExpectedFiles.jhgate);
        assert.file(helmExpectedFiles.csvcfiles);
      });
      it('creates expected routing gateway and istio files', () => {
        assert.file(helmExpectedFiles.jhgategateway);
      });
      it('create the apply script', () => {
        assert.file(helmExpectedFiles.applyScript);
      });
    });
  });
});
