import { before, describe, expect, it } from 'esmocha';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';

const GENERATOR_KUBERNETES_KNATIVE = 'kubernetes-knative';

const expectedFiles = {
  eurekaregistry: [
    './kubernetes-knative/registry-knative/jhipster-registry.yml',
    './kubernetes-knative/registry-knative/application-configmap.yml',
  ],
  consulregistry: [
    './kubernetes-knative/registry-knative/consul.yml',
    './kubernetes-knative/registry-knative/consul-config-loader.yml',
    './kubernetes-knative/registry-knative/application-configmap.yml',
  ],
  jhgate: ['./kubernetes-knative/jhgate-knative/jhgate-mysql.yml', './kubernetes-knative/jhgate-knative/jhgate-service.yml'],
  jhgateingress: ['./kubernetes-knative/jhgate-knative/jhgate-ingress.yml'],
  customnamespace: ['./kubernetes-knative/namespace.yml'],
  msmysql: ['./kubernetes-knative/msmysql-knative/msmysql-service.yml', './kubernetes-knative/msmysql-knative/msmysql-mysql.yml'],
  mspsql: [
    './kubernetes-knative/mspsql-knative/mspsql-service.yml',
    './kubernetes-knative/mspsql-knative/mspsql-postgresql.yml',
    './kubernetes-knative/mspsql-knative/mspsql-service.yml',
    './kubernetes-knative/mspsql-knative/mspsql-elasticsearch.yml',
  ],
  msmongodb: [
    './kubernetes-knative/msmongodb-knative/msmongodb-service.yml',
    './kubernetes-knative/msmongodb-knative/msmongodb-mongodb.yml',
  ],
  msmariadb: [
    './kubernetes-knative/msmariadb-knative/msmariadb-service.yml',
    './kubernetes-knative/msmariadb-knative/msmariadb-mariadb.yml',
  ],
  msmssqldb: ['./kubernetes-knative/msmssqldb-knative/msmssqldb-service.yml', './kubernetes-knative/msmssqldb-knative/msmssqldb-mssql.yml'],
  prometheusmonit: [
    './kubernetes-knative/monitoring-knative/jhipster-prometheus-crd.yml',
    './kubernetes-knative/monitoring-knative/jhipster-prometheus-cr.yml',
    './kubernetes-knative/monitoring-knative/jhipster-grafana.yml',
    './kubernetes-knative/monitoring-knative/jhipster-grafana-dashboard.yml',
  ],
  jhgategateway: [
    './kubernetes-knative/jhgate-knative/jhgate-gateway.yml',
    './kubernetes-knative/jhgate-knative/jhgate-destination-rule.yml',
    './kubernetes-knative/jhgate-knative/jhgate-virtual-service.yml',
  ],
  applyScript: ['./kubernetes-knative/kubectl-knative-apply.sh'],
};

