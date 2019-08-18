const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

describe('JHipster generator languages', () => {
    context('Creates default i18n files', () => {
        constants.LANGUAGES.forEach(language => {
            describe(`for ${language.name}`, () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/languages'))
                        .inTmpDir(dir => {
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
                        `${SERVER_MAIN_RES_DIR}i18n/messages_${language.value
                            .replace(/-/g, '_')
                            .replace(/_[a-z]+$/g, lang => lang.toUpperCase())}.properties`
                    ]);
                    assert.noFile([`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/gateway.json`]);
                });
                it('contains 3 needles in global.json', () => {
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                        '"jhipster-needle-menu-add-element": "JHipster will add additional menu entries here (do not translate!)"'
                    );
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                        '"jhipster-needle-menu-add-entry": "JHipster will add additional entities here (do not translate!)"'
                    );
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/global.json`,
                        '"jhipster-needle-menu-add-admin-element": "JHipster will add additional menu entries here (do not translate!)"'
                    );
                });
            });
        });
    });
});
