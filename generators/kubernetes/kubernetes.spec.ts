import { before, describe, expect, it } from 'esmocha';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { GENERATOR_KUBERNETES } from '../generator-list.ts';

const expectedFiles = {
  eurekaregistry: ['./kubernetes/registry-k8s/jhipster-registry.yml', './kubernetes/registry-k8s/application-configmap.yml'],
  consulregistry: [
    './kubernetes/registry-k8s/consul.yml',
    './kubernetes/registry-k8s/consul-config-loader.yml',
    './kubernetes/registry-k8s/application-configmap.yml',
  ],
  jhgate: [
    './kubernetes/jhgate-k8s/jhgate-deployment.yml',
    './kubernetes/jhgate-k8s/jhgate-mysql.yml',
    './kubernetes/jhgate-k8s/jhgate-service.yml',
  ],
  jhgateingress: ['./kubernetes/jhgate-k8s/jhgate-ingress.yml'],
  customnamespace: ['./kubernetes/namespace.yml'],
  msmysql: [
    './kubernetes/msmysql-k8s/msmysql-deployment.yml',
    './kubernetes/msmysql-k8s/msmysql-mysql.yml',
    './kubernetes/msmysql-k8s/msmysql-service.yml',
  ],
  mspsql: [
    './kubernetes/mspsql-k8s/mspsql-deployment.yml',
    './kubernetes/mspsql-k8s/mspsql-postgresql.yml',
    './kubernetes/mspsql-k8s/mspsql-service.yml',
    './kubernetes/mspsql-k8s/mspsql-elasticsearch.yml',
  ],
  msmongodb: [
    './kubernetes/msmongodb-k8s/msmongodb-deployment.yml',
    './kubernetes/msmongodb-k8s/msmongodb-mongodb.yml',
    './kubernetes/msmongodb-k8s/msmongodb-service.yml',
  ],
  msmariadb: [
    './kubernetes/msmariadb-k8s/msmariadb-deployment.yml',
    './kubernetes/msmariadb-k8s/msmariadb-mariadb.yml',
    './kubernetes/msmariadb-k8s/msmariadb-service.yml',
  ],
  msmssqldb: [
    './kubernetes/msmssqldb-k8s/msmssqldb-deployment.yml',
    './kubernetes/msmssqldb-k8s/msmssqldb-mssql.yml',
    './kubernetes/msmssqldb-k8s/msmssqldb-service.yml',
  ],
  monolith: [
    './kubernetes/samplemysql-k8s/samplemysql-deployment.yml',
    './kubernetes/samplemysql-k8s/samplemysql-mysql.yml',
    './kubernetes/samplemysql-k8s/samplemysql-service.yml',
    './kubernetes/samplemysql-k8s/samplemysql-elasticsearch.yml',
  ],
  kafka: [
    './kubernetes/samplekafka-k8s/samplekafka-deployment.yml',
    './kubernetes/samplekafka-k8s/samplekafka-mysql.yml',
    './kubernetes/samplekafka-k8s/samplekafka-service.yml',
    './kubernetes/messagebroker-k8s/kafka.yml',
  ],
  prometheusmonit: [
    './kubernetes/monitoring-k8s/jhipster-prometheus-crd.yml',
    './kubernetes/monitoring-k8s/jhipster-prometheus-cr.yml',
    './kubernetes/monitoring-k8s/jhipster-grafana.yml',
    './kubernetes/monitoring-k8s/jhipster-grafana-dashboard.yml',
  ],
  jhgategateway: [
    './kubernetes/jhgate-k8s/jhgate-gateway.yml',
    './kubernetes/jhgate-k8s/jhgate-destination-rule.yml',
    './kubernetes/jhgate-k8s/jhgate-virtual-service.yml',
  ],
  applyScript: ['./kubernetes/kubectl-apply.sh'],
  keycloak: [
    './kubernetes/keycloak-k8s/keycloak.yml',
    './kubernetes/keycloak-k8s/keycloak-configmap.yml',
    './kubernetes/keycloak-k8s/keycloak-postgresql.yml',
  ],
  certmanager: ['./kubernetes/cert-manager/letsencrypt-staging-ca-secret.yml', './kubernetes/cert-manager/letsencrypt-staging-issuer.yml'],
};

