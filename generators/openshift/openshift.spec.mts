import assert from 'yeoman-assert';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { basicHelpers as helpers, getGenerator } from '../../test/support/index.mjs';
import { GENERATOR_OPENSHIFT } from '../generator-list.mjs';

const expectedFiles = {
  sccconfig: ['./ocp/registry/scc-config.yml'],
  eurekaregistry: ['./ocp/registry/jhipster-registry.yml', './ocp/registry/application-configmap.yml'],
  consulregistry: ['./ocp/registry/consul.yml', './ocp/registry/application-configmap.yml'],
  applcgw: ['./ocp/jhgate/jhgate-deployment.yml', './ocp/jhgate/jhgate-mysql.yml'],
  msmysql: ['./ocp/msmysql/msmysql-deployment.yml', './ocp/msmysql/msmysql-mysql.yml'],
  mspsql: ['./ocp/mspsql/mspsql-deployment.yml', './ocp/mspsql/mspsql-postgresql.yml', './ocp/mspsql/mspsql-elasticsearch.yml'],
  msmongodb: ['./ocp/msmongodb/msmongodb-deployment.yml', './ocp/msmongodb/msmongodb-mongodb.yml'],
  mscassandra: ['./ocp/mscassandra/mscassandra-deployment.yml', './ocp/mscassandra/mscassandra-cassandra.yml'],
  msmariadb: ['./ocp/msmariadb/msmariadb-deployment.yml', './ocp/msmariadb/msmariadb-mariadb.yml'],
  monolith: [
    './ocp/samplemysql/samplemysql-deployment.yml',
    './ocp/samplemysql/samplemysql-mysql.yml',
    './ocp/samplemysql/samplemysql-elasticsearch.yml',
  ],
};

describe('generator - OpenShift', () => {
  describe('only gateway', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_OPENSHIFT))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
          adminPassword: 'openshiftpaas',
          dockerRepositoryName: 'ocrepo',
          dockerPushCommand: 'docker push',
          openshiftNamespace: 'default',
          monitoring: 'no',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files and content', () => {
      assert.file(expectedFiles.consulregistry);
      assert.fileContent('./ocp/registry/consul.yml', /a 24 chars base64 encoded string/);
    });
    it('creates expected scc files', () => {
      assert.file(expectedFiles.sccconfig);
    });
    it('creates expected gateway files and content', () => {
      assert.file(expectedFiles.applcgw);
      assert.fileContent('./ocp/jhgate/jhgate-deployment.yml', /image: ocrepo\/jhgate/);
    });
  });

  describe('gateway and one microservice with mysql', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway', '02-mysql'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_OPENSHIFT))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
          dockerRepositoryName: 'ocrepo',
          dockerPushCommand: 'docker push',
          openshiftNamespace: 'default',
          monitoring: 'no',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.consulregistry);
    });
    it('creates expected scc files', () => {
      assert.file(expectedFiles.sccconfig);
    });
    it('creates expected gateway files', () => {
      assert.file(expectedFiles.applcgw);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
    });
  });

  describe('two microservices backed by mysql and postgres without gateway', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['02-mysql', '03-psql'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_OPENSHIFT))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
          dockerRepositoryName: 'ocrepo',
          dockerPushCommand: 'docker push',
          openshiftNamespace: 'default',
          monitoring: 'no',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.consulregistry);
    });
    it('creates expected scc files', () => {
      assert.file(expectedFiles.sccconfig);
    });
    it("doesn't creates gateway files", () => {
      assert.noFile(expectedFiles.applcgw);
    });
    it('creates expected mysql files', () => {
      assert.file(expectedFiles.msmysql);
    });
    it('creates expected psql files', () => {
      assert.file(expectedFiles.mspsql);
    });
  });

  describe('gateway with multiple microservices backed by mysql, postgres, mongo, cassandra and mariadb', () => {
    let runResult;
    before(async () => {
      const chosenApps = ['01-gateway', '02-mysql', '03-psql', '04-mongo', '05-cassandra', '07-mariadb'];

      runResult = await helpers
        .generateDeploymentWorkspaces({ serviceDiscoveryType: 'consul' })
        .withWorkspacesSamples(...chosenApps)
        .withGenerateWorkspaceApplications();

      runResult = await runResult
        .create(getGenerator(GENERATOR_OPENSHIFT))
        .withAnswers({
          deploymentApplicationType: 'microservice',
          directoryPath: './',
          chosenApps,
          dockerRepositoryName: 'ocrepo',
          dockerPushCommand: 'docker push',
          openshiftNamespace: 'default',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected registry files', () => {
      assert.file(expectedFiles.consulregistry);
    });
    it('creates expected scc files', () => {
      assert.file(expectedFiles.sccconfig);
    });
    it('creates expected gateway files', () => {
      assert.file(expectedFiles.applcgw);
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
    it('creates expected cassandra files', () => {
      assert.file(expectedFiles.mscassandra);
    });
    it('creates expected mariadb files', () => {
      assert.file(expectedFiles.msmariadb);
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
        .create(getGenerator(GENERATOR_OPENSHIFT))
        .withAnswers({
          deploymentApplicationType: 'monolith',
          directoryPath: './',
          chosenApps,
          dockerRepositoryName: 'ocrepo',
          dockerPushCommand: 'docker push',
          openshiftNamespace: 'default',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates expected monolith files', () => {
      assert.file(expectedFiles.monolith);
    });
    it('creates expected scc files', () => {
      assert.file(expectedFiles.sccconfig);
    });
  });
});
