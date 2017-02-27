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
        it('doesn\'t contain Docker, Sonar, Heroku', function () {
            assert.noFileContent('Jenkinsfile', /docker/);
            assert.noFileContent('Jenkinsfile', /sonar/);
            assert.noFileContent('Jenkinsfile', /heroku/);
            assert.noFileContent('.gitlab-ci.yml', /image: openjdk/);
            assert.noFileContent('.gitlab-ci.yml', /heroku/);
            assert.noFileContent('circle.yml', /heroku/);
        });
    });

    describe('Jenkins', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'jenkins'
                    ],
                    jenkinsIntegrations: [
                        'docker',
                        'sonar',
                        'gitlab'
                    ],
                    heroku: [
                        'jenkins'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.jenkins);
            assert.noFile(expectedFiles.gitlab);
            assert.noFile(expectedFiles.travis);
            assert.noFile(expectedFiles.circle);
        });
        it('contains Docker, Sonar, Heroku', function () {
            assert.fileContent('Jenkinsfile', /docker/);
            assert.fileContent('Jenkinsfile', /sonar/);
            assert.fileContent('Jenkinsfile', /heroku/);
        });
    });

    describe('GitLab CI', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'gitlab'
                    ],
                    gitlabUseDocker: true,
                    heroku: [
                        'gitlab'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.gitlab);
            assert.noFile(expectedFiles.jenkins);
            assert.noFile(expectedFiles.travis);
            assert.noFile(expectedFiles.circle);
        });
        it('contains image openjdk, heroku', function () {
            assert.fileContent('.gitlab-ci.yml', /image: openjdk/);
            assert.fileContent('.gitlab-ci.yml', /heroku/);
        });
    });

    describe('Circle CI', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({skipChecks: true})
                .withPrompts({
                    pipelines: [
                        'circle'
                    ],
                    gitlabUseDocker: true,
                    heroku: [
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', function () {
            assert.file(expectedFiles.circle);
            assert.noFile(expectedFiles.jenkins);
            assert.noFile(expectedFiles.travis);
            assert.noFile(expectedFiles.gitlab);
        });
        it('contains heroku', function () {
            assert.fileContent('circle.yml', /heroku/);
        });
    });

});
