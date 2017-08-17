/* global describe, beforeEach, it */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    ranchercompose: [
        'docker-compose.yml',
        'rancher-compose.yml'
    ]
};

describe('JHipster Rancher Compose Sub Generator', () => {
    describe('only gateway', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/jhgate/);
        });
    });

    describe('only one microservice', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmysql/);
        });
    });

    describe('gateway and one microservice', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmysql/);
        });
    });

    describe('gateway and one microservice, with elk', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmysql/);
        });
    });

    describe('gateway and one microservice, with prometheus', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmysql/);
        });
    });

    describe('gateway, uaa server and one microservice, with elk', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ force: true })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.noFileContent('docker-compose.yml', /image: rancher\/load-balancer-service/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmysql/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/uaaserver/);
            // Validate rancher-compose
            assert.noFileContent('rancher-compose.yml', /lb:/);
            assert.fileContent('rancher-compose.yml', /jhgate-app:/);
            assert.fileContent('rancher-compose.yml', /msmysql-app:/);
            assert.fileContent('rancher-compose.yml', /uaaserver-app:/);
        });
    });

    describe('loadbalancing and multi microservices, with elk', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.ranchercompose);
            // Validate docker compose file
            assert.noFileContent('docker-compose.yml', /image: rancher\/load-balancer-service/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmysql/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/mspsql/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmariadb/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmongodb/);
            // Validate rancher-compose
            assert.noFileContent('rancher-compose.yml', /lb:/);
            assert.fileContent('rancher-compose.yml', /msmysql-app:/);
            assert.fileContent('rancher-compose.yml', /mspsql-app:/);
            assert.fileContent('rancher-compose.yml', /msmariadb-app:/);
            assert.fileContent('rancher-compose.yml', /msmongodb-app:/);
        });
    });

    describe('loadbalancing, gateway and multi microservices, with 1 mongodb cluster ', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.ranchercompose);
            // Validate docker compose file
            assert.fileContent('docker-compose.yml', /image: rancher\/load-balancer-service/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmysql/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/mspsql/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/msmongodb/);
            // Validate rancher-compose
            assert.fileContent('rancher-compose.yml', /lb:/);
            assert.fileContent('rancher-compose.yml', /jhgate-app:/);
            assert.fileContent('rancher-compose.yml', /msmysql-app:/);
            assert.fileContent('rancher-compose.yml', /mspsql-app:/);
            assert.fileContent('rancher-compose.yml', /msmongodb-app:/);
        });
    });

    describe('gateway and 1 microservice, with Cassandra cluster', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.ranchercompose);
            // Validate docker compose file
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/jhgate/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/mscassandra/);
            // Validate rancher-compose
            assert.fileContent('rancher-compose.yml', /jhgate-app:/);
            assert.fileContent('rancher-compose.yml', /mscassandra-app:/);
        });
    });

    describe('loadbalancing and a monolith app', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/rancher-compose'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    composeApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: [
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
        it('creates expected default files', () => {
            assert.file(expectedFiles.ranchercompose);
            assert.fileContent('docker-compose.yml', /image: rancher\/load-balancer-service/);
            assert.fileContent('docker-compose.yml', /image: jhipsterrepository\/samplemysql/);
            // Validate rancher-compose
            assert.fileContent('rancher-compose.yml', /samplemysql-app:/);
            assert.fileContent('rancher-compose.yml', /lb:/);
        });
    });
});
