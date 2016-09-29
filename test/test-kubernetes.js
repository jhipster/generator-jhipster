/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

const expectedFiles = {
    registry : [
        'registry/jhipster-registry.yml'
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
        'mspsql/mspsql-service.yml'
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
        'samplemysql/samplemysql-service.yml'
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
                .withPrompts({
                    kubernetesApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
                        '01-gateway'
                    ],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default'
                })
                .on('end', done);
        });
        it('creates expected registry files', function () {
            assert.file(expectedFiles.registry);
        });
        it('creates expected gateway files', function () {
            assert.file(expectedFiles.jhgate);
        });
    });

    describe('gateway and mysql microservice', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/kubernetes'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    kubernetesApplicationType: 'microservice',
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
            assert.file(expectedFiles.registry);
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
                .withPrompts({
                    kubernetesApplicationType: 'microservice',
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
            assert.file(expectedFiles.registry);
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
                .withPrompts({
                    kubernetesApplicationType: 'microservice',
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
            assert.file(expectedFiles.registry);
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
                .withPrompts({
                    kubernetesApplicationType: 'monolith',
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
        it('create expected registry files', function () {
            assert.noFile(expectedFiles.registry);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.monolith);
        });
    });

});
