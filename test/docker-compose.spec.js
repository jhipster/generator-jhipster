const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    dockercompose: ['docker-compose.yml', 'jhipster-registry.yml', 'central-server-config/application.yml'],
    elk: ['jhipster-console.yml', 'log-conf/logstash.conf'],
    prometheus: ['prometheus.yml', 'prometheus-conf/alert_rules.yml', 'prometheus-conf/prometheus.yml', 'alertmanager-conf/config.yml'],
    monolith: ['docker-compose.yml']
};

describe('JHipster Docker Compose Sub Generator', () => {
    describe('only gateway', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway'],
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
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['02-mysql'],
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

    describe('one microservice and a directory path without a trailing slash', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: '.',
                    chosenApps: ['02-mysql'],
                    clusteredDbApps: [],
                    monitoring: 'no'
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('Correct the directory path by appending a trailing slash', () => {
            assert.fileContent('.yo-rc.json', '"directoryPath": "./"');
        });
    });

    describe('gateway and one microservice', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql'],
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
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql'],
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
        it('creates compose file without zipkin, without curator', () => {
            assert.noFileContent('docker-compose.yml', /jhipster-zipkin/);
            assert.noFileContent('docker-compose.yml', /jhipster-curator/);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('no prometheus files', () => {
            assert.noFile(expectedFiles.prometheus);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and one microservice, with zipkin', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql'],
                    clusteredDbApps: [],
                    monitoring: 'elk',
                    consoleOptions: ['zipkin']
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
        it('creates compose file with zipkin, without curator', () => {
            assert.fileContent('docker-compose.yml', /jhipster-zipkin/);
            assert.noFileContent('docker-compose.yml', /jhipster-curator/);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('no prometheus files', () => {
            assert.noFile(expectedFiles.prometheus);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and one microservice, with curator', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql'],
                    clusteredDbApps: [],
                    monitoring: 'elk',
                    consoleOptions: ['curator']
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
        it('creates compose file without zipkin, with curator', () => {
            assert.noFileContent('docker-compose.yml', /jhipster-zipkin/);
            assert.fileContent('docker-compose.yml', /jhipster-curator/);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('no prometheus files', () => {
            assert.noFile(expectedFiles.prometheus);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and one microservice, with zipkin and curator', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql'],
                    clusteredDbApps: [],
                    monitoring: 'elk',
                    consoleOptions: ['curator', 'zipkin']
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', () => {
            assert.file(expectedFiles.elk);
        });
        it('creates compose file without zipkin, with curator', () => {
            assert.fileContent('docker-compose.yml', /jhipster-zipkin/);
            assert.fileContent('docker-compose.yml', /jhipster-curator/);
        });
        it('creates jhipster-registry content', () => {
            assert.fileContent('docker-compose.yml', /jhipster-registry:8761\/config/);
        });
        it('no prometheus files', () => {
            assert.noFile(expectedFiles.prometheus);
        });
        it('creates compose file without container_name, external_links, links', () => {
            assert.noFileContent('docker-compose.yml', /container_name:/);
            assert.noFileContent('docker-compose.yml', /external_links:/);
            assert.noFileContent('docker-compose.yml', /links:/);
        });
    });

    describe('gateway and one microservice, with prometheus', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql'],
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
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withOptions({ force: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql', '06-uaa'],
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
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'],
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
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo'],
                    clusteredDbApps: ['04-mongo'],
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
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '05-cassandra'],
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
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: ['08-monolith'],
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

    describe('gateway and multi microservices, with couchbase', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql', '03-psql', '10-couchbase', '07-mariadb'],
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

    describe('gateway and 1 microservice, with 1 couchbase cluster', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '10-couchbase'],
                    clusteredDbApps: ['10-couchbase'],
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
});
