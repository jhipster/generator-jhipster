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
    dockercompose : [
        'docker-compose.yml',
        'jhipster-registry.yml',
        'central-server-config/application.yml'
    ],
    elk : [
        'elk.yml',
        'log-monitoring/log-config/logstash.conf'
    ]
};

describe('JHipster Docker Compose Sub Generator', function () {
    this.timeout(5000); //to avoid occassional timeout on windows

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
});
