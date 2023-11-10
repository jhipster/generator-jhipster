import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { basicHelpers, defaultHelpers as helpers, result as runResult } from '../../test/support/index.mjs';

import { CLIENT_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { supportedLanguages } from './support/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatorPath = join(__dirname, 'index.mjs');

const createClientProject = options =>
  basicHelpers
    .runJHipster('app')
    .withJHipsterConfig()
    .withOptions({
      ...options,
    });

const containsLanguageFiles = languageValue => {
  it(`creates expected files for ${languageValue}`, () => {
    runResult.assertFile([
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
    runResult.assertNoFile([`${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/gateway.json`]);
  });
  it('contains 3 needles in global.json', () => {
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/global.json`,
      '"jhipster-needle-menu-add-element": "JHipster will add additional menu entries here (do not translate!)"',
    );
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/global.json`,
      '"jhipster-needle-menu-add-entry": "JHipster will add additional entities here (do not translate!)"',
    );
    runResult.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/global.json`,
      '"jhipster-needle-menu-add-admin-element": "JHipster will add additional menu entries here (do not translate!)"',
    );
  });
};

const noLanguageFiles = languageValue => {
  it(`should not create files for ${languageValue}`, () => {
    runResult.assertNoFile([
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
    runResult.assertNoFile([`${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/gateway.json`]);
  });
  it('should not create global.json', () => {
    runResult.assertNoFile(`${CLIENT_MAIN_SRC_DIR}i18n/${languageValue}/global.json`);
  });
};

const containsLanguageInVueStore = languageValue => {
  it(`add language ${languageValue} into translation-store.ts`, () => {
    const langKey = languageValue.includes('-') ? `'${languageValue}'` : `${languageValue}`;
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}app/shared/config/languages.ts`, `${langKey}: { name:`);
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
            .withAnswers({
              enableTranslation: true,
              nativeLanguage: language.languageTag,
              languages: [language.languageTag],
            })
            .run(),
        );
        containsLanguageFiles(language.languageTag);
      });
      describe(`with options for ${language.name}`, () => {
        before(() =>
          helpers
            .run(generatorPath)
            .withArguments([language.languageTag])
            .withJHipsterConfig({ enableTranslation: true, nativeLanguage: language.languageTag })
            .withOptions({ ignoreNeedlesError: true }),
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
          .withOptions({ commandName: 'languages', ignoreNeedlesError: true }),
      );
      noLanguageFiles('fr');
    });
    describe('for already generated languages', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withJHipsterConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['en', 'fr'] })
          .withOptions({ commandName: 'languages', ignoreNeedlesError: true }),
      );
      noLanguageFiles('fr');
      noLanguageFiles('en');
    });
  });
  context('should create default i18n files for the native language', () => {
    describe('using prompts', () => {
      before(() =>
        helpers.run(generatorPath).withOptions({ ignoreNeedlesError: true }).withAnswers({
          enableTranslation: true,
          nativeLanguage: 'fr',
          languages: [],
        }),
      );
      containsLanguageFiles('fr');
    });
    describe('using arguments', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withLocalConfig({ enableTranslation: true })
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ nativeLanguage: 'fr', baseName: 'jhipster' }),
      );
      containsLanguageFiles('fr');
    });
    describe('when regenerating', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withLocalConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['fr'] })
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ skipPrompts: true, regenerate: true, baseName: 'jhipster' }),
      );
      containsLanguageFiles('fr');
    });
  });
  context('should create default i18n files for the native language and an additional language', () => {
    describe('by default', () => {
      before(() => helpers.run(generatorPath).withJHipsterConfig().withOptions({ ignoreNeedlesError: true }));
      containsLanguageFiles('en');
    });
    describe('using prompts', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withOptions({ ignoreNeedlesError: true })
          .withAnswers({
            enableTranslation: true,
            nativeLanguage: 'fr',
            languages: ['en'],
          }),
      );
      it('creates expected configuration values', () => {
        runResult.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': {
            languages: ['fr', 'en'],
            nativeLanguage: 'fr',
            enableTranslation: true,
          },
        });
      });
      containsLanguageFiles('fr');
      containsLanguageFiles('en');
    });
    describe('using arguments', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withLocalConfig({ enableTranslation: true })
          .withArguments(['en'])
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ nativeLanguage: 'fr', baseName: 'jhipster' }),
      );
      containsLanguageFiles('fr');
      containsLanguageFiles('en');
    });
    describe('when regenerating', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withJHipsterConfig({ enableTranslation: true, nativeLanguage: 'fr', languages: ['en', 'fr'] })
          .withOptions({ ignoreNeedlesError: true })
          .withOptions({ skipPrompts: true, regenerate: true, baseName: 'jhipster' }),
      );
      it('creates expected configuration values', () => {
        runResult.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': {
            languages: ['fr', 'en'],
            nativeLanguage: 'fr',
            enableTranslation: true,
          },
        });
      });
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
          .withAnswers({
            enableTranslation: true,
            nativeLanguage: 'fr',
            languages: ['fr', 'de'],
          }),
      );
      containsLanguageFiles('fr');
      containsLanguageFiles('de');
    });
    describe('with options', () => {
      before(() =>
        helpers
          .run(generatorPath)
          .withJHipsterConfig({ enableTranslation: true, nativeLanguage: 'en' })
          .withOptions({ ignoreNeedlesError: true })
          .withArguments(['fr', 'de'])
          .withOptions({ baseName: 'jhipster' }),
      );
      it('creates expected configuration values', () => {
        runResult.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': {
            languages: ['en', 'fr', 'de'],
            nativeLanguage: 'en',
            enableTranslation: true,
          },
        });
      });
      containsLanguageFiles('fr');
      containsLanguageFiles('de');
    });
  });

  context('Creates default i18n files for Vue applications', () => {
    describe('using prompts', () => {
      before(async () => {
        const result = await createClientProject().withJHipsterConfig({
          clientFramework: 'vue',
          enableTranslation: true,
          nativeLanguage: 'en',
        });
        await result
          .create('jhipster:languages')
          .withAnswers({
            languages: ['fr', 'de'],
          })
          .withOptions({
            commandName: 'languages',
          })
          .run();
      });
      it('creates expected configuration values', () => {
        runResult.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': {
            languages: ['en', 'fr', 'de'],
            nativeLanguage: 'en',
            enableTranslation: true,
          },
        });
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

    describe('using arguments', () => {
      before(async () => {
        const result = await createClientProject().withJHipsterConfig({
          clientFramework: 'vue',
          enableTranslation: true,
          nativeLanguage: 'en',
        });
        await result.create('jhipster:languages').withArguments(['fr', 'de']).withOptions({ baseName: 'jhipster' }).run();
      });
      it('creates expected configuration values', () => {
        runResult.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': {
            languages: ['en', 'fr', 'de'],
            nativeLanguage: 'en',
            enableTranslation: true,
          },
        });
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
