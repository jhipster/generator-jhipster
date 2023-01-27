import assert from 'yeoman-assert';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { basicHelpers, skipPrettierHelpers as helpers } from '../../test/support/helpers.mjs';

import { CLIENT_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, CLIENT_WEBPACK_DIR } from '../generator-constants.mjs';
import EnvironmentBuilder from '../../cli/environment-builder.mjs';
import { supportedLanguages } from './support/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatorPath = join(__dirname, 'index.mjs');

const createClientProject = async options =>
  basicHelpers
    .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
    .withOptions({
      skipInstall: true,
      defaults: true,
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

describe('generator - languages', () => {
  context('Creates default i18n files', () => {
    supportedLanguages.forEach(language => {
      describe(`with prompts for ${language.name}`, () => {
        before(() =>
          helpers
            .create(generatorPath)
            .withOptions({ ignoreNeedlesError: true })
            .withPrompts({
              enableTranslation: true,
              nativeLanguage: language.languageTag,
              languages: [language.languageTag],
            })
            .run()
        );
        containsLanguageFiles(language.languageTag);
      });
      describe(`with options for ${language.name}`, () => {
        before(() =>
          helpers
            .run(generatorPath)
            .withOptions({ ignoreNeedlesError: true })
            .withLocalConfig({ enableTranslation: true, nativeLanguage: language.languageTag })
            .withOptions({ skipInstall: true, languages: [language.languageTag], baseName: 'jhipster' })
        );
        containsLanguageFiles(language.languageTag);
      });
    });
  });
  context('should not create i18n files', () => {
    describe('for already generated native language', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withJHipsterConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['fr'], baseName: 'jhipster' })
          .withOptions({ ignoreNeedlesError: true })
      );
      noLanguageFiles('fr');
    });
    describe('for already generated languages', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withJHipsterConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['en', 'fr'] })
          .withOptions({ ignoreNeedlesError: true, skipInstall: true, skipPrompts: true, baseName: 'jhipster' })
      );
      noLanguageFiles('fr');
      noLanguageFiles('en');
    });
  });
  context('should create default i18n files for the native language', () => {
    describe('using prompts', () => {
      before(() =>
        helpers.run(generatorPath).withOptions({ ignoreNeedlesError: true }).withPrompts({
          enableTranslation: true,
          nativeLanguage: 'fr',
          languages: [],
        })
      );
      containsLanguageFiles('fr');
    });
    describe('using options', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withLocalConfig({ enableTranslation: true })
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ skipInstall: true, nativeLanguage: 'fr', baseName: 'jhipster' })
      );
      containsLanguageFiles('fr');
    });
    describe('when regenerating', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['fr'] })
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ skipInstall: true, skipPrompts: true, regenerate: true, baseName: 'jhipster' })
      );
      containsLanguageFiles('fr');
    });
  });
  context('should create default i18n files for the native language and an additional language', () => {
    describe('by default', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ skipInstall: true, reproducible: true, baseName: 'jhipster' })
      );
      containsLanguageFiles('en');
    });
    describe('using prompts', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withOptions({ ignoreNeedlesError: true })
          .withPrompts({
            enableTranslation: true,
            nativeLanguage: 'fr',
            languages: ['en'],
          })
      );
      containsLanguageFiles('fr');
      containsLanguageFiles('en');
    });
    describe('using options', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withLocalConfig({ enableTranslation: true })
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ skipInstall: true, nativeLanguage: 'fr', languages: ['en'], baseName: 'jhipster' })
      );
      containsLanguageFiles('fr');
      containsLanguageFiles('en');
    });
    describe('when regenerating', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['en', 'fr'] })
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ skipInstall: true, skipPrompts: true, regenerate: true, baseName: 'jhipster' })
      );
      containsLanguageFiles('fr');
      containsLanguageFiles('en');
    });
  });
  context('Creates default i18n files for more than one language', () => {
    describe('with prompts', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withOptions({ ignoreNeedlesError: true })
          .withPrompts({
            enableTranslation: true,
            nativeLanguage: 'fr',
            languages: ['fr', 'de'],
          })
      );
      containsLanguageFiles('fr');
      containsLanguageFiles('de');
    });
    describe('with options', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'en' })
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ skipInstall: true, languages: ['fr', 'de'], baseName: 'jhipster' })
      );
      containsLanguageFiles('fr');
      containsLanguageFiles('de');
    });
  });

  context('Creates default i18n files for Vue applications', () => {
    describe('using prompts', () => {
      before(async () => {
        const result = await createClientProject({
          localConfig: { clientFramework: 'vue', enableTranslation: true, nativeLanguage: 'en' },
        });
        await result
          .create('jhipster:languages', {}, { createEnv: EnvironmentBuilder.createEnv })
          .withPrompts({
            languages: ['fr', 'de'],
          })
          .run();
      });
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
      before(async () => {
        const result = await createClientProject({
          localConfig: { clientFramework: 'vue', enableTranslation: true, nativeLanguage: 'en' },
        });
        await result
          .create('jhipster:languages', {}, { createEnv: EnvironmentBuilder.createEnv })
          .withOptions({ skipInstall: true, languages: ['fr', 'de'], baseName: 'jhipster' })
          .run();
      });
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
