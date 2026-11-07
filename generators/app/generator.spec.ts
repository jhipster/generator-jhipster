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
import { before, describe, expect, it } from 'expect-node';

import { CONTEXT_DATA_SOURCE_KEY } from '../base-simple-application/support/index.ts';

import type Generator from './generator.ts';

import { testBlueprintSupport } from '#test-support';
import { createTestHelpers, typedResult } from '#testing';

const helpers = createTestHelpers<Generator>({
  importMeta: import.meta,
});
const result = typedResult<Generator>();
const getJHipsterConfig = (): { creationTimestamp: number } => (result.fs.readJSON('.yo-rc.json') as any)['generator-jhipster'];
const getSource = (): Record<string, unknown> | undefined => result.env.getContextMap(result.cwd).get(CONTEXT_DATA_SOURCE_KEY);

describe(`generator - ${helpers.commandName}`, () => {
  it('should support features parameter', async () => {
    expect(await helpers.forwardsFeaturesParameter()).toBe(true);
  });
  describe('help', () => {
    it('should print expected information', async () => {
      expect(await helpers.getCommandHelpOutput()).toMatchSnapshot();
    });
  });
  describe('blueprint support', () => testBlueprintSupport(helpers.commandName!));

  describe('prompting', () => {
    describe('vue clientFramework', () => {
      before(async () => {
        await helpers.runJHipster().withAnswers({ clientFramework: 'vue' }).withSkipWritingPriorities();
      });

      it('should write clientFramework', () => {
        result.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': {
            clientFramework: 'vue',
          },
        });
      });
      it('should set clientBundler to vite', () => {
        expect(result.application).toMatchObject({
          clientBundler: 'vite',
        });
      });
    });
  });

  describe('with an application type of a blueprint', () => {
    describe('composing', () => {
      before(async () => {
        await helpers
          .runJHipster()
          .withMockedJHipsterGenerators()
          // @ts-expect-error a type a blueprint declares, out of the official ones
          .withJHipsterConfig({ applicationType: 'expo' });
      });

      it('should not compose with the generators of the application', () => {
        result.assertGeneratorNotComposed('jhipster:common');
        result.assertGeneratorNotComposed('jhipster:server');
        result.assertGeneratorNotComposed('jhipster:client');
      });
    });

    describe('writing', () => {
      before(async () => {
        // @ts-expect-error a type a blueprint declares, out of the official ones
        await helpers.runJHipster().withJHipsterConfig({ applicationType: 'expo' });
      });

      it('should write the config only', () => {
        expect(Object.keys(result.getStateSnapshot()).sort()).toEqual(['.yo-rc.json']);
      });
      it('should not bootstrap the server nor the client', () => {
        expect(getSource()?.editJavaFile).toBeUndefined();
        expect(result.application?.frontendAppName).toBeUndefined();
      });
    });
  });

  describe('with an application type of a blueprint without creationTimestamp', () => {
    describe('reproducible', () => {
      before(async () => {
        // @ts-expect-error a type a blueprint declares, out of the official ones
        await helpers.runJHipster().withJHipsterConfig({ applicationType: 'expo', creationTimestamp: undefined });
      });

      it('should write the reproducible creationTimestamp of the base name', () => {
        const { creationTimestamp } = getJHipsterConfig();
        expect(creationTimestamp).toBeGreaterThan(new Date(2023, 11, 1).getTime());
        expect(creationTimestamp).toBeLessThanOrEqual(new Date(2024, 0, 1).getTime());
      });
    });

    describe('not reproducible', () => {
      const startTime = Date.now();
      before(async () => {
        await helpers
          .runJHipster()
          // @ts-expect-error a type a blueprint declares, out of the official ones
          .withJHipsterConfig({ applicationType: 'expo', creationTimestamp: undefined })
          .withOptions({ reproducible: false });
      });

      it('should write the current time as creationTimestamp', () => {
        expect(getJHipsterConfig().creationTimestamp).toBeGreaterThanOrEqual(startTime);
      });
    });
  });

  describe('with an official application type', () => {
    before(async () => {
      await helpers.runJHipster().withJHipsterConfig({ applicationType: 'monolith' }).withSkipWritingPriorities();
    });

    it('should bootstrap the server and the client', () => {
      expect(getSource()?.editJavaFile).toBeDefined();
      expect(result.application?.frontendAppName).toBeDefined();
    });
  });

  describe('with skipUserRegistration', () => {
    for (const clientFramework of ['angular', 'react', 'vue'] as const) {
      describe(`with ${clientFramework}`, () => {
        before(async () => {
          await helpers.runJHipster().withJHipsterConfig({ clientFramework, skipUserRegistration: true, testFrameworks: ['cypress'] });
        });

        it('should not write the registration nor the activation of an account', () => {
          const files = Object.keys(result.getStateSnapshot());
          // The settings of an account use the messages of the registration.
          expect(files.filter(file => /\/(register|activate)[/.-]|activationEmail/.test(file))).toEqual([
            'src/main/webapp/i18n/en/register.json',
          ]);
        });

        it('should write the other pages of an account', () => {
          const files = Object.keys(result.getStateSnapshot());
          expect(files.filter(file => /password-reset|reset-password/.test(file))).not.toEqual([]);
        });
      });
    }
  });

  describe('jdlStore', () => {
    describe('with application', () => {
      before(async () => {
        await helpers
          .runJHipster()
          .withJHipsterConfig({
            jdlStore: 'app.jdl',
            skipServer: true,
            skipClient: true,
          })
          .withOptions({ refreshOnCommit: true })
          .withSkipWritingPriorities();
      });

      it('should match snapshot', () => {
        expect(result.getSnapshot()).toMatchSnapshot();
      });
    });
    describe('with application and entities', () => {
      before(async () => {
        await helpers
          .runJHipster()
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
        expect(result.getSnapshot()).toMatchSnapshot();
      });
    });

    describe('with incremental changelog application and entities', () => {
      before(async () => {
        await helpers
          .runJHipster()
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
        expect(result.getSnapshot()).toMatchSnapshot();
      });
    });
  });
  describe('questions', () => {
    describe('without answers', () => {
      before(async () => {
        await helpers.runJHipster().withSkipWritingPriorities();
      });

      it('should match order', () => {
        expect(result.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
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
          .runJHipster()
          .withAnswers({ applicationType: 'gateway', buildTool: 'gradle', cacheProvider: 'no' })
          .withSkipWritingPriorities();
      });

      it('should match order', () => {
        expect(result.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
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
        await helpers.runJHipster().withAnswers({ applicationType: 'microservice', databaseType: 'mongodb' }).withSkipWritingPriorities();
      });

      it('should match order', () => {
        expect(result.askedQuestions.map(({ name }) => name)).toMatchInlineSnapshot(`
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
