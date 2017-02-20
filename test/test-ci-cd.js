/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

const expectedFiles = {
    travis: [
        '.travis.yml'
    ],
    jenkins: [
        'Jenkinsfile'
    ],
    gitlab: [
        '.gitlab-ci.yml'
    ],
    circle : [
        'circle.yml'
    ]
};

describe('JHipster CI-CD Sub Generator', function () {
    describe('Gradle Angular1 NPM', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ng1-npm'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Gradle Angular1 Yarn', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ng1-yarn'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Gradle Angular2 NPM', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ng2-npm'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Gradle Angular2 Yarn', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ng2-yarn'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Maven Angular1 NPM', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng1-npm'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });
    describe('Maven Angular1 Yarn', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng1-yarn'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });
    describe('Maven Angular2 NPM', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-npm'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });
    describe('Maven Angular2 Yarn', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

});
