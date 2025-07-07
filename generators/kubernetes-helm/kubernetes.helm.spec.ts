import { before, describe, expect, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.js';
import { GENERATOR_KUBERNETES_HELM } from '../generator-list.js';

const expectedFiles = {
  csvcfiles: [
    './kubernetes-helm/csvc-helm/Chart.yaml',
    './kubernetes-helm/csvc-helm/requirements.yaml',
    './kubernetes-helm/csvc-helm/values.yaml',
    './kubernetes-helm/csvc-helm/templates/_helpers.tpl',
  ],
  eurekaregistry: [
    './kubernetes-helm/csvc-helm/templates/jhipster-registry.yml',
    './kubernetes-helm/csvc-helm/templates/application-configmap.yml',
  ],
  consulregistry: [
    './kubernetes-helm/csvc-helm/templates/consul.yml',
    './kubernetes-helm/csvc-helm/templates/consul-config-loader.yml',
    './kubernetes-helm/csvc-helm/templates/application-configmap.yml',
  ],
  jhgate: [
    './kubernetes-helm/jhgate-helm/templates/jhgate-deployment.yml',
    './kubernetes-helm/jhgate-helm/templates/jhgate-service.yml',
    './kubernetes-helm/jhgate-helm/Chart.yaml',
    './kubernetes-helm/jhgate-helm/requirements.yaml',
    './kubernetes-helm/jhgate-helm/values.yaml',
    './kubernetes-helm/jhgate-helm/templates/_helpers.tpl',
  ],
  jhgateingress: ['./kubernetes-helm/jhgate-helm/templates/jhgate-ingress.yml'],
  customnamespace: ['./kubernetes-helm/namespace.yml'],
  msmysql: [
    './kubernetes-helm/msmysql-helm/Chart.yaml',
    './kubernetes-helm/msmysql-helm/requirements.yaml',
    './kubernetes-helm/msmysql-helm/values.yaml',
    './kubernetes-helm/msmysql-helm/templates/_helpers.tpl',
    './kubernetes-helm/msmysql-helm/templates/msmysql-deployment.yml',
    './kubernetes-helm/msmysql-helm/templates/msmysql-service.yml',
  ],
  mspsql: [
    './kubernetes-helm/mspsql-helm/Chart.yaml',
    './kubernetes-helm/mspsql-helm/requirements.yaml',
    './kubernetes-helm/mspsql-helm/values.yaml',
    './kubernetes-helm/mspsql-helm/templates/_helpers.tpl',
    './kubernetes-helm/mspsql-helm/templates/mspsql-deployment.yml',
    './kubernetes-helm/mspsql-helm/templates/mspsql-service.yml',
  ],
  msmongodb: [
    './kubernetes-helm/msmongodb-helm/Chart.yaml',
    './kubernetes-helm/msmongodb-helm/requirements.yaml',
    './kubernetes-helm/msmongodb-helm/values.yaml',
    './kubernetes-helm/msmongodb-helm/templates/_helpers.tpl',
    './kubernetes-helm/msmongodb-helm/templates/msmongodb-deployment.yml',
    './kubernetes-helm/msmongodb-helm/templates/msmongodb-service.yml',
  ],
  msmariadb: [
    './kubernetes-helm/msmariadb-helm/Chart.yaml',
    './kubernetes-helm/msmariadb-helm/requirements.yaml',
    './kubernetes-helm/msmariadb-helm/values.yaml',
    './kubernetes-helm/msmariadb-helm/templates/_helpers.tpl',
    './kubernetes-helm/msmariadb-helm/templates/msmariadb-deployment.yml',
    './kubernetes-helm/msmariadb-helm/templates/msmariadb-service.yml',
  ],
  monolith: [
    './kubernetes-helm/samplemysql-helm/Chart.yaml',
    './kubernetes-helm/samplemysql-helm/requirements.yaml',
    './kubernetes-helm/samplemysql-helm/values.yaml',
    './kubernetes-helm/samplemysql-helm/templates/_helpers.tpl',
    './kubernetes-helm/samplemysql-helm/templates/samplemysql-deployment.yml',
    './kubernetes-helm/samplemysql-helm/templates/samplemysql-service.yml',
    './kubernetes-helm/samplemysql-helm/templates/samplemysql-elasticsearch.yml',
  ],
  kafka: [
    './kubernetes-helm/samplekafka-helm/templates/samplekafka-deployment.yml',
    './kubernetes-helm/samplekafka-helm/templates/samplekafka-service.yml',
  ],
  jhgategateway: [
    './kubernetes-helm/jhgate-helm/templates/jhgate-gateway.yml',
    './kubernetes-helm/jhgate-helm/templates/jhgate-destination-rule.yml',
    './kubernetes-helm/jhgate-helm/templates/jhgate-virtual-service.yml',
  ],
  applyScript: ['./kubernetes-helm/helm-apply.sh', './kubernetes-helm/helm-upgrade.sh'],
};

describe('generator - Kubernetes Helm', () => {
  describe('only gateway', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
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
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
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
      runResult.assertFileContent('./kubernetes-helm/jhgate-helm/requirements.yaml', /name: mysql/);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
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
        });
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
      runResult.assertFileContent('./kubernetes-helm/msmysql-helm/requirements.yaml', /name: mysql/);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
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
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
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
      runResult.assertFileContent('./kubernetes-helm/msmysql-helm/requirements.yaml', /name: mysql/);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
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
          istio: false,
          kubernetesServiceType: 'Ingress',
          ingressType: 'gke',
          ingressDomain: 'example.com',
          clusteredDbApps: [],
        });
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
      runResult.assertFileContent('./kubernetes-helm/jhgate-helm/requirements.yaml', /name: mysql/);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
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
        });
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
      runResult.assertFileContent('./kubernetes-helm/msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected psql files', () => {
      runResult.assertFile(expectedFiles.mspsql);
      runResult.assertFileContent('./kubernetes-helm/mspsql-helm/requirements.yaml', /name: postgresql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
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
          istio: false,
        });
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
      runResult.assertFileContent('./kubernetes-helm/msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected psql files', () => {
      runResult.assertFile(expectedFiles.mspsql);
      runResult.assertFileContent('./kubernetes-helm/mspsql-helm/requirements.yaml', /name: postgresql/);
    });
    it('creates expected mongodb files', () => {
      runResult.assertFile(expectedFiles.msmongodb);
      runResult.assertFileContent('./kubernetes-helm/msmongodb-helm/requirements.yaml', /name: mongodb-replicaset/);
    });
    it('creates expected mariadb files', () => {
      runResult.assertFile(expectedFiles.msmariadb);
      runResult.assertFileContent('./kubernetes-helm/msmariadb-helm/requirements.yaml', /name: mariadb/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('monolith application', () => {
    before(async () => {
      const chosenApps = ['08-monolith'];

      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'monolith',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it("doesn't creates registry files", () => {
      runResult.assertNoFile(expectedFiles.consulregistry);
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.monolith);
      runResult.assertFileContent('./kubernetes-helm/samplemysql-helm/requirements.yaml', /name: mysql/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('Kafka application', () => {
    before(async () => {
      const chosenApps = ['09-kafka'];

      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'monolith',
          directoryPath: '../',
          chosenApps,
          dockerRepositoryName: 'jhipster',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'default',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.csvcfiles);
      runResult.assertFile(expectedFiles.kafka);
      runResult.assertFileContent('./kubernetes-helm/csvc-helm/requirements.yaml', /name: kafka/);
      runResult.assertFileContent('./kubernetes-helm/samplekafka-helm/requirements.yaml', /name: mysql/);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
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
          kubernetesServiceType: 'LoadBalancer',
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
      runResult.assertFileContent('./kubernetes-helm/msmysql-helm/requirements.yaml', /name: mysql/);
    });
    it('creates expected prometheus files', () => {
      runResult.assertFile(expectedFiles.csvcfiles);
      runResult.assertFileContent('./kubernetes-helm/csvc-helm/requirements.yaml', /name: prometheus/);
      runResult.assertFileContent('./kubernetes-helm/csvc-helm/requirements.yaml', /name: grafana/);
    });
    it('creates expected namespace file', () => {
      runResult.assertFile(expectedFiles.customnamespace);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('gateway with istio', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES_HELM)
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
          istio: true,
        });
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
