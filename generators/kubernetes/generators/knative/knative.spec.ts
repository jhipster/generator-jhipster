import { before, describe, expect, it } from 'esmocha';

import { defaultHelpers as helpers, runResult } from '../../../../lib/testing/index.ts';

const GENERATOR_KUBERNETES_KNATIVE = 'kubernetes:knative';

const expectedFiles = {
  eurekaregistry: ['./knative/registry-knative/jhipster-registry.yml', './knative/registry-knative/application-configmap.yml'],
  consulregistry: [
    './knative/registry-knative/consul.yml',
    './knative/registry-knative/consul-config-loader.yml',
    './knative/registry-knative/application-configmap.yml',
  ],
  jhgate: ['./knative/jhgate-knative/jhgate-mysql.yml', './knative/jhgate-knative/jhgate-service.yml'],
  jhgateingress: ['./knative/jhgate-knative/jhgate-ingress.yml'],
  customnamespace: ['./knative/namespace.yml'],
  msmysql: ['./knative/msmysql-knative/msmysql-service.yml', './knative/msmysql-knative/msmysql-mysql.yml'],
  mspsql: [
    './knative/mspsql-knative/mspsql-service.yml',
    './knative/mspsql-knative/mspsql-postgresql.yml',
    './knative/mspsql-knative/mspsql-service.yml',
    './knative/mspsql-knative/mspsql-elasticsearch.yml',
  ],
  msmongodb: ['./knative/msmongodb-knative/msmongodb-service.yml', './knative/msmongodb-knative/msmongodb-mongodb.yml'],
  msmariadb: ['./knative/msmariadb-knative/msmariadb-service.yml', './knative/msmariadb-knative/msmariadb-mariadb.yml'],
  msmssqldb: ['./knative/msmssqldb-knative/msmssqldb-service.yml', './knative/msmssqldb-knative/msmssqldb-mssql.yml'],
  prometheusmonit: [
    './knative/monitoring-knative/jhipster-prometheus-crd.yml',
    './knative/monitoring-knative/jhipster-prometheus-cr.yml',
    './knative/monitoring-knative/jhipster-grafana.yml',
    './knative/monitoring-knative/jhipster-grafana-dashboard.yml',
  ],
  jhgategateway: [
    './knative/jhgate-knative/jhgate-gateway.yml',
    './knative/jhgate-knative/jhgate-destination-rule.yml',
    './knative/jhgate-knative/jhgate-virtual-service.yml',
  ],
  applyScript: ['./knative/kubectl-knative-apply.sh'],
};

const helmExpectedFiles = {
  csvcfiles: [
    './knative/csvc-knative/Chart.yaml',
    './knative/csvc-knative/requirements.yml',
    './knative/csvc-knative/values.yml',
    './knative/csvc-knative/templates/_helpers.tpl',
  ],
  eurekaregistry: ['./knative/csvc-knative/templates/jhipster-registry.yml', './knative/csvc-knative/templates/application-configmap.yml'],
  consulregistry: [
    './knative/csvc-knative/templates/consul.yml',
    './knative/csvc-knative/templates/consul-config-loader.yml',
    './knative/csvc-knative/templates/application-configmap.yml',
  ],
  jhgate: [
    './knative/jhgate-knative/templates/jhgate-service.yml',
    './knative/jhgate-knative/Chart.yaml',
    './knative/jhgate-knative/requirements.yml',
    './knative/jhgate-knative/values.yml',
    './knative/jhgate-knative/templates/_helpers.tpl',
  ],
  customnamespace: ['./knative/namespace.yml'],
  msmysql: [
    './knative/msmysql-knative/Chart.yaml',
    './knative/msmysql-knative/requirements.yml',
    './knative/msmysql-knative/values.yml',
    './knative/msmysql-knative/templates/_helpers.tpl',
    './knative/msmysql-knative/templates/msmysql-service.yml',
  ],
  mspsql: [
    './knative/mspsql-knative/Chart.yaml',
    './knative/mspsql-knative/requirements.yml',
    './knative/mspsql-knative/values.yml',
    './knative/mspsql-knative/templates/_helpers.tpl',
    './knative/mspsql-knative/templates/mspsql-service.yml',
  ],
  msmongodb: [
    './knative/msmongodb-knative/Chart.yaml',
    './knative/msmongodb-knative/requirements.yml',
    './knative/msmongodb-knative/values.yml',
    './knative/msmongodb-knative/templates/_helpers.tpl',
    './knative/msmongodb-knative/templates/msmongodb-service.yml',
  ],
  msmariadb: [
    './knative/msmariadb-knative/Chart.yaml',
    './knative/msmariadb-knative/requirements.yml',
    './knative/msmariadb-knative/values.yml',
    './knative/msmariadb-knative/templates/_helpers.tpl',
    './knative/msmariadb-knative/templates/msmariadb-service.yml',
    './knative/msmariadb-knative/templates/msmariadb-service.yml',
  ],
  kafka: [
    './knative/samplekafka-knative/templates/samplekafka-service.yml',
    './knative/samplekafka-knative/templates/samplekafka-service.yml',
  ],
  jhgategateway: [
    './knative/jhgate-knative/templates/jhgate-gateway.yml',
    './knative/jhgate-knative/templates/jhgate-destination-rule.yml',
    './knative/jhgate-knative/templates/jhgate-virtual-service.yml',
  ],
  applyScript: ['./knative/helm-knative-apply.sh', './knative/helm-knative-upgrade.sh'],
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
        runResult.assertFileContent('./knative/registry-knative/consul.yml', /a 24 chars base64 encoded string/);
      });
      it('creates expected gateway files and content', () => {
        runResult.assertFile(expectedFiles.jhgate);
        // runResult.assertFileContent('./knative/jhgate-knative/jhgate-service.yml', /image: jhipsterrepository\/jhgate/);
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
        runResult.assertFileContent('./knative/jhgate-knative/requirements.yml', /name: mysql/);
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
        runResult.assertFileContent('./knative/msmysql-knative/requirements.yml', /name: mysql/);
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
        runResult.assertFileContent('./knative/msmysql-knative/requirements.yml', /name: mysql/);
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
        runResult.assertFileContent('./knative/jhgate-knative/requirements.yml', /name: mysql/);
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
        runResult.assertFileContent('./knative/msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected psql files', () => {
        runResult.assertFile(helmExpectedFiles.mspsql);
        runResult.assertFileContent('./knative/mspsql-knative/requirements.yml', /name: postgresql/);
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
        runResult.assertFileContent('./knative/msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected psql files', () => {
        runResult.assertFile(helmExpectedFiles.mspsql);
        runResult.assertFileContent('./knative/mspsql-knative/requirements.yml', /name: postgresql/);
      });
      it('creates expected mongodb files', () => {
        runResult.assertFile(helmExpectedFiles.msmongodb);
        runResult.assertFileContent('./knative/msmongodb-knative/requirements.yml', /name: mongodb-replicaset/);
      });
      it('creates expected mariadb files', () => {
        runResult.assertFile(helmExpectedFiles.msmariadb);
        runResult.assertFileContent('./knative/msmariadb-knative/requirements.yml', /name: mariadb/);
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
        runResult.assertFileContent('./knative/msmysql-knative/requirements.yml', /name: mysql/);
      });
      it('creates expected prometheus files', () => {
        runResult.assertFile(helmExpectedFiles.csvcfiles);
        runResult.assertFileContent('./knative/csvc-knative/requirements.yml', /name: prometheus/);
        runResult.assertFileContent('./knative/csvc-knative/requirements.yml', /name: grafana/);
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
