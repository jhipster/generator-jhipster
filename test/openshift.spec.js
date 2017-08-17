/* global describe, beforeEach, it */


const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    sccconfig: [
        './ocp/registry/scc-config.yml'
    ],
    elk: [
        './ocp/monitoring/jhipster-monitoring.yml'
    ],
    eurekaregistry: [
        './ocp/registry/jhipster-registry.yml',
        './ocp/registry/application-configmap.yml'
    ],
    consulregistry: [
        './ocp/registry/consul.yml',
        './ocp/registry/application-configmap.yml'
    ],
    applcgw: [
        './ocp/jhgate/jhgate-deployment.yml',
        './ocp/jhgate/jhgate-mysql.yml'
    ],
    msmysql: [
        './ocp/msmysql/msmysql-deployment.yml',
        './ocp/msmysql/msmysql-mysql.yml'
    ],
    mspsql: [
        './ocp/mspsql/mspsql-deployment.yml',
        './ocp/mspsql/mspsql-postgresql.yml',
        './ocp/mspsql/mspsql-elasticsearch.yml'
    ],
    msmongodb: [
        './ocp/msmongodb/msmongodb-deployment.yml',
        './ocp/msmongodb/msmongodb-mongodb.yml',
    ],
    mscassandra: [
        './ocp/mscassandra/mscassandra-deployment.yml',
        './ocp/mscassandra/mscassandra-cassandra.yml',
    ],
    msmariadb: [
        './ocp/msmariadb/msmariadb-deployment.yml',
        './ocp/msmariadb/msmariadb-mariadb.yml'
    ],
    monolith: [
        './ocp/samplemysql/samplemysql-deployment.yml',
        './ocp/samplemysql/samplemysql-mysql.yml',
        './ocp/samplemysql/samplemysql-elasticsearch.yml'
    ]
};

describe('JHipster OpenShift Sub Generator', () => {
    describe('only gateway', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/openshift'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway'
                    ],
                    adminPassword: 'openshiftpaas',
                    dockerRepositoryName: 'ocrepo',
                    dockerPushCommand: 'docker push',
                    openshiftNamespace: 'default',
                    monitoring: 'no'
                })
                .on('end', done);
        });
        it('creates expected registry files and content', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.fileContent('./ocp/registry/jhipster-registry.yml', /# base64 encoded "openshiftpaas"/);
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
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/openshift'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway',
                        '02-mysql'
                    ],
                    dockerRepositoryName: 'ocrepo',
                    dockerPushCommand: 'docker push',
                    openshiftNamespace: 'default',
                    monitoring: 'no'
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
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

    describe('gateway and one microservice with mysql and elk', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/openshift'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway',
                        '02-mysql'
                    ],
                    dockerRepositoryName: 'ocrepo',
                    dockerPushCommand: 'docker push',
                    openshiftNamespace: 'default',
                    monitoring: 'elk'
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected scc files', () => {
            assert.file(expectedFiles.sccconfig);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.applcgw);
        });
        it('creates expected msmysql files', () => {
            assert.file(expectedFiles.msmysql);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
    });

    describe('two microservices backed by mysql and postgres without gateway', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/openshift'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '02-mysql',
                        '03-psql'
                    ],
                    dockerRepositoryName: 'ocrepo',
                    dockerPushCommand: 'docker push',
                    openshiftNamespace: 'default',
                    monitoring: 'no'
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected scc files', () => {
            assert.file(expectedFiles.sccconfig);
        });
        it('doesn\'t creates gateway files', () => {
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
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/openshift'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway',
                        '02-mysql',
                        '03-psql',
                        '04-mongo',
                        '05-cassandra',
                        '07-mariadb'
                    ],
                    dockerRepositoryName: 'ocrepo',
                    dockerPushCommand: 'docker push',
                    openshiftNamespace: 'default'
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
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
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/openshift'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: [
                        '08-monolith'
                    ],
                    dockerRepositoryName: 'ocrepo',
                    dockerPushCommand: 'docker push',
                    openshiftNamespace: 'default'
                })
                .on('end', done);
        });
        it('creates expected monolith files', () => {
            assert.file(expectedFiles.monolith);
        });
        it('creates expected scc files', () => {
            assert.file(expectedFiles.sccconfig);
        });
    });

    describe('monolith application with elk', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/openshift'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    composeApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: [
                        '08-monolith'
                    ],
                    dockerRepositoryName: 'ocrepo',
                    dockerPushCommand: 'docker push',
                    openshiftNamespace: 'default',
                    monitoring: 'elk'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.monolith);
        });
        it('creates expected scc files', () => {
            assert.file(expectedFiles.sccconfig);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
    });
});
