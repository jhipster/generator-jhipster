/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

const constants = require('../generators/generator-constants'),
    TEST_DIR = constants.TEST_DIR,
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR,
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR,
    SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

const expectedFiles = {
    default: [
        '.jhipster/Foo.json',
        SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/domain/Foo.java',
        SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/repository/FooRepository.java',
        SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/web/rest/FooResource.java',
        // SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/20160120213555_added_entity_Foo.xml',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo-management.html',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo-management-detail.html',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo-management-dialog.html',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo-management-delete-dialog.html',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo-management.state.js',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo-management.controller.js',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo-management-dialog.controller.js',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo-management-delete-dialog.controller.js',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo-management-detail.controller.js',
        CLIENT_MAIN_SRC_DIR + 'app/entities/foo/foo.service.js',
        CLIENT_TEST_SRC_DIR + 'spec/app/entities/foo/foo-management-detail.controller.spec.js',
        SERVER_TEST_SRC_DIR + 'com/mycompany/myapp/web/rest/FooResourceIntTest.java',
        TEST_DIR + 'gatling/simulations/FooGatlingTest.scala',
    ]
}
describe('JHipster generator entity', function () {
    describe('no dto, no service, no pagination', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
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

        it('creates expected default files', function () {
            assert.file(expectedFiles.default);
            assert.file([
                //CLIENT_MAIN_SRC_DIR + 'i18n/en/foo.json', //this should ideally be working
                //CLIENT_MAIN_SRC_DIR + 'i18n/fr/foo.json'
            ]);
        });
    });

    describe('with dto, no service, no pagination', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
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

        it('creates expected default files', function () {
            assert.file(expectedFiles.default);
            assert.file([
                SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/web/rest/dto/FooDTO.java',
                SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/web/rest/mapper/FooMapper.java'
            ]);
        });
    });

    describe('no dto, with serviceClass, no pagination', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
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

        it('creates expected default files', function () {
            assert.file(expectedFiles.default)
            assert.file([,
                SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/service/FooService.java'
            ]);
        });
    });

    describe('no dto, with serviceImpl, no pagination', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
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

        it('creates expected default files', function () {
            assert.file(expectedFiles.default);
            assert.file([
                SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/service/FooService.java',
                SERVER_MAIN_SRC_DIR + 'com/mycompany/myapp/service/impl/FooServiceImpl.java'
            ]);
        });
    });

    describe('no dto, no service, with pager', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
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

        it('creates expected default files', function () {
            assert.file(expectedFiles.default);
        });
    });

    describe('no dto, no service, with pagination', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
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

        it('creates expected default files', function () {
            assert.file(expectedFiles.default);
        });
    });

    describe('no dto, no service, with infinite-scroll', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
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

        it('creates expected default files', function () {
            assert.file(expectedFiles.default);
        });
    });

    describe('with dto, serviceImpl, with hazelcast, elasticsearch and noi18n', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../generators/entity'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, '../test/templates/noi18n'), dir)
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

        it('creates expected default files', function () {
            assert.file(expectedFiles.default);
            assert.noFile([
                CLIENT_MAIN_SRC_DIR + 'i18n/en/foo.json',
                CLIENT_MAIN_SRC_DIR + 'i18n/fr/foo.json'
            ])
        });
    });
});
