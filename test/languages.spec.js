const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('generator-jhipster/generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;

describe('Subgenerator languages of Vue.js JHipster blueprint', () => {
    context('Creates default i18n files', () => {
        constants.LANGUAGES.forEach((language) => {
            describe(`for ${language.name}`, () => {
                before((done) => {
                    helpers
                        .run('generator-jhipster/generators/languages')
                        .inTmpDir((dir) => {
                            fse.copySync(path.join(__dirname, '../test/templates/vuejs-default'), dir);
                        })
                        .withOptions({
                            'from-cli': true,
                            skipInstall: true,
                            blueprint: 'vuejs',
                            skipChecks: true
                        })
                        .withGenerators([
                            [
                                require('../generators/languages/index.js'), // eslint-disable-line global-require
                                'jhipster-vuejs:languages',
                                path.join(__dirname, '../generators/languages/index.js')
                            ]
                        ])
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
                        `${SERVER_MAIN_RES_DIR}i18n/messages_${language.value.replace('-', '_')}.properties`
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
                it('add language into config.ts, webpack.common.js', () => {
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/shared/config/config.ts`,
                        `'${language.value}': { name:`
                    );
                    assert.fileContent(
                        `${CLIENT_WEBPACK_DIR}webpack.common.js`,
                        `{ pattern: './src/main/webapp/i18n/${language.value}/*.json', fileName: './i18n/${language.value}.json' }`
                    );
                });
            });
        });
    });
});
