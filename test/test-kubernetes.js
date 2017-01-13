/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

const expectedFiles = {
    eurekaregistry: [
        'registry/jhipster-registry.yml',
        'registry/application-configmap.yml'
    ],
    consulregistry: [
        'registry/consul.yml',
        'registry/consul-config-loader.yml',
        'registry/application-configmap.yml'
    ],
    jhgate : [
        'jhgate/jhgate-deployment.yml',
        'jhgate/jhgate-mysql.yml',
        'jhgate/jhgate-service.yml'
    ],
    msmysql : [
        'msmysql/msmysql-deployment.yml',
        'msmysql/msmysql-mysql.yml',
        'msmysql/msmysql-service.yml'
    ],
    mspsql : [
        'mspsql/mspsql-deployment.yml',
        'mspsql/mspsql-postgresql.yml',
        'mspsql/mspsql-service.yml',
        'mspsql/mspsql-elasticsearch.yml'
    ],
    msmongodb : [
        'msmongodb/msmongodb-deployment.yml',
        'msmongodb/msmongodb-mongodb.yml',
        'msmongodb/msmongodb-service.yml'
    ],
    msmariadb : [
        'msmariadb/msmariadb-deployment.yml',
        'msmariadb/msmariadb-mariadb.yml',
        'msmariadb/msmariadb-service.yml'
    ],
    monolith : [
        'samplemysql/samplemysql-deployment.yml',
        'samplemysql/samplemysql-mysql.yml',
        'samplemysql/samplemysql-service.yml',
        'samplemysql/samplemysql-elasticsearch.yml'
    ],
    kafka : [
        'samplekafka/samplekafka-deployment.yml',
        'samplekafka/samplekafka-mysql.yml',
        'samplekafka/samplekafka-service.yml',
        'samplekafka/samplekafka-kafka.yml'
    ],
};

describe('JHipster Kubernetes Sub Generator', function () {
    describe('only gateway', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway'
                    ],
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'jhipsternamespace'
                })
                .on('end', done);
        });
        it('creates expected registry files and content', function () {
            assert.file(expectedFiles.eurekaregistry);
            assert.fileContent('registry/jhipster-registry.yml', /# base64 encoded "meetup"/);
        });
        it('creates expected gateway files and content', function () {
            assert.file(expectedFiles.jhgate);
            assert.fileContent('jhgate/jhgate-deployment.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('jhgate/jhgate-deployment.yml', /jhipsternamespace.svc.cluster/);
        });
    });

    describe('gateway and mysql microservice', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway',
                        '02-mysql'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default'
                })
                .on('end', done);
        });
        it('creates expected registry files', function () {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected gateway files', function () {
            assert.file(expectedFiles.jhgate);
        });
        it('creates expected mysql files', function () {
            assert.file(expectedFiles.msmysql);
        });
    });

    describe('mysql and psql microservices without gateway', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '02-mysql',
                        '03-psql'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default'
                })
                .on('end', done);
        });
        it('creates expected registry files', function () {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('doesn\'t creates gateway files', function () {
            assert.noFile(expectedFiles.jhgate);
        });
        it('creates expected mysql files', function () {
            assert.file(expectedFiles.msmysql);
        });
        it('creates expected psql files', function () {
            assert.file(expectedFiles.mspsql);
        });
    });

    describe('gateway, mysql, psql, mongodb, mariadb microservices', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway',
                        '02-mysql',
                        '03-psql',
                        '04-mongo',
                        '07-mariadb'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default'
                })
                .on('end', done);
        });
        it('creates expected registry files', function () {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected gateway files', function () {
            assert.file(expectedFiles.jhgate);
        });
        it('creates expected mysql files', function () {
            assert.file(expectedFiles.msmysql);
        });
        it('creates expected psql files', function () {
            assert.file(expectedFiles.mspsql);
        });
        it('creates expected mongodb files', function () {
            assert.file(expectedFiles.msmongodb);
        });
        it('creates expected mariadb files', function () {
            assert.file(expectedFiles.msmariadb);
        });
    });

    describe('monolith application', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    composeApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: [
                        '08-monolith'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default'
                })
                .on('end', done);
        });
        it('doesn\'t creates registry files', function () {
            assert.noFile(expectedFiles.eurekaregistry);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.monolith);
        });
    });

    describe('kafka application', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    composeApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: [
                        '09-kafka'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default'
                })
                .on('end', done);
        });
        it('doesn\'t creates registry files', function () {
            assert.noFile(expectedFiles.eurekaregistry);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.kafka);
        });
    });

});
