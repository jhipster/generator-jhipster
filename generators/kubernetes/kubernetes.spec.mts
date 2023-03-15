import { jestExpect as expect } from 'mocha-expect-snapshot';

import { basicHelpers as helpers, getGenerator } from '../../test/support/index.mjs';
import { GENERATOR_KUBERNETES } from '../generator-list.mjs';

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
  keycloak: ['./keycloak-k8s/keycloak.yml', './keycloak-k8s/keycloak-configmap.yml', './keycloak-k8s/keycloak-postgresql.yml'],
  certmanager: ['./cert-manager/letsencrypt-staging-ca-secret.yml', './cert-manager/letsencrypt-staging-issuer.yml'],
};

describe('generator - Kubernetes', () => {
  describe('only gateway', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway'];

      runResult = await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
        .withAnswers({
          deploymentApplicationType: 'gateway',
          directoryPath: './',
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
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files and content', () => {
      runResult.assertFile(expectedFiles.consulregistry);
      runResult.assertFileContent('./registry-k8s/consul.yml', /a 24 chars base64 encoded string/);
    });
    it('creates expected gateway files and content', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFileContent('./jhgate-k8s/jhgate-deployment.yml', /image: jhipsterrepository\/jhgate/);
      runResult.assertFileContent('./jhgate-k8s/jhgate-deployment.yml', /jhipsternamespace.svc.cluster/);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('only gateway with eureka', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'eureka' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
        .withAnswers({
          directoryPath: './',
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
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files and content', () => {
      runResult.assertFile(expectedFiles.eurekaregistry);
      runResult.assertFileContent('./registry-k8s/jhipster-registry.yml', /# base64 encoded "meetup"/);
    });
    it('creates expected gateway files and content', () => {
      runResult.assertFile(expectedFiles.jhgate);
      runResult.assertFileContent('./jhgate-k8s/jhgate-deployment.yml', /image: jhipsterrepository\/jhgate/);
      runResult.assertFileContent('./jhgate-k8s/jhgate-deployment.yml', /jhipsternamespace.svc.cluster/);
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
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
    it('creates expected gateway ingress files', () => {
      runResult.assertFile(expectedFiles.jhgateingress);
    });
    it('create the apply script', () => {
      runResult.assertFile(expectedFiles.applyScript);
    });
  });

  describe('gateway and ingressType gke', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ authenticationType: 'oauth2' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
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
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ authenticationType: 'oauth2' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
    let runResult;
    before(async () => {
      const chosenApps = ['02-mysql', '03-psql'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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

  describe('monolith application', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['08-monolith'];

      runResult = await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
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
    let runResult;
    before(async () => {
      const chosenApps = ['09-kafka'];

      runResult = await helpers
        .generateDeploymentWorkspaces()
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
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
    let runResult;
    before(async () => {
      const chosenApps = ['02-mysql'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
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
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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

  describe('mysql, psql, mongodb, mariadb, mssql microservices with dynamic storage provisioning', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb', '11-mssql'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_KUBERNETES))
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
          kubernetesUseDynamicStorage: true,
          kubernetesStorageClassName: '',
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
