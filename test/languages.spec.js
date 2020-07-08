const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

const containsLanguageFiles = languageValue => {
    it('creates expected files', () => {
        assert.file([
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/activate.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/audits.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/configuration.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/error.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/login.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/logs.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/home.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/metrics.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/password.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/register.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/sessions.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/settings.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/reset.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/user-management.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/global.json`,
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/health.json`,
            `${SERVER_MAIN_RES_DIR}i18n/messages_${languageValue
                .replace(/-/g, '_')
                .replace(/_[a-z]+$/g, lang => lang.toUpperCase())}.properties`,
        ]);
        assert.noFile([`${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/gateway.json`]);
    });
    it('contains 3 needles in global.json', () => {
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/global.json`,
            '"jhipster-needle-menu-add-element": "JHipster will add additional menu entries here (do not translate!)"'
        );
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/global.json`,
            '"jhipster-needle-menu-add-entry": "JHipster will add additional entities here (do not translate!)"'
        );
        assert.fileContent(
            `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/global.json`,
            '"jhipster-needle-menu-add-admin-element": "JHipster will add additional menu entries here (do not translate!)"'
        );
    });
};

describe('JHipster generator languages', () => {
    context('Creates default i18n files', () => {
        constants.LANGUAGES.forEach(language => {
            describe(`with prompts for ${language.name}`, () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/languages'))
                        .withOptions({ skipInstall: true })
                        .withPrompts({
                            enableTranslation: true,
                            nativeLanguage: language.value,
                            languages: [language.value],
                        })
                        .on('end', done);
                });
                containsLanguageFiles(language.value);
            });
            describe(`with options for ${language.name}`, () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/languages'))
                        .withLocalConfig({ enableTranslation: true, nativeLanguage: language.value })
                        .withOptions({ skipInstall: true, languages: [language.value] })
                        .on('end', done);
                });
                containsLanguageFiles(language.value);
            });
        });
    });
    context.only('Creates default i18n files for more then one language', () => {
        describe('with prompts', () => {
            before(done => {
                helpers
                    .run(require.resolve('../generators/languages'))
                    .withOptions({ skipInstall: true })
                    .withPrompts({
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr', 'de'],
                    })
                    .on('end', done);
            });
            containsLanguageFiles('fr');
            containsLanguageFiles('de');
        });
        describe('with options', () => {
            before(done => {
                helpers
                    .run(require.resolve('../generators/languages'))
                    .withLocalConfig({ enableTranslation: true, nativeLanguage: 'en' })
                    .withOptions({ skipInstall: true, languages: ['fr', 'de'] })
                    .on('end', done);
            });
            containsLanguageFiles('fr');
            containsLanguageFiles('de');
        });
        describe('regenerating writes files for native language', () => {
            before(done => {
                helpers
                    .run(require.resolve('../generators/languages'))
                    .withLocalConfig({ enableTranslation: true, nativeLanguage: 'en', languages: ['fr', 'de'] })
                    .withOptions({ skipInstall: true })
                    .on('end', done);
            });
            containsLanguageFiles('en');
            containsLanguageFiles('fr');
            containsLanguageFiles('de');
        });
    });
});
