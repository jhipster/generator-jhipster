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
import { before, describe, expect, it } from 'esmocha';
import { basename } from 'node:path';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { getCommandHelpOutput, shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.ts';

import Generator from './index.ts';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('help', () => {
    it('should print expected information', async () => {
      expect(await getCommandHelpOutput(generator)).toMatchSnapshot();
    });
  });
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('jdlStore', () => {
    describe('with application', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig({
            jdlStore: 'app.jdl',
            skipServer: true,
            skipClient: true,
          })
          .withOptions({ refreshOnCommit: true })
          .withSkipWritingPriorities();
      });

      it('should match snapshot', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
    describe('with application and entities', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig(
            {
              jdlStore: 'app.jdl',
              skipServer: true,
              skipClient: true,
            },
            [{ name: 'Foo' }, { name: 'Bar' }],
          )
          .withOptions({ refreshOnCommit: true })
          .withSkipWritingPriorities();
      });

      it('should match snapshot', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });

    describe('with incremental changelog application and entities', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig(
            {
              jdlStore: 'app.jdl',
              skipServer: true,
              skipClient: true,
              incrementalChangelog: true,
            },
            [{ name: 'Foo' }, { name: 'Bar' }],
          )
          .withOptions({ refreshOnCommit: true })
          .withSkipWritingPriorities();
      });

      it('should match snapshot', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
  });
  describe('questions', () => {
    describe('without answers', () => {
      before(async () => {
        await helpers.runJHipster(generator).withSkipWritingPriorities();
      });

      it('should match order', () => {
        expect(runResult.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
[
  "baseName",
  "applicationType",
  "packageName",
  "buildTool",
  "reactive",
  "authenticationType",
  "serverTestFrameworks",
  "databaseType",
  "prodDatabaseType",
  "devDatabaseType",
  "cacheProvider",
  "enableHibernateCache",
  "serverSideOptions",
  "clientFramework",
  "clientTestFrameworks",
  "withAdminUi",
  "clientTheme",
  "enableTranslation",
  "nativeLanguage",
  "languages",
]
`);
      });
    });

    describe('with gateway, gradle and no cacheProvider', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withAnswers({ applicationType: 'gateway', buildTool: 'gradle', cacheProvider: 'no' })
          .withSkipWritingPriorities();
      });

      it('should match order', () => {
        expect(runResult.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
[
  "baseName",
  "applicationType",
  "packageName",
  "buildTool",
  "serverPort",
  "serviceDiscoveryType",
  "authenticationType",
  "serverTestFrameworks",
  "databaseType",
  "prodDatabaseType",
  "devDatabaseType",
  "serverSideOptions",
  "enableGradleDevelocity",
  "gradleDevelocityHost",
  "clientFramework",
  "microfrontend",
  "clientTestFrameworks",
  "withAdminUi",
  "clientTheme",
  "enableTranslation",
  "nativeLanguage",
  "languages",
]
`);
      });
    });

    describe('with microservice', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withAnswers({ applicationType: 'microservice', databaseType: 'mongodb' })
          .withSkipWritingPriorities();
      });

      it('should match order', () => {
        expect(runResult.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
[
  "baseName",
  "applicationType",
  "packageName",
  "buildTool",
  "reactive",
  "serverPort",
  "serviceDiscoveryType",
  "authenticationType",
  "feignClient",
  "serverTestFrameworks",
  "databaseType",
  "cacheProvider",
  "serverSideOptions",
  "clientFramework",
  "enableTranslation",
  "nativeLanguage",
  "languages",
]
`);
      });
    });
  });
});