const helmExpectedFiles = {
  csvcfiles: [
    './kubernetes-knative/csvc-knative/Chart.yaml',
    './kubernetes-knative/csvc-knative/requirements.yml',
    './kubernetes-knative/csvc-knative/values.yml',
    './kubernetes-knative/csvc-knative/templates/_helpers.tpl',
  ],
  eurekaregistry: [
    './kubernetes-knative/csvc-knative/templates/jhipster-registry.yml',
    './kubernetes-knative/csvc-knative/templates/application-configmap.yml',
  ],
  consulregistry: [
    './kubernetes-knative/csvc-knative/templates/consul.yml',
    './kubernetes-knative/csvc-knative/templates/consul-config-loader.yml',
    './kubernetes-knative/csvc-knative/templates/application-configmap.yml',
  ],
  jhgate: [
    './kubernetes-knative/jhgate-knative/templates/jhgate-service.yml',
    './kubernetes-knative/jhgate-knative/Chart.yaml',
    './kubernetes-knative/jhgate-knative/requirements.yml',
    './kubernetes-knative/jhgate-knative/values.yml',
    './kubernetes-knative/jhgate-knative/templates/_helpers.tpl',
  ],
  customnamespace: ['./kubernetes-knative/namespace.yml'],
  msmysql: [
    './kubernetes-knative/msmysql-knative/Chart.yaml',
    './kubernetes-knative/msmysql-knative/requirements.yml',
    './kubernetes-knative/msmysql-knative/values.yml',
    './kubernetes-knative/msmysql-knative/templates/_helpers.tpl',
    './kubernetes-knative/msmysql-knative/templates/msmysql-service.yml',
  ],
  mspsql: [
    './kubernetes-knative/mspsql-knative/Chart.yaml',
    './kubernetes-knative/mspsql-knative/requirements.yml',
    './kubernetes-knative/mspsql-knative/values.yml',
    './kubernetes-knative/mspsql-knative/templates/_helpers.tpl',
    './kubernetes-knative/mspsql-knative/templates/mspsql-service.yml',
  ],
  msmongodb: [
    './kubernetes-knative/msmongodb-knative/Chart.yaml',
    './kubernetes-knative/msmongodb-knative/requirements.yml',
    './kubernetes-knative/msmongodb-knative/values.yml',
    './kubernetes-knative/msmongodb-knative/templates/_helpers.tpl',
    './kubernetes-knative/msmongodb-knative/templates/msmongodb-service.yml',
  ],
  msmariadb: [
    './kubernetes-knative/msmariadb-knative/Chart.yaml',
    './kubernetes-knative/msmariadb-knative/requirements.yml',
    './kubernetes-knative/msmariadb-knative/values.yml',
    './kubernetes-knative/msmariadb-knative/templates/_helpers.tpl',
    './kubernetes-knative/msmariadb-knative/templates/msmariadb-service.yml',
    './kubernetes-knative/msmariadb-knative/templates/msmariadb-service.yml',
  ],
  kafka: [
    './kubernetes-knative/samplekafka-knative/templates/samplekafka-service.yml',
    './kubernetes-knative/samplekafka-knative/templates/samplekafka-service.yml',
  ],
  jhgategateway: [
    './kubernetes-knative/jhgate-knative/templates/jhgate-gateway.yml',
    './kubernetes-knative/jhgate-knative/templates/jhgate-destination-rule.yml',
    './kubernetes-knative/jhgate-knative/templates/jhgate-virtual-service.yml',
  ],
  applyScript: ['./kubernetes-knative/helm-knative-apply.sh', './kubernetes-knative/helm-knative-upgrade.sh'],
};

