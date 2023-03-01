import { jestExpect as expect } from 'mocha-expect-snapshot';

import { basicHelpers as helpers, getGenerator } from '../../test/support/index.mjs';
import { GENERATOR_KUBERNETES_KNATIVE } from '../generator-list.mjs';

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
        const chosenApps = ['01-gateway'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(expectedFiles.consulregistry);
        runResult.assertFileContent('./registry-knative/consul.yml', /a 24 chars base64 encoded string/);
      });
      it('creates expected gateway files and content', () => {
        runResult.assertFile(expectedFiles.jhgate);
        // runResult.assertFileContent('./jhgate-knative/jhgate-service.yml', /image: jhipsterrepository\/jhgate/);
      });
      it('create the apply script', () => {
        runResult.assertFile(expectedFiles.applyScript);
      });
    });

    describe('gateway and mysql microservice', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['01-gateway', '02-mysql'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(expectedFiles.consulregistry);
      });
      it('creates expected gateway files', () => {
        runResult.assertFile(expectedFiles.jhgate);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(expectedFiles.msmysql);
      });
      it('create the apply script', () => {
        runResult.assertFile(expectedFiles.applyScript);
      });
    });

    describe('mysql microservice with custom namespace', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['02-mysql'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(expectedFiles.consulregistry);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(expectedFiles.msmysql);
      });
      it('creates expected namespace file', () => {
        runResult.assertFile(expectedFiles.customnamespace);
      });
      it('create the apply script', () => {
        runResult.assertFile(expectedFiles.applyScript);
      });
    });

    describe('gateway and ingress', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['01-gateway'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(expectedFiles.consulregistry);
      });
      it('creates expected gateway files', () => {
        runResult.assertFile(expectedFiles.jhgate);
      });
      it('create the apply script', () => {
        runResult.assertFile(expectedFiles.applyScript);
      });
    });

    describe('MySQL and PostgreSQL microservices without gateway', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['02-mysql', '03-psql'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(expectedFiles.consulregistry);
      });
      it("doesn't creates gateway files", () => {
        runResult.assertNoFile(expectedFiles.jhgate);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(expectedFiles.msmysql);
      });
      it('creates expected psql files', () => {
        runResult.assertFile(expectedFiles.mspsql);
      });
      it('create the apply script', () => {
        runResult.assertFile(expectedFiles.applyScript);
      });
    });

    describe('gateway, mysql, psql, mongodb, mariadb, mssql microservices', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb', '11-mssql'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(expectedFiles.consulregistry);
      });
      it('creates expected gateway files', () => {
        runResult.assertFile(expectedFiles.jhgate);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(expectedFiles.msmysql);
      });
      it('creates expected psql files', () => {
        runResult.assertFile(expectedFiles.mspsql);
      });
      it('creates expected mongodb files', () => {
        runResult.assertFile(expectedFiles.msmongodb);
      });
      it('creates expected mariadb files', () => {
        runResult.assertFile(expectedFiles.msmariadb);
      });
      it('creates expected mssql files', () => {
        runResult.assertFile(expectedFiles.msmssqldb);
      });
      it('create the apply script', () => {
        runResult.assertFile(expectedFiles.applyScript);
      });
    });

    describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['02-mysql'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(expectedFiles.consulregistry);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(expectedFiles.msmysql);
      });
      it('creates expected prometheus files', () => {
        runResult.assertFile(expectedFiles.prometheusmonit);
      });
      it('creates expected namespace file', () => {
        runResult.assertFile(expectedFiles.customnamespace);
      });
      it('create the apply script', () => {
        runResult.assertFile(expectedFiles.applyScript);
      });
    });

    describe('gateway with istio routing files', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['01-gateway'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(expectedFiles.consulregistry);
      });
      it('creates expected service gateway files', () => {
        runResult.assertFile(expectedFiles.jhgate);
      });
      it('creates expected routing gateway and istio files', () => {
        runResult.assertFile(expectedFiles.jhgategateway);
      });
      it('create the apply script', () => {
        runResult.assertFile(expectedFiles.applyScript);
      });
    });
  });

  describe('Using Helm generator type', () => {
    describe('only gateway', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['01-gateway'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(helmExpectedFiles.consulregistry);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected gateway files and content', () => {
        runResult.assertFile(helmExpectedFiles.jhgate);
        runResult.assertFileContent('./jhgate-knative/requirements.yml', /name: mysql/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway and mysql microservice', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['01-gateway', '02-mysql'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(helmExpectedFiles.consulregistry);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected gateway files', () => {
        runResult.assertFile(helmExpectedFiles.jhgate);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(helmExpectedFiles.msmysql);
        runResult.assertFileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('mysql microservice with custom namespace', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['02-mysql'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(helmExpectedFiles.consulregistry);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(helmExpectedFiles.msmysql);
        runResult.assertFileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected namespace file', () => {
        runResult.assertFile(helmExpectedFiles.customnamespace);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway and ingress', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['01-gateway'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(helmExpectedFiles.consulregistry);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected gateway files', () => {
        runResult.assertFile(helmExpectedFiles.jhgate);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected ingress files', () => {
        runResult.assertFile(helmExpectedFiles.jhgate);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
        runResult.assertFileContent('./jhgate-knative/requirements.yml', /name: mysql/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('MySQL and PostgreSQL microservices without gateway', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['02-mysql', '03-psql'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(helmExpectedFiles.consulregistry);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it("doesn't creates gateway files", () => {
        runResult.assertNoFile(helmExpectedFiles.jhgate);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(helmExpectedFiles.msmysql);
        runResult.assertFileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected psql files', () => {
        runResult.assertFile(helmExpectedFiles.mspsql);
        runResult.assertFileContent('./mspsql-knative/requirements.yml', /name: postgresql/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway, mysql, psql, mongodb, mariadb microservices', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(helmExpectedFiles.consulregistry);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected gateway files', () => {
        runResult.assertFile(helmExpectedFiles.jhgate);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(helmExpectedFiles.msmysql);
        runResult.assertFileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected psql files', () => {
        runResult.assertFile(helmExpectedFiles.mspsql);
        runResult.assertFileContent('./mspsql-knative/requirements.yml', /name: postgresql/);
      });
      it('creates expected mongodb files', () => {
        runResult.assertFile(helmExpectedFiles.msmongodb);
        runResult.assertFileContent('./msmongodb-knative/requirements.yml', /name: mongodb-replicaset/);
      });
      it('creates expected mariadb files', () => {
        runResult.assertFile(helmExpectedFiles.msmariadb);
        runResult.assertFileContent('./msmariadb-knative/requirements.yml', /name: mariadb/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['02-mysql'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(helmExpectedFiles.consulregistry);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(helmExpectedFiles.msmysql);
        runResult.assertFileContent('./msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected prometheus files', () => {
        runResult.assertFile(helmExpectedFiles.csvcfiles);
        runResult.assertFileContent('./csvc-knative/requirements.yml', /name: prometheus/);
        runResult.assertFileContent('./csvc-knative/requirements.yml', /name: grafana/);
      });
      it('creates expected namespace file', () => {
        runResult.assertFile(helmExpectedFiles.customnamespace);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway with istio routing files', () => {
      let runResult;
      before(async () => {
        const chosenApps = ['01-gateway'];

        runResult = await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        runResult = await runResult
          .create(getGenerator(GENERATOR_KUBERNETES_KNATIVE))
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: './',
            chosenApps,
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
        runResult.assertFile(helmExpectedFiles.consulregistry);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected service gateway files', () => {
        runResult.assertFile(helmExpectedFiles.jhgate);
        runResult.assertFile(helmExpectedFiles.csvcfiles);
      });
      it('creates expected routing gateway and istio files', () => {
        runResult.assertFile(helmExpectedFiles.jhgategateway);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });
  });
});
