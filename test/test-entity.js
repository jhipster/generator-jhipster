/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var os = require('os');
var fse = require('fs-extra');

describe('JHipster generator entity', function () {
    describe('default configuration', function () {
        before(function (done) {
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
            assert.file([
                '.jhipster/Foo.json',
                'src/main/java/com/mycompany/myapp/domain/Foo.java',
                'src/main/java/com/mycompany/myapp/repository/FooRepository.java',
                'src/main/java/com/mycompany/myapp/web/rest/FooResource.java',
                // 'src/main/resources/config/liquibase/changelog/20160120213555_added_entity_Foo.xml',
                'src/main/webapp/scripts/app/entities/foo/foos.html',
                'src/main/webapp/scripts/app/entities/foo/foo-detail.html',
                'src/main/webapp/scripts/app/entities/foo/foo-dialog.html',
                'src/main/webapp/scripts/app/entities/foo/foo-delete-dialog.html',
                'src/main/webapp/scripts/app/entities/foo/foo.js',
                'src/main/webapp/scripts/app/entities/foo/foo.controller.js',
                'src/main/webapp/scripts/app/entities/foo/foo-dialog.controller.js',
                'src/main/webapp/scripts/app/entities/foo/foo-delete-dialog.controller.js',
                'src/main/webapp/scripts/app/entities/foo/foo-detail.controller.js',
                'src/test/javascript/spec/app/entities/foo/foo-detail.controller.spec.js',
                'src/main/webapp/scripts/components/entities/foo/foo.service.js',
                // 'src/main/webapp/i18n/en/foo.json',
                // 'src/main/webapp/i18n/fr/foo.json',
                'src/test/java/com/mycompany/myapp/web/rest/FooResourceIntTest.java',
                'src/test/gatling/simulations/FooGatlingTest.scala',
            ])
        });
    });
});
