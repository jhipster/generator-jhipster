/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fse = require('fs-extra');

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
                    .withPrompts({
                        languages: [language.value]
                    })
                    .on('end', done);
            });

            it('creates expected files', function () {
                assert.file([
                    'src/main/webapp/i18n/' + language.value + '/activate.json',
                    'src/main/webapp/i18n/' + language.value + '/audits.json',
                    'src/main/webapp/i18n/' + language.value + '/configuration.json',
                    'src/main/webapp/i18n/' + language.value + '/error.json',
                    'src/main/webapp/i18n/' + language.value + '/gateway.json',
                    'src/main/webapp/i18n/' + language.value + '/login.json',
                    'src/main/webapp/i18n/' + language.value + '/logs.json',
                    'src/main/webapp/i18n/' + language.value + '/home.json',
                    'src/main/webapp/i18n/' + language.value + '/metrics.json',
                    'src/main/webapp/i18n/' + language.value + '/password.json',
                    'src/main/webapp/i18n/' + language.value + '/register.json',
                    'src/main/webapp/i18n/' + language.value + '/sessions.json',
                    'src/main/webapp/i18n/' + language.value + '/settings.json',
                    'src/main/webapp/i18n/' + language.value + '/reset.json',
                    'src/main/webapp/i18n/' + language.value + '/user-management.json',
                    'src/main/webapp/i18n/' + language.value + '/global.json',
                    'src/main/webapp/i18n/' + language.value + '/health.json',
                    'src/main/resources/i18n/messages_' + language.value.replace('-','_') + '.properties'
                ]);
            });
            it('doesnt create social.json', function () {
                assert.noFile([
                    'src/main/webapp/i18n/' + language.value + '/social.json'
                ]);
            });
            it('contains 3 needles in global.json', function () {
                assert.fileContent('src/main/webapp/i18n/' + language.value + '/global.json',
                    '"jhipster-needle-menu-add-element": \"JHipster will add additional menu entries here (do not translate!)"');
                assert.fileContent('src/main/webapp/i18n/' + language.value + '/global.json',
                    '"jhipster-needle-menu-add-entry": "JHipster will add additional entities here (do not translate!)"');
                assert.fileContent('src/main/webapp/i18n/' + language.value + '/global.json',
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
                    .withPrompts({
                        languages: [language.value]
                    })
                    .on('end', done);
            });

            it('creates expected files', function () {
                assert.file([
                    'src/main/webapp/i18n/' + language.value + '/activate.json',
                    'src/main/webapp/i18n/' + language.value + '/audits.json',
                    'src/main/webapp/i18n/' + language.value + '/configuration.json',
                    'src/main/webapp/i18n/' + language.value + '/error.json',
                    'src/main/webapp/i18n/' + language.value + '/gateway.json',
                    'src/main/webapp/i18n/' + language.value + '/login.json',
                    'src/main/webapp/i18n/' + language.value + '/logs.json',
                    'src/main/webapp/i18n/' + language.value + '/home.json',
                    'src/main/webapp/i18n/' + language.value + '/metrics.json',
                    'src/main/webapp/i18n/' + language.value + '/password.json',
                    'src/main/webapp/i18n/' + language.value + '/register.json',
                    'src/main/webapp/i18n/' + language.value + '/sessions.json',
                    'src/main/webapp/i18n/' + language.value + '/settings.json',
                    'src/main/webapp/i18n/' + language.value + '/reset.json',
                    'src/main/webapp/i18n/' + language.value + '/user-management.json',
                    'src/main/webapp/i18n/' + language.value + '/global.json',
                    'src/main/webapp/i18n/' + language.value + '/health.json',
                    'src/main/webapp/i18n/' + language.value + '/social.json',
                    'src/main/resources/i18n/messages_' + language.value.replace('-','_') + '.properties'
                ]);
            });
        });
    });
});