describe('generator - Kubernetes', () => {
  describe('only gateway', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          deploymentApplicationType: 'gateway',
          directoryPath: '../',
          chosenApps,
          adminPassword: 'meetup',
          dockerRepositoryName: 'jhipsterrepository',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'jhipsternamespace',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
    });
    it('creates expected registry files and content', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFileContent('./kubernetes/registry-k8s/consul.yml', /a 24 chars base64 encoded string/);
    });
    it('creates expected gateway files and content', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFileContent('./kubernetes/jhgate-k8s/jhgate-deployment.yml', /image: jhipsterrepository\/jhgate/);
      runResult.assertFileContent('./kubernetes/jhgate-k8s/jhgate-deployment.yml', /jhipsternamespace.svc.cluster/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('only gateway with eureka', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'eureka' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
        .withOptions({
          askAnswered: true,
        })
        .withAnswers({
          directoryPath: '../',
          chosenApps,
          adminPassword: 'meetup',
          dockerRepositoryName: 'jhipsterrepository',
          dockerPushCommand: 'docker push',
          kubernetesNamespace: 'jhipsternamespace',
          jhipsterConsole: false,
          kubernetesServiceType: 'LoadBalancer',
          clusteredDbApps: [],
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
    });
    it('creates expected registry files and content', () => {
      runResult.assertFile(expectedFiles.eurekaregistry);
      runResult.assertFileContent('./kubernetes/registry-k8s/jhipster-registry.yml', /bWVldHVw/);
    });
    it('creates expected gateway files and content', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFileContent('./kubernetes/jhgate-k8s/jhgate-deployment.yml', /image: jhipsterrepository\/jhgate/);
      runResult.assertFileContent('./kubernetes/jhgate-k8s/jhgate-deployment.yml', /jhipsternamespace.svc.cluster/);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
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
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
    });
    it('creates expected gateway ingress files', () => {
      runResult.assertFile(expectedFiles.jhgateingress);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('gateway and ingressType gke', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces({ authenticationType: 'oauth2' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          ingressType: 'gke',
          ingressDomain: 'example.com',
          clusteredDbApps: [],
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
    });
    it('creates expected gateway ingress files', () => {
      runResult.assertFile(expectedFiles.jhgateingress);
    });
    it('create the expected cert-manager files', () => {
      runResult.assertFile(expectedFiles.certmanager);
    });
    it('create the expected keycloak files', () => {
      runResult.assertFile(expectedFiles.keycloak);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('gateway and ingressType nginx', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces({ authenticationType: 'oauth2' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
    });
    it('creates expected gateway ingress files', () => {
      runResult.assertFile(expectedFiles.jhgateingress);
    });
    it('create the expected keycloak files', () => {
      runResult.assertFile(expectedFiles.keycloak);
    });
    it('create the expected cert-manager files', () => {
      runResult.assertNoFile(expectedFiles.certmanager);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
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

  describe('monolith application', () => {
    before(async () => {
      const chosenApps = ['08-monolith'];

      await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
    });
    it("doesn't creates registry files", () => {
      runResult.assertNoFile(expectedFiles.eurekaregistry);
      runResult.assertNoFile(expectedFiles.consulregistry);
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.monolith);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
    });
    it("doesn't creates registry files", () => {
      runResult.assertNoFile(expectedFiles.eurekaregistry);
      runResult.assertNoFile(expectedFiles.consulregistry);
    });
    it('creates expected default files', () => {
      runResult.assertFile(expectedFiles.kafka);
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
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
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

  describe('gateway with istio routing', () => {
    before(async () => {
      const chosenApps = ['01-gateway'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
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

  describe('mysql, psql, mongodb, mariadb, mssql microservices with dynamic storage provisioning', () => {
    before(async () => {
      const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb', '11-mssql'];

      await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      await helpers
        .runJHipsterDeployment(GENERATOR_KUBERNETES)
        .withSpawnMock()
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        });
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('should match spawn calls snapshot', function () {
      expect(runResult.getSpawnArgsUsingDefaultImplementation()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      runResult.assertFile(expectedFiles.consulregistry);
    });
    it('creates expected gateway files', () => {
      runResult.assertFile(expectedFiles.jhgate);
    });
    it('creates expected mysql files', () => {
      runResult.assertFile(expectedFiles.msmysql);
      runResult.assertFileContent(expectedFiles.msmysql[1], /PersistentVolumeClaim/);
      runResult.assertFileContent(expectedFiles.msmysql[1], /claimName:/);
    });

    it('creates expected psql files', () => {
      runResult.assertFile(expectedFiles.mspsql);
      runResult.assertFileContent(expectedFiles.mspsql[1], /PersistentVolumeClaim/);
      runResult.assertFileContent(expectedFiles.mspsql[1], /claimName:/);
    });
    it('creates expected mongodb files', () => {
      runResult.assertFile(expectedFiles.msmongodb);
      runResult.assertFileContent(expectedFiles.msmongodb[1], /volumeClaimTemplates:/);
    });
    it('creates expected mariadb files', () => {
      runResult.assertFile(expectedFiles.msmariadb);
      runResult.assertFileContent(expectedFiles.msmariadb[1], /PersistentVolumeClaim/);
      runResult.assertFileContent(expectedFiles.msmariadb[1], /claimName:/);
    });
    it('creates expected mssql files', () => {
      runResult.assertFile(expectedFiles.msmssqldb);
      runResult.assertFileContent(expectedFiles.msmssqldb[1], /PersistentVolumeClaim/);
      runResult.assertFileContent(expectedFiles.msmssqldb[1], /claimName:/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });
});
