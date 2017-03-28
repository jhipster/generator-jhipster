/* global describe, beforeEach, it*/

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

describe('JHipster generator languages', () => {
    const languages = [
        { name: 'Armenian', value: 'hy' },
        { name: 'Catalan', value: 'ca' },
        { name: 'Chinese (Simplified)', value: 'zh-cn' },
        { name: 'Chinese (Traditional)', value: 'zh-tw' },
        { name: 'Czech', value: 'cs' },
        { name: 'Danish', value: 'da' },
        { name: 'Dutch', value: 'nl' },
        { name: 'Estonian', value: 'et' },
        { name: 'Galician', value: 'gl' },
        { name: 'German', value: 'de' },
        { name: 'Greek', value: 'el' },
        { name: 'Hindi', value: 'hi' },
        { name: 'Hungarian', value: 'hu' },
        { name: 'Italian', value: 'it' },
        { name: 'Japanese', value: 'ja' },
        { name: 'Korean', value: 'ko' },
        { name: 'Marathi', value: 'mr' },
        { name: 'Polish', value: 'pl' },
        { name: 'Portuguese (Brazilian)', value: 'pt-br' },
        { name: 'Portuguese', value: 'pt-pt' },
        { name: 'Romanian', value: 'ro' },
        { name: 'Russian', value: 'ru' },
        { name: 'Slovak', value: 'sk' },
        { name: 'Serbian', value: 'sr' },
        { name: 'Spanish', value: 'es' },
        { name: 'Swedish', value: 'sv' },
        { name: 'Turkish', value: 'tr' },
        { name: 'Tamil', value: 'ta' },
        { name: 'Vietnamese', value: 'vi' }
    ];

    languages.forEach((language) => {
        describe(`no social - creates ${language.name}`, () => {
            beforeEach((done) => {
                helpers.run(require.resolve('../generators/languages'))
                    .inTmpDir((dir) => {
                        fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
                    })
                    .withOptions({ 'skip-install': true })
                    .withPrompts({
                        languages: [language.value]
                    })
                    .on('end', done);
            });

            it('creates expected files', () => {
                assert.file([
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/activate.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/audits.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/configuration.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/error.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/gateway.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/login.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/logs.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/home.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/metrics.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/password.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/register.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/sessions.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/settings.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/reset.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/user-management.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/health.json`,
                    `${SERVER_MAIN_RES_DIR}i18n/messages_${language.value.replace('-', '_')}.properties`
                ]);
            });
            it('doesnt create social.json', () => {
                assert.noFile([
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/social.json`
                ]);
            });
            it('contains 3 needles in global.json', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                    '"jhipster-needle-menu-add-element": "JHipster will add additional menu entries here (do not translate!)"');
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                    '"jhipster-needle-menu-add-entry": "JHipster will add additional entities here (do not translate!)"');
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                    '"jhipster-needle-menu-add-admin-element": "JHipster will add additional menu entries here (do not translate!)"');
            });
        });
    });

    languages.forEach((language) => {
        describe(`with social - creates ${language.name}`, () => {
            beforeEach((done) => {
                helpers.run(require.resolve('../generators/languages'))
                    .inTmpDir((dir) => {
                        fse.copySync(path.join(__dirname, '../test/templates/social'), dir);
                    })
                    .withOptions({ 'skip-install': true })
                    .withPrompts({
                        languages: [language.value]
                    })
                    .on('end', done);
            });

            it('creates expected files', () => {
                assert.file([
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/activate.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/audits.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/configuration.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/error.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/gateway.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/login.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/logs.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/home.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/metrics.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/password.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/register.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/sessions.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/settings.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/reset.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/user-management.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/health.json`,
                    `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/social.json`,
                    `${SERVER_MAIN_RES_DIR}i18n/messages_${language.value.replace('-', '_')}.properties`
                ]);
            });
        });
    });
});
