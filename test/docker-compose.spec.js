/* global describe, beforeEach, it*/


const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    dockercompose: [
        'docker-compose.yml',
        'jhipster-registry.yml',
        'central-server-config/application.yml'
    ],
    elk: [
        'jhipster-console.yml',
        'log-conf/logstash.conf'
    ],
    prometheus: [
        'prometheus.yml',
        'prometheus-conf/alert.rules',
        'prometheus-conf/prometheus.yml',
        'alertmanager-conf/config.yml'
    ],
    monolith: [
        'docker-compose.yml'
    ]
};

describe('JHipster Docker Compose Sub Generator', () => {
    describe('only gateway', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                    monitoring: 'no'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('only one microservice', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                    monitoring: 'no'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and one microservice', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                    monitoring: 'no'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and one microservice, with elk', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                    monitoring: 'elk'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and one microservice, with prometheus', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                    monitoring: 'prometheus'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected prometheus files', () => {
            assert.file(expectedFiles.prometheus);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway, uaa server and one microservice, with elk', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                    monitoring: 'elk'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and multi microservices, with elk', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                        '04-mongo',
                        '07-mariadb'
                    ],
                    clusteredDbApps: [],
                    monitoring: 'elk'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and multi microservices, with 1 mongodb cluster', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                    monitoring: 'elk'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and 1 microservice, with Cassandra cluster', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                    monitoring: 'elk'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('monolith', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
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
                    monitoring: 'elk'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.monolith);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });
});
