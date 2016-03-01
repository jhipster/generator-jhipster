/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

const constants = require('../generators/generator-constants'),
    CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

describe('JHipster generator languages', function () {
    var languages = [
        {name: 'Catalan', value: 'ca'},
        {name: 'Chinese (Simplified)', value: 'zh-cn'},
        {name: 'Chinese (Traditional)', value: 'zh-tw'},
        {name: 'Danish', value: 'da'},
        {name: 'Dutch', value: 'nl'},
        {name: 'Galician', value: 'gl'},
        {name: 'German', value: 'de'},
        {name: 'Hungarian', value: 'hu'},
        {name: 'Italian', value: 'it'},
        {name: 'Japanese', value: 'ja'},
        {name: 'Korean', value: 'ko'},
        {name: 'Polish', value: 'pl'},
        {name: 'Portuguese (Brazilian)', value: 'pt-br'},
        {name: 'Portuguese', value: 'pt-pt'},
        {name: 'Romanian', value: 'ro'},
        {name: 'Russian', value: 'ru'},
        {name: 'Spanish', value: 'es'},
        {name: 'Swedish', value: 'sv'},
        {name: 'Turkish', value: 'tr'},
        {name: 'Tamil', value: 'ta'}
    ];

    languages.forEach( function(language) {
        describe('no social - creates ' + language.name, function () {
            beforeEach(function (done) {
                helpers.run(require.resolve('../generators/languages'))
                    .inTmpDir(function (dir) {
                        fse.copySync(path.join(__dirname, '../test/templates/default'), dir)
                    })
                    .withOptions({'skip-wiredep': true})
                    .withPrompts({
                        languages: [language.value]
                    })
                    .on('end', done);
            });

            it('creates expected files', function () {
                assert.file([
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/activate.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/audits.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/configuration.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/error.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/gateway.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/login.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/logs.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/home.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/metrics.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/password.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/register.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/sessions.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/settings.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/reset.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/user-management.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/global.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/health.json',
                    SERVER_MAIN_RES_DIR + 'i18n/messages_' + language.value.replace('-','_') + '.properties'
                ]);
            });
            it('doesnt create social.json', function () {
                assert.noFile([
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/social.json'
                ]);
            });
            it('contains 3 needles in global.json', function () {
                assert.fileContent(CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/global.json',
                    '"jhipster-needle-menu-add-element": \"JHipster will add additional menu entries here (do not translate!)"');
                assert.fileContent(CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/global.json',
                    '"jhipster-needle-menu-add-entry": "JHipster will add additional entities here (do not translate!)"');
                assert.fileContent(CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/global.json',
                    '"jhipster-needle-menu-add-admin-element": "JHipster will add additional menu entries here (do not translate!)"');
            })
        });
    });

    languages.forEach( function(language) {
        describe('with social - creates ' + language.name, function () {
            beforeEach(function (done) {
                helpers.run(require.resolve('../generators/languages'))
                    .inTmpDir(function (dir) {
                        fse.copySync(path.join(__dirname, '../test/templates/social'), dir)
                    })
                    .withOptions({'skip-wiredep': true})
                    .withPrompts({
                        languages: [language.value]
                    })
                    .on('end', done);
            });

            it('creates expected files', function () {
                assert.file([
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/activate.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/audits.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/configuration.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/error.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/gateway.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/login.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/logs.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/home.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/metrics.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/password.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/register.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/sessions.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/settings.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/reset.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/user-management.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/global.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/health.json',
                    CLIENT_MAIN_SRC_DIR + 'i18n/' + language.value + '/social.json',
                    SERVER_MAIN_RES_DIR + 'i18n/messages_' + language.value.replace('-','_') + '.properties'
                ]);
            });
        });
    });
});
