import { jestExpect as expect } from 'mocha-expect-snapshot';

import { basicHelpers as helpers, getGenerator } from './support/index.mjs';
import { GENERATOR_KUBERNETES_HELM } from '../generators/generator-list.mjs';

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
      const chosenApps = ['01-gateway'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
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
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files and content', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFileContent('./jhgate-helm/requirements.yaml', /name: mysql/);
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
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
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
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
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
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
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
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
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
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
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
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected ingress files', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
      runResult.assertFile(expectedFiles.jhgateingress);
      runResult.assertFileContent('./jhgate-helm/requirements.yaml', /name: mysql/);
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
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
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
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it("doesn't creates gateway files", () => {
      runResult.assertNoFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected psql files', () => {
      runResult.assertFile(expectedFiles.mspsql);
      runResult.assertFileContent('./mspsql-helm/requirements.yaml', /name: postgresql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
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
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
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
          istio: false,
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected psql files', () => {
      runResult.assertFile(expectedFiles.mspsql);
      runResult.assertFileContent('./mspsql-helm/requirements.yaml', /name: postgresql/);
    });
    it('creates expected mongodb files', () => {
      runResult.assertFile(expectedFiles.msmongodb);
      runResult.assertFileContent('./msmongodb-helm/requirements.yaml', /name: mongodb-replicaset/);
    });
    it('creates expected mariadb files', () => {
      runResult.assertFile(expectedFiles.msmariadb);
      runResult.assertFileContent('./msmariadb-helm/requirements.yaml', /name: mariadb/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('monolith application', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['08-monolith'];

      runResult = await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
        .withAnswers({
          deploymentApplicationType: 'monolith',
          directoryPath: './',
          chosenApps,
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
      runResult.assertNoFile(expectedFiles.consulregistry);
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.monolith);
      runResult.assertFileContent('./samplemysql-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('Kafka application', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['09-kafka'];

      runResult = await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
        .withAnswers({
          deploymentApplicationType: 'monolith',
          directoryPath: './',
          chosenApps,
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
      runResult.assertFile(expectedFiles.csvcfiles);
      runResult.assertFile(expectedFiles.kafka);
      runResult.assertFileContent('./csvc-helm/requirements.yaml', /name: kafka/);
      runResult.assertFileContent('./samplekafka-helm/requirements.yaml', /name: mysql/);
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
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
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
      runResult.assertFile(expectedFiles.consulregistry);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent('./msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected prometheus files', () => {
      runResult.assertFile(expectedFiles.csvcfiles);
      runResult.assertFileContent('./csvc-helm/requirements.yaml', /name: prometheus/);
      runResult.assertFileContent('./csvc-helm/requirements.yaml', /name: grafana/);
    });
    it('creates expected namespace file', () => {
      runResult.assertFile(expectedFiles.customnamespace);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('gateway with istio', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES_HELM))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
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
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected service gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFile(expectedFiles.csvcfiles);
    });
    it('creates expected routing gateway and istio files', () => {
      runResult.assertFile(expectedFiles.jhgategateway);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });
});
