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

import { APPLICATION_TYPE_MONOLITH } from '../../lib/core/application-types.ts';
import {
  authenticationTypes,
  buildToolTypes,
  cacheTypes,
  clientFrameworkTypes,
  databaseTypes,
  testFrameworkTypes,
} from '../../lib/jhipster/index.ts';
import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';

const GENERATOR_APP = 'app';

const { H2_DISK, MYSQL, SQL } = databaseTypes;
const { EHCACHE } = cacheTypes;
const { JWT } = authenticationTypes;
const { CYPRESS } = testFrameworkTypes;
const { ANGULAR } = clientFrameworkTypes;
const { MAVEN } = buildToolTypes;

const mockedComposedGenerators = ['jhipster:common', 'jhipster:server', 'jhipster:languages', 'jhipster:entity'];

describe('generator - client - prompts', () => {
  describe('clientTestFrameworks prompt', () => {
    describe('with cypress value', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_APP)
          .withSharedApplication({ getWebappTranslation: () => 'translations' })
          .withAnswers({
            baseName: 'sampleMysql',
            packageName: 'com.mycompany.myapp',
            applicationType: APPLICATION_TYPE_MONOLITH,
            databaseType: SQL,
            devDatabaseType: H2_DISK,
            prodDatabaseType: MYSQL,
            cacheProvider: EHCACHE,
            authenticationType: JWT,
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['en', 'fr'],
            clientTestFrameworks: [CYPRESS],
            buildTool: MAVEN,
            clientFramework: ANGULAR,
            clientTheme: 'none',
          })
          .withSkipWritingPriorities()
          .withMockedGenerators(mockedComposedGenerators);
      });

      it('should write testFrameworks with cypress value to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { testFrameworks: [CYPRESS] } });
      });
    });
  });
});
