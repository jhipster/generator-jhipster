const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('../generators/generator-constants');
const expectedFiles = require('./utils/expected-files').entity;

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

describe('JHipster generator for entity', () => {
    describe('search, no dto, no service, no pagination', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-elasticsearch'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'no',
                    pagination: 'no'
                })
                .on('end', done);
        });

        it('does creates search files', () => {
            assert.file(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.java`);
            assert.file(expectedFiles.gatling);
        });
    });
});

describe('JHipster generator entity for angularX', () => {
    describe('no dto, no service, no pagination', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'no',
                    pagination: 'no'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.clientNg2);
            assert.file(expectedFiles.gatling);
        });
    });

    describe('no dto, no service, with pagination', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'no',
                    pagination: 'pagination'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.clientNg2);
            assert.file(expectedFiles.gatling);
        });
    });

    describe('no dto, no service, with infinite-scroll', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'no',
                    pagination: 'infinite-scroll'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.clientNg2);
            assert.file(expectedFiles.gatling);
        });
    });

    describe('no dto, with serviceImpl, no pagination', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'serviceImpl',
                    pagination: 'no'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.clientNg2);
            assert.file(expectedFiles.gatling);
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`
            ]);
        });
    });

    describe('with dto, service, no pagination', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'mapstruct',
                    service: 'serviceClass',
                    pagination: 'no'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.clientNg2);
            assert.file(expectedFiles.gatling);
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.java`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`
            ]);
        });
    });

    describe('with dto, serviceImpl, with hazelcast, elasticsearch and no i18n', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/noi18n'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'yes',
                    service: 'serviceImpl',
                    pagination: 'infinite-scroll'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.clientNg2);
            assert.file(expectedFiles.gatling);
            assert.noFile([`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`, `${CLIENT_MAIN_SRC_DIR}i18n/fr/foo.json`]);
        });
    });

    describe('with angular suffix', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                })
                .withArguments(['foo'])
                .withOptions({ 'angular-suffix': 'management' })
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'yes',
                    service: 'serviceImpl',
                    pagination: 'infinite-scroll'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.clientNg2WithSuffix);
            assert.file(expectedFiles.gatling);
            assert.fileContent('.jhipster/Foo.json', 'angularJSSuffix');
        });
    });

    describe('JHipster generator entity with all languages', () => {
        describe('no dto, no service, no pagination', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/entity'))
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/all-languages'), dir);
                    })
                    .withArguments(['foo'])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'no'
                    })
                    .on('end', done);
            });

            it('creates expected languages files', () => {
                constants.LANGUAGES.forEach(language => {
                    assert.file([`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/foo.json`]);
                });
            });
        });
    });

    describe('with client-root-folder', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                })
                .withArguments(['foo'])
                .withOptions({ 'client-root-folder': 'test-root' })
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'yes',
                    service: 'serviceImpl',
                    pagination: 'infinite-scroll'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.clientNg2WithRootFolder);
            assert.file(expectedFiles.gatling);
            assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
        });
    });

    describe('with client-root-folder and angular-suffix', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                })
                .withArguments(['foo'])
                .withOptions({ 'client-root-folder': 'test-root' })
                .withOptions({ 'angular-suffix': 'management' })
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'yes',
                    service: 'serviceImpl',
                    pagination: 'infinite-scroll'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.clientNg2WithRootFolderAndSuffix);
            assert.file(expectedFiles.gatling);
            assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
        });
    });

    describe('with client-root-folder microservice', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                })
                .withArguments(['foo'])
                .withOptions({ 'client-root-folder': 'test-root' })
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'yes',
                    service: 'serviceImpl',
                    pagination: 'infinite-scroll'
                })
                .on('end', done);
        });

        it('sets expected custom clientRootFolder', () => {
            assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
            assert.file(expectedFiles.server);
            assert.noFile(expectedFiles.clientNg2WithRootFolder);
        });
    });

    describe('with default microservice', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'yes',
                    service: 'serviceImpl',
                    pagination: 'pagination'
                })
                .on('end', done);
        });

        it('sets expected default clientRootFolder', () => {
            assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'sampleMicroservice' });
        });
        it('generates expected files', () => {
            assert.file(expectedFiles.server);
            assert.noFile(expectedFiles.gatling);
            assert.noFile(expectedFiles.clientNg2WithRootFolder);
        });
    });

    describe('with default gateway entity from microservice', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                })
                .withPrompts({
                    useMicroserviceJson: true,
                    microservicePath: '../'
                })
                .withArguments(['bar'])
                .on('end', done);
        });

        it('sets expected default clientRootFolder', () => {
            assert.jsonFileContent('.jhipster/Bar.json', { clientRootFolder: 'sampleMicroservice' });
        });
        it('generates expected files', () => {
            assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/sampleMicroserviceBar.json`);
            assert.file(expectedFiles.clientNg2GatewayMicroserviceEntity);
            assert.noFile(expectedFiles.gatling);
            assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/bar.service.ts`, 'samplemicroservice');
            assert.noFile(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/BarResource.java`);
        });
    });

    describe('with default gateway entity from microservice with custom client-root-folder', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    useMicroserviceJson: true,
                    microservicePath: '../'
                })
                .on('end', done);
        });

        it('sets expected custom clientRootFolder', () => {
            assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
        });
        it('generates expected files', () => {
            assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/testRootFoo.json`);
            assert.file(expectedFiles.clientNg2WithRootFolder);
            assert.noFile(expectedFiles.gatling);
            assert.noFile(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`);
        });
    });

    describe('with all languages and client-root-folder', () => {
        describe('no dto, no service, no pagination', () => {
            beforeEach(done => {
                helpers
                    .run(require.resolve('../generators/entity'))
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../test/templates/all-languages'), dir);
                    })
                    .withArguments(['foo'])
                    .withOptions({ 'client-root-folder': 'test-root' })
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'no'
                    })
                    .on('end', done);
            });

            it('creates expected languages files', () => {
                constants.LANGUAGES.forEach(language => {
                    assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/testRootFoo.json`);
                });
                assert.file(expectedFiles.clientNg2WithRootFolder);
            });
        });
    });
});
