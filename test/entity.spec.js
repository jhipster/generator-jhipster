/* global describe, beforeEach, it */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('../generators/generator-constants');

const TEST_DIR = constants.TEST_DIR;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

const expectedFiles = {
    clientNg2: [
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-detail.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-update.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-delete-dialog.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-update.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-delete-dialog.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-detail.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/model/foo.model.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo/foo-delete-dialog.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo/foo-detail.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo/foo-update.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo/foo.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo/foo.service.spec.ts`
    ],
    clientNg2WithSuffix: [
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management-detail.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management-update.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management-delete-dialog.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management-update.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management-delete-dialog.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management-detail.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo-management/foo-management.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/model/foo-management.model.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo-management/foo-management-delete-dialog.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo-management/foo-management-detail.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo-management/foo-management-update.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo-management/foo-management.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo-management/foo-management.service.spec.ts`
    ],
    clientNg2WithRootFolder: [
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo-detail.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo-update.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo-delete-dialog.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo-update.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo-delete-dialog.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo-detail.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo/foo.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/model/test-root/foo.model.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo/foo-delete-dialog.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo/foo-detail.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo/foo-update.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo/foo.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo/foo.service.spec.ts`
    ],
    clientNg2WithRootFolderAndSuffix: [
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management-detail.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management-update.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management-delete-dialog.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management-update.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management-delete-dialog.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management-detail.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/test-root/foo-management/foo-management.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/model/test-root/foo-management.model.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo-management/foo-management-delete-dialog.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo-management/foo-management-detail.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo-management/foo-management-update.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo-management/foo-management.component.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/test-root/foo-management/foo-management.service.spec.ts`
    ],
    server: [
        '.jhipster/Foo.json',
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.java`,
        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`,
        // SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/20160120213555_added_entity_Foo.xml',
        `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIntTest.java`,
        `${TEST_DIR}gatling/user-files/simulations/FooGatlingTest.scala`
    ]
};

describe('JHipster generator for server', () => {
    describe('search, no dto, no service, no pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
        });
    });
});

describe('JHipster generator entity for angularX', () => {
    describe('no dto, no service, no pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
        });
    });

    describe('no dto, no service, with pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
        });
    });

    describe('no dto, no service, with infinite-scroll', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
        });
    });

    describe('no dto, with serviceImpl, no pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`
            ]);
        });
    });

    describe('with dto, service, no pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.java`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`
            ]);
        });
    });

    describe('with dto, serviceImpl, with hazelcast, elasticsearch and no i18n', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
            assert.noFile([
                `${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`,
                `${CLIENT_MAIN_SRC_DIR}i18n/fr/foo.json`
            ]);
        });
    });

    describe('with angular suffix', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
            assert.fileContent('.jhipster/Foo.json', 'angularJSSuffix');
        });
    });

    describe('JHipster generator entity with all languages', () => {
        describe('no dto, no service, no pagination', () => {
            beforeEach((done) => {
                helpers.run(require.resolve('../generators/entity'))
                    .inTmpDir((dir) => {
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
                constants.LANGUAGES.forEach((language) => {
                    assert.file([
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/foo.json`
                    ]);
                });
            });
        });
    });

    describe('with client-root-folder', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
            assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
        });
    });

    describe('with client-root-folder and angular-suffix', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
            assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
        });
    });

    describe('with client-root-folder microservice', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
        });
    });

    describe('with default microservice', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
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
    });

    describe('JHipster generator entity with all languages and client-root-folder', () => {
        describe('no dto, no service, no pagination', () => {
            beforeEach((done) => {
                helpers.run(require.resolve('../generators/entity'))
                    .inTmpDir((dir) => {
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
                constants.LANGUAGES.forEach((language) => {
                    assert.file([
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/testRootFoo.json`
                    ]);
                });
            });
        });
    });
});
