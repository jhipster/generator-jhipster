/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

const expectedFiles = {
    ranchercompose : [
        'rancher/docker-compose.yml',
        'rancher/rancher-compose.yml'
    ]
};

describe('JHipster Rancher Compose Sub Generator', function () {

    describe('only gateway', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'no',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push'
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/jhgate/);
        });
    });

    describe('only one microservice', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    'chosenApps': [
                        '02-mysql'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'no',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push'
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmysql/);
        });
    });

    describe('gateway and one microservice', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'no',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push'
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmysql/);
        });
    });

    describe('gateway and one microservice, with elk', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'elk',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push'
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmysql/);
        });
    });

    describe('gateway and one microservice, with prometheus', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'prometheus',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push'
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmysql/);
        });
    });

    describe('gateway, uaa server and one microservice, with elk', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({force: true})
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql',
                        '06-uaa'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'elk',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push'
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.noFileContent('rancher/docker-compose.yml', /image: rancher\/load-balancer-service/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmysql/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/uaaserver/);
            //Validate rancher-compose
            assert.noFileContent('rancher/rancher-compose.yml', /lb:/);
            assert.fileContent('rancher/rancher-compose.yml', /jhgate-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /msmysql-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /uaaserver-app:/);
        });
    });

    describe('loadbalancing and multi microservices, with elk', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    'chosenApps': [
                        '02-mysql',
                        '03-psql',
                        '04-mongo',
                        '07-mariadb'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'elk',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push',
                    enableRancherLoadBalancing: true
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.ranchercompose);
            //Validate docker compose file
            assert.noFileContent('rancher/docker-compose.yml', /image: rancher\/load-balancer-service/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmysql/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/mspsql/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmariadb/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmongodb/);
            //Validate rancher-compose
            assert.noFileContent('rancher/rancher-compose.yml', /lb:/);
            assert.fileContent('rancher/rancher-compose.yml', /msmysql-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /mspsql-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /msmariadb-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /msmongodb-app:/);
        });
    });

    describe('loadbalancing, gateway and multi microservices, with 1 mongodb cluster ', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql',
                        '03-psql',
                        '04-mongo'
                    ],
                    clusteredDbApps: [
                        '04-mongo'
                    ],
                    monitoring: 'elk',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push',
                    enableRancherLoadBalancing: true
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.ranchercompose);
            //Validate docker compose file
            assert.fileContent('rancher/docker-compose.yml', /image: rancher\/load-balancer-service/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmysql/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/mspsql/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/msmongodb/);
            //Validate rancher-compose
            assert.fileContent('rancher/rancher-compose.yml', /lb:/);
            assert.fileContent('rancher/rancher-compose.yml', /jhgate-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /msmysql-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /mspsql-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /msmongodb-app:/);
        });
    });

    describe('gateway and 1 microservice, with Cassandra cluster', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '05-cassandra'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'elk',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push'
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.ranchercompose);
            //Validate docker compose file
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/mscassandra/);
            //Validate rancher-compose
            assert.fileContent('rancher/rancher-compose.yml', /jhgate-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /mscassandra-app:/);
        });
    });

    describe('loadbalancing and a monolith app', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'monolith',
                    directoryPath: './',
                    'chosenApps': [
                        '08-monolith'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'elk',
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push',
                    enableRancherLoadBalancing: true
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('rancher/docker-compose.yml', /image: rancher\/load-balancer-service/);
            assert.fileContent('rancher/docker-compose.yml', /image: jhipsterrepository\/samplemysql/);
            //Validate rancher-compose
            assert.fileContent('rancher/rancher-compose.yml', /samplemysql-app:/);
            assert.fileContent('rancher/rancher-compose.yml', /lb:/);
        });
    });
});
