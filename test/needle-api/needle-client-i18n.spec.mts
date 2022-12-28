import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import fse from 'fs-extra';

import LanguagesGenerator from '../../generators/languages/index.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import { getGenerator, getTemplatePath } from '../support/index.mjs';

const { ANGULAR } = clientFrameworkTypes;

const generatorPath = getGenerator('languages');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends LanguagesGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [LanguagesGenerator.WRITING]() {
    const customPhaseSteps = {
      addElementInTranslation() {
        this.addElementTranslationKey('my_key', 'My Value', 'en');
        this.addElementTranslationKey('ma_cle', 'Ma Valeur', 'fr');
      },
      addAdminElementTranslationKey() {
        this.addAdminElementTranslationKey('my_admin_key', 'My Admin Value', 'en');
        this.addAdminElementTranslationKey('ma_cle_admin', 'Ma Valeur Admin', 'fr');
      },
      addEntityTranslationKey() {
        this.addEntityTranslationKey('my_entity_key', 'My Entity Value', 'en');
        this.addEntityTranslationKey('ma_cle_entite', 'Ma Valeur Entite', 'fr');
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API i18n: JHipster language generator with blueprint', () => {
  before(async () => {
    await helpers
      .run(generatorPath)
      .inTmpDir(dir => {
        fse.copySync(getTemplatePath('ngx-blueprint'), dir);
      })
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:languages']])
      .withPrompts({
        baseName: 'jhipster',
        clientFramework: ANGULAR,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      });
  });

  it('Assert english global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, '"my_key": "My Value",');
  });

  it('Assert french global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`, '"ma_cle": "Ma Valeur",');
  });

  it('Assert english admin global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, '"my_admin_key": "My Admin Value",');
  });

  it('Assert french admin global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`, '"ma_cle_admin": "Ma Valeur Admin",');
  });

  it('Assert english entity global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, '"my_entity_key": "My Entity Value",');
  });

  it('Assert french entity global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`, '"ma_cle_entite": "Ma Valeur Entite",');
  });
});
