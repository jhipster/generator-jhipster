import { defaultHelpers as helpers, result as runResult } from '../support/helpers.mjs';

import LanguagesGenerator from '../../generators/languages/index.mjs';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.mjs';
import { getGenerator } from '../support/index.mjs';

const generatorPath = getGenerator('languages');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends LanguagesGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.jhipsterContext) {
      throw new Error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [LanguagesGenerator.WRITING]() {
    const customPhaseSteps = {
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
      .withJHipsterConfig({ baseName: 'jhipster' })
      .withOptions({ ignoreNeedlesError: true })
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        blueprint: 'myblueprint',
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:languages' }]]);
  });

  it('Assert english entity global.json contain the new key', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, '"my_entity_key": "My Entity Value",');
  });

  it('Assert french entity global.json contain the new key', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`, '"ma_cle_entite": "Ma Valeur Entite",');
  });
});
