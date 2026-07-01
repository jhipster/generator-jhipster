/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { before, describe, it } from 'esmocha';

import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.ts';

const generator = 'languages';

const addNeedlesTask = asPostWritingTask(function ({ source }) {
  source.addEntityTranslationKey?.({ translationKey: 'my_entity_key', translationValue: 'My Entity Value', language: 'en' });
  source.addEntityTranslationKey?.({ translationKey: 'ma_cle_entite', translationValue: 'Ma Valeur Entite', language: 'fr' });
});

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
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      })
      .withTask('postWriting', addNeedlesTask);
  });

  it('Assert english entity global.json contain the new key', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, '"my_entity_key": "My Entity Value"');
  });

  it('Assert french entity global.json contain the new key', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`, '"ma_cle_entite": "Ma Valeur Entite"');
  });
});
