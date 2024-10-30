import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.js';

import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import LanguagesGenerator from './index.js';

const generator = 'languages';

const mockBlueprintSubGen: any = class extends LanguagesGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.jhipsterContext) {
      throw new Error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [LanguagesGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      addEntityTranslationKey({ source }) {
        source.addEntityTranslationKey?.({ translationKey: 'my_entity_key', translationValue: 'My Entity Value', language: 'en' });
        source.addEntityTranslationKey?.({ translationKey: 'ma_cle_entite', translationValue: 'Ma Valeur Entite', language: 'fr' });
      },
    });
  }
};

describe('needle API i18n: JHipster language generator with blueprint', () => {
  before(async () => {
    await helpers
      .runJHipster(generator)
      .withJHipsterConfig({ baseName: 'jhipster' })
      .withOptions({ ignoreNeedlesError: true })
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        blueprint: ['myblueprint'],
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:languages' }]]);
  });

  it('Assert english entity global.json contain the new key', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, '"my_entity_key": "My Entity Value"');
  });

  it('Assert french entity global.json contain the new key', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`, '"ma_cle_entite": "Ma Valeur Entite"');
  });
});
