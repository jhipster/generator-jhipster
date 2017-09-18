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
    client: [
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foos.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-detail.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-dialog.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-delete-dialog.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-dialog.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-delete-dialog.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-detail.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.service.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo/foo-detail.controller.spec.js`
    ],
    clientNg2: [
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-detail.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-dialog.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-delete-dialog.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-dialog.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-delete-dialog.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-detail.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo/foo-detail.component.spec.ts`,
    ],
    clientNg2WithSuffix: [
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-detail.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-dialog.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-delete-dialog.component.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management.route.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-dialog.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-delete-dialog.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-detail.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management.service.ts`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo/foo-management-detail.component.spec.ts`,
    ],
    clientWithSuffix: [
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foos-management.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-detail.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-dialog.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-delete-dialog.html`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management.state.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-dialog.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-delete-dialog.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management-detail.controller.js`,
        `${CLIENT_MAIN_SRC_DIR}app/entities/foo/foo-management.service.js`,
        `${CLIENT_TEST_SRC_DIR}spec/app/entities/foo/foo-management-detail.controller.spec.js`
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
describe('JHipster generator entity for angular1', () => {
    describe('no dto, no service, no pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
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
            assert.file(expectedFiles.client);
            assert.file([
                `${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`,
                `${CLIENT_MAIN_SRC_DIR}i18n/fr/foo.json`
            ]);
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

    describe('with dto, no service, no pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'mapstruct',
                    service: 'no',
                    pagination: 'no'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.client);
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.java`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`
            ]);
        });
    });

    describe('no dto, with serviceClass, no pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'serviceClass',
                    pagination: 'no'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.client);
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`
            ]);
        });
    });

    describe('no dto, with serviceImpl, no pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
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
            assert.file(expectedFiles.client);
            assert.file([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`
            ]);
        });
    });

    describe('no dto, no service, with pager', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                })
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'no',
                    pagination: 'pager'
                })
                .on('end', done);
        });

        it('creates expected default files', () => {
            assert.file(expectedFiles.server);
            assert.file(expectedFiles.client);
        });
    });

    describe('no dto, no service, with pagination', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
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
            assert.file(expectedFiles.client);
        });
    });

    describe('no dto, no service, with infinite-scroll', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
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
            assert.file(expectedFiles.client);
        });
    });

    describe('with angulr suffix', () => {
        beforeEach((done) => {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
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

            assert.file(expectedFiles.clientWithSuffix);
            assert.fileContent('.jhipster/Foo.json', 'angularJSSuffix');
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

    describe('with dto, serviceImpl, with hazelcast, elasticsearch and noi18n', () => {
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

    describe('with angulr suffix', () => {
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
});
