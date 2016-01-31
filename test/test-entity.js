/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

const expectedFiles = {
    default: [
        '.jhipster/Foo.json',
        'src/main/java/com/mycompany/myapp/domain/Foo.java',
        'src/main/java/com/mycompany/myapp/repository/FooRepository.java',
        'src/main/java/com/mycompany/myapp/web/rest/FooResource.java',
        // 'src/main/resources/config/liquibase/changelog/20160120213555_added_entity_Foo.xml',
        'src/main/webapp/app/entities/foo-management/foo-management.html',
        'src/main/webapp/app/entities/foo-management/foo-management-detail.html',
        'src/main/webapp/app/entities/foo-management/foo-management-dialog.html',
        'src/main/webapp/app/entities/foo-management/foo-management-delete-dialog.html',
        'src/main/webapp/app/entities/foo-management/foo-management.js',
        'src/main/webapp/app/entities/foo-management/foo-management.controller.js',
        'src/main/webapp/app/entities/foo-management/foo-management-dialog.controller.js',
        'src/main/webapp/app/entities/foo-management/foo-management-delete-dialog.controller.js',
        'src/main/webapp/app/entities/foo-management/foo-management-detail.controller.js',
        'src/test/javascript/spec/app/entities/foo-management/foo-management-detail.controller.spec.js',
        'src/main/webapp/app/services/foo/foo.service.js',
        // 'src/main/webapp/i18n/en/foo.json',
        // 'src/main/webapp/i18n/fr/foo.json',
        'src/test/java/com/mycompany/myapp/web/rest/FooResourceIntTest.java',
        'src/test/gatling/simulations/FooGatlingTest.scala',
    ]
}
describe('JHipster generator entity', function () {
    describe('no dto, no service, no pagination', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../entity'))
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
        });
    });

    describe('with dto, no service, no pagination', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../entity'))
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
                'src/main/java/com/mycompany/myapp/web/rest/dto/FooDTO.java',
                'src/main/java/com/mycompany/myapp/web/rest/mapper/FooMapper.java'
            ]);
        });
    });

    describe('no dto, with serviceClass, no pagination', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../entity'))
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
                'src/main/java/com/mycompany/myapp/service/FooService.java'
            ]);
        });
    });

    describe('no dto, with serviceImpl, no pagination', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../entity'))
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
                'src/main/java/com/mycompany/myapp/service/FooService.java',
                'src/main/java/com/mycompany/myapp/service/impl/FooServiceImpl.java'
            ]);
        });
    });

    describe('no dto, no service, with pager', function () {
        beforeEach(function (done) {
            helpers.run(require.resolve('../entity'))
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
            helpers.run(require.resolve('../entity'))
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
            helpers.run(require.resolve('../entity'))
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
});