describe('generator - Knative', () => {
  describe('Using K8s generator type', () => {
    describe('only gateway', () => {
      before(async () => {
        const chosenApps = ['01-gateway'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            adminPassword: 'meetup',
            dockerRepositoryName: 'jhipsterrepository',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'jhipsternamespace',
            jhipsterConsole: false,
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files and content', () => {
        runResult.assertFile(expectedFiles.consulregistry);
        runResult.assertFileContent('./kubernetes-knative/registry-knative/consul.yml', /a 24 chars base64 encoded string/);
      });
      it('creates expected gateway files and content', () => {
        runResult.assertFile(expectedFiles.jhgate);
        // runResult.assertFileContent('./kubernetes-knative/jhgate-knative/jhgate-service.yml', /image: jhipsterrepository\/jhgate/);
      });
      it('create the apply script', () => {
        runResult.assertFile(expectedFiles.applyScript);
      });
    });

    describe('gateway and mysql microservice', () => {
      before(async () => {
        const chosenApps = ['01-gateway', '02-mysql'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            jhipsterConsole: false,
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
          });
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
      before(async () => {
        const chosenApps = ['02-mysql'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'mynamespace',
            jhipsterConsole: true,
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
          });
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
      before(async () => {
        const chosenApps = ['01-gateway'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            kubernetesServiceType: 'Ingress',
            ingressDomain: 'example.com',
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
          });
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
      before(async () => {
        const chosenApps = ['02-mysql', '03-psql'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            jhipsterConsole: false,
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
          });
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
      before(async () => {
        const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb', '11-mssql'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            jhipsterConsole: false,
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
          });
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
      before(async () => {
        const chosenApps = ['02-mysql'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'mynamespace',
            monitoring: 'prometheus',
            generatorType: 'k8s',
            istio: true,
          });
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
      before(async () => {
        const chosenApps = ['01-gateway'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            ingressDomain: 'example.com',
            clusteredDbApps: [],
            generatorType: 'k8s',
            istio: true,
          });
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
      before(async () => {
        const chosenApps = ['01-gateway'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            adminPassword: 'meetup',
            dockerRepositoryName: 'jhipsterrepository',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'jhipsternamespace',
            jhipsterConsole: false,
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          });
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
        runResult.assertFileContent('./kubernetes-knative/jhgate-knative/requirements.yml', /name: mysql/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway and mysql microservice', () => {
      before(async () => {
        const chosenApps = ['01-gateway', '02-mysql'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            jhipsterConsole: false,
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          });
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
        runResult.assertFileContent('./kubernetes-knative/msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('mysql microservice with custom namespace', () => {
      before(async () => {
        const chosenApps = ['02-mysql'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'mynamespace',
            jhipsterConsole: true,
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          });
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
        runResult.assertFileContent('./kubernetes-knative/msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected namespace file', () => {
        runResult.assertFile(helmExpectedFiles.customnamespace);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway and ingress', () => {
      before(async () => {
        const chosenApps = ['01-gateway'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            ingressType: 'gke',
            ingressDomain: 'example.com',
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          });
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
        runResult.assertFileContent('./kubernetes-knative/jhgate-knative/requirements.yml', /name: mysql/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('MySQL and PostgreSQL microservices without gateway', () => {
      before(async () => {
        const chosenApps = ['02-mysql', '03-psql'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            jhipsterConsole: false,
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          });
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
        runResult.assertFileContent('./kubernetes-knative/msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected psql files', () => {
        runResult.assertFile(helmExpectedFiles.mspsql);
        runResult.assertFileContent('./kubernetes-knative/mspsql-knative/requirements.yml', /name: postgresql/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway, mysql, psql, mongodb, mariadb microservices', () => {
      before(async () => {
        const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            jhipsterConsole: false,
            kubernetesServiceType: 'LoadBalancer',
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          });
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
        runResult.assertFileContent('./kubernetes-knative/msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected psql files', () => {
        runResult.assertFile(helmExpectedFiles.mspsql);
        runResult.assertFileContent('./kubernetes-knative/mspsql-knative/requirements.yml', /name: postgresql/);
      });
      it('creates expected mongodb files', () => {
        runResult.assertFile(helmExpectedFiles.msmongodb);
        runResult.assertFileContent('./kubernetes-knative/msmongodb-knative/requirements.yml', /name: mongodb-replicaset/);
      });
      it('creates expected mariadb files', () => {
        runResult.assertFile(helmExpectedFiles.msmariadb);
        runResult.assertFileContent('./kubernetes-knative/msmariadb-knative/requirements.yml', /name: mariadb/);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
      before(async () => {
        const chosenApps = ['02-mysql'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'mynamespace',
            monitoring: 'prometheus',
            generatorType: 'helm',
            istio: true,
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected registry files', () => {
        runResult.assertFile(helmExpectedFiles.consulregistry);
      });
      it('creates expected mysql files', () => {
        runResult.assertFile(helmExpectedFiles.msmysql);
        runResult.assertFileContent('./kubernetes-knative/msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected prometheus files', () => {
        runResult.assertFile(helmExpectedFiles.csvcfiles);
        runResult.assertFileContent('./kubernetes-knative/csvc-knative/requirements.yml', /name: prometheus/);
        runResult.assertFileContent('./kubernetes-knative/csvc-knative/requirements.yml', /name: grafana/);
      });
      it('creates expected namespace file', () => {
        runResult.assertFile(helmExpectedFiles.customnamespace);
      });
      it('create the apply script', () => {
        runResult.assertFile(helmExpectedFiles.applyScript);
      });
    });

    describe('gateway with istio routing files', () => {
      before(async () => {
        const chosenApps = ['01-gateway'];

        await helpers
          .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
          .withWorkspacesSamples(...chosenApps)
          .withGenerateWorkspaceApplications();

        await helpers
          .runJHipsterDeployment(GENERATOR_KUBERNETES_KNATIVE)
          .withOptions({
            askAnswered: true,
          })
          .withAnswers({
            deploymentApplicationType: 'microservice',
            directoryPath: '../',
            chosenApps,
            dockerRepositoryName: 'jhipster',
            dockerPushCommand: 'docker push',
            kubernetesNamespace: 'default',
            ingressDomain: 'example.com',
            clusteredDbApps: [],
            generatorType: 'helm',
            istio: true,
          });
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
