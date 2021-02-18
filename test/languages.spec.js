const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-constants');
const EnvironmentBuilder = require('../cli/environment-builder');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;

const createClientProject = options =>
  helpers
    .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
    .withOptions({
      fromCli: true,
      skipInstall: true,
      defaults: true,
      testFrameworks: ['protractor'],
      ...options,
    })
    .run();

const containsLanguageFiles = languageValue => {
  it(`creates expected files for ${languageValue}`, () => {
    assert.file([
      `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/activate.json`,
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
      `${SERVER_MAIN_RES_DIR}i18n/messages_${languageValue.replace(/-/g, '_').replace(/_[a-z]+$/g, lang => lang.toUpperCase())}.properties`,
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

const noLanguageFiles = languageValue => {
  it(`should not create files for ${languageValue}`, () => {
    assert.noFile([
      `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/activate.json`,
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
      `${SERVER_MAIN_RES_DIR}i18n/messages_${languageValue.replace(/-/g, '_').replace(/_[a-z]+$/g, lang => lang.toUpperCase())}.properties`,
    ]);
    assert.noFile([`${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/gateway.json`]);
  });
  it('should not create global.json', () => {
    assert.noFile(`${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/global.json`);
  });
};

const containsLanguageInVueStore = languageValue => {
  it(`add language ${languageValue} into translation-store.ts, webpack.common.js`, () => {
    const langKey = languageValue.includes('-') ? `'${languageValue}'` : `${languageValue}`;
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/shared/config/store/translation-store.ts`, `${langKey}: { name:`);
    assert.fileContent(
      `${CLIENT_WEBPACK_DIR}webpack.common.js`,
      `{ pattern: './src/main/webapp/i18n/${languageValue}/*.json', fileName: './i18n/${languageValue}.json' }`
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
  context('should not create i18n files', () => {
    describe('for already generated native language', () => {
      before(done => {
        helpers
          .run(require.resolve('../generators/languages'))
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['fr'] })
          .withOptions({ skipInstall: true })
          .on('end', done);
      });
      noLanguageFiles('fr');
    });
    describe('for already generated languages', () => {
      before(done => {
        helpers
          .run(require.resolve('../generators/languages'))
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['en', 'fr'] })
          .withOptions({ skipInstall: true, skipPrompts: true })
          .on('end', done);
      });
      noLanguageFiles('fr');
      noLanguageFiles('en');
    });
  });
  context('should create default i18n files for the native language', () => {
    describe('using prompts', () => {
      before(done => {
        helpers
          .run(require.resolve('../generators/languages'))
          .withOptions({ skipInstall: true })
          .withPrompts({
            enableTranslation: true,
            nativeLanguage: 'fr',
            languages: [],
          })
          .on('end', done);
      });
      containsLanguageFiles('fr');
    });
    describe('using options', () => {
      before(done => {
        helpers
          .run(require.resolve('../generators/languages'))
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: [] })
          .withOptions({ skipInstall: true })
          .on('end', done);
      });
      containsLanguageFiles('fr');
    });
    describe('when regenerating', () => {
      before(done => {
        helpers
          .run(require.resolve('../generators/languages'))
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['fr'] })
          .withOptions({ skipInstall: true, skipPrompts: true, regenerate: true })
          .on('end', done);
      });
      containsLanguageFiles('fr');
    });
  });
  context('should create default i18n files for the native language and an additional language', () => {
    describe('by default', () => {
      before(done => {
        helpers.run(require.resolve('../generators/languages')).withOptions({ skipInstall: true, skipPrompts: true }).on('end', done);
      });
      containsLanguageFiles('fr');
      containsLanguageFiles('en');
    });
    describe('using prompts', () => {
      before(done => {
        helpers
          .run(require.resolve('../generators/languages'))
          .withOptions({ skipInstall: true })
          .withPrompts({
            enableTranslation: true,
            nativeLanguage: 'fr',
            languages: ['en'],
          })
          .on('end', done);
      });
      containsLanguageFiles('fr');
      containsLanguageFiles('en');
    });
    describe('using options', () => {
      before(done => {
        helpers
          .run(require.resolve('../generators/languages'))
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr' })
          .withOptions({ skipInstall: true, languages: ['en'] })
          .on('end', done);
      });
      containsLanguageFiles('fr');
      containsLanguageFiles('en');
    });
    describe('when regenerating', () => {
      before(done => {
        helpers
          .run(require.resolve('../generators/languages'))
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['en', 'fr'] })
          .withOptions({ skipInstall: true, skipPrompts: true, regenerate: true })
          .on('end', done);
      });
      containsLanguageFiles('fr');
      containsLanguageFiles('en');
    });
  });
  context('Creates default i18n files for more than one language', () => {
    describe('with prompts', () => {
      before(done => {
        helpers
          .run(require.resolve('../generators/languages'))
          .withOptions({ skipInstall: true })
          .withPrompts({
            enableTranslation: true,
            nativeLanguage: 'fr',
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
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr' })
          .withOptions({ skipInstall: true, languages: ['fr', 'de'] })
          .on('end', done);
      });
      containsLanguageFiles('fr');
      containsLanguageFiles('de');
    });
  });

  context('Creates default i18n files for Vue applications', () => {
    describe('using prompts', () => {
      before(() =>
        createClientProject({
          localConfig: { clientFramework: 'vue', enableTranslation: true, nativeLanguage: 'en' },
        }).then(result =>
          helpers
            .create('jhipster:languages', {}, { createEnv: EnvironmentBuilder.createEnv })
            .setDir(result.cwd)
            .withOptions({ skipInstall: true })
            .withPrompts({
              languages: ['fr', 'de'],
            })
            .run()
        )
      );
      describe('for native language translation', () => {
        containsLanguageFiles('en');
        containsLanguageInVueStore('en');
      });
      describe('for additional languages translations', () => {
        containsLanguageFiles('fr');
        containsLanguageInVueStore('fr');
        containsLanguageFiles('de');
        containsLanguageInVueStore('de');
      });
    });

    describe('using options', () => {
      before(() =>
        createClientProject({
          localConfig: { clientFramework: 'vue', enableTranslation: true, nativeLanguage: 'en' },
        }).then(result =>
          helpers
            .create('jhipster:languages', {}, { createEnv: EnvironmentBuilder.createEnv })
            .setDir(result.cwd)
            .withOptions({ skipInstall: true, languages: ['fr', 'de'] })
            .run()
        )
      );
      describe('for native language translation', () => {
        containsLanguageFiles('en');
        containsLanguageInVueStore('en');
      });
      describe('for additional languages translations', () => {
        containsLanguageFiles('fr');
        containsLanguageInVueStore('fr');
        containsLanguageFiles('de');
        containsLanguageInVueStore('de');
      });
    });
  });
});
