/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

const expectedFiles = {
    dockercompose : [
        'docker-compose.yml',
        'jhipster-registry.yml',
        'central-server-config/application.yml'
    ],
    elk : [
        'jhipster-console.yml',
        'log-conf/logstash.conf'
    ]
};

describe('JHipster Docker Compose Sub Generator', function () {

    describe('only gateway', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway'
                    ],
                    clusteredDbApps: [],
                    elk: false
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.dockercompose);
        });
    });

    describe('only one microservice', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    directoryPath: './',
                    'chosenApps': [
                        '02-mysql'
                    ],
                    clusteredDbApps: [],
                    elk: false
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.dockercompose);
        });
    });

    describe('gateway and one microservice', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql'
                    ],
                    clusteredDbApps: [],
                    elk: false
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.dockercompose);
        });
    });

    describe('gateway and one microservice, with elk', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql'
                    ],
                    clusteredDbApps: [],
                    elk: true
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', function () {
            assert.file(expectedFiles.elk);
        });
    });

    describe('gateway, uaa server and one microservice, with elk', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({force: true})
                .withPrompts({
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql',
                        '06-uaa'
                    ],
                    clusteredDbApps: [],
                    elk: true
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', function () {
            assert.file(expectedFiles.elk);
        });
    });

    describe('gateway and multi microservices, with elk', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql',
                        '03-psql',
                        '04-mongo',
                        '07-mariadb'
                    ],
                    clusteredDbApps: [],
                    elk: true
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', function () {
            assert.file(expectedFiles.elk);
        });
    });

    describe('gateway and multi microservices, with 1 mongodb cluster', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '02-mysql',
                        '03-psql',
                        '04-mongo'
                    ],
                    clusteredDbApps: [
                        '04-mongo'
                    ],
                    elk: true
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', function () {
            assert.file(expectedFiles.elk);
        });
    });

    describe('gateway and 1 microservice, with cassandra cluster', function () {
        beforeEach(function (done) {
            helpers
                .run(require.resolve('../generators/docker-compose'))
                .inTmpDir(function (dir) {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withPrompts({
                    directoryPath: './',
                    'chosenApps': [
                        '01-gateway',
                        '05-cassandra'
                    ],
                    clusteredDbApps: [],
                    elk: true
                })
                .on('end', done);
        });
        it('creates expected default files', function () {
            assert.file(expectedFiles.dockercompose);
        });
        it('creates expected elk files', function () {
            assert.file(expectedFiles.elk);
        });
    });
});
