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
import { before, describe, exnode, expect, it } from 'expect-node';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import type EnvironmentBuilder from '../../cli/environment-builder.ts';
import { getDefaultJDLDefinitions } from '../../lib/jdl-config/jdl-runtime.ts';
import { buildJDLApplicationConfig } from '../../lib/jdl-config/jhipster-jdl-config.ts';
import BaseGenerator from '../base/index.ts';

import Generator from './index.ts';

import { getCommandHelpOutput, shouldSupportFeatures } from '#test-support';
import { createBlueprintFiles, defaultHelpers as helpers, result as runResult } from '#testing';

const generator = basename(import.meta.dirname);

const MOCKED_APP = 'jhipster:app';
const MOCKED_DOCKER_COMPOSE = 'jhipster:docker-compose';
const MOCKED_ENTITIES = 'jhipster:entities';
const MOCKED_WORKSPACES = 'jhipster:workspaces';

const mockedGenerators = [MOCKED_APP, MOCKED_ENTITIES, MOCKED_DOCKER_COMPOSE, MOCKED_WORKSPACES];

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('help', () => {
    it('should print expected information', async () => {
      expect(await getCommandHelpOutput(generator)).toMatchSnapshot();
    });
  });

  describe('for entities only jdl', () => {
    it('without baseName should reject', async () => {
      await expect(
        helpers.runJHipster(generator).withOptions({
          inline: 'entity Foo {}',
          db: 'postgresql',
        }),
      ).rejects.toThrow("The JDL object and its application's name are mandatory.");
    });

    describe('with valid parameters', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          inline: 'entity Foo {}',
          db: 'postgresql',
          baseName: 'jhipster',
        });
      });

      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });

      it('should compose with entities', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_ENTITIES);
        const { calls } = runResult.getGeneratorMock(MOCKED_ENTITIES);
        expect(calls.at(-1)?.arguments).toStrictEqual([['Foo'], expect.any(Object)]);
      });

      it('should pass commandName entities to entities generator', () => {
        const { calls } = runResult.getGeneratorMock(MOCKED_ENTITIES);
        expect(calls.at(-1)?.arguments[1]).toMatchObject({ commandName: 'entities' });
      });

      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toEqual({
          '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
        });
      });
    });

    describe('with ignoreApplication false over an application', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withJHipsterConfig({ baseName: 'jhipster' })
          .withMockedGenerators(mockedGenerators)
          .withOptions({ inline: 'entity Foo {}', ignoreApplication: false });
      });

      it('should compose with app instead of entities', () => {
        runResult.assertGeneratorNotComposed(MOCKED_ENTITIES);
        runResult.assertGeneratorComposedOnce(MOCKED_APP);
      });

      it('should merge the entities into the application', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { baseName: 'jhipster', entities: ['Foo'] } });
        runResult.assertFile('.jhipster/Foo.json');
      });
    });

    describe('with valid config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withJHipsterConfig().withMockedGenerators(mockedGenerators).withOptions({
          inline: 'entity Foo {}',
        });
      });

      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });

      it('should compose with entities', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_ENTITIES);
        const { calls } = runResult.getGeneratorMock(MOCKED_ENTITIES);
        expect(calls.at(-1)?.arguments).toStrictEqual([['Foo'], expect.any(Object)]);
      });

      it('should pass commandName entities to entities generator', () => {
        const { calls } = runResult.getGeneratorMock(MOCKED_ENTITIES);
        expect(calls.at(-1)?.arguments[1]).toMatchObject({ commandName: 'entities' });
      });

      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toEqual({
          '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
        });
      });
    });
  });

  describe('for deployment jdl', () => {
    before(async () => {
      await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
        inline: 'application { config { baseName foo } }\ndeployment { deploymentType docker-compose\n appsFolders [foo] }',
      });
    });

    it('should compose with the generator of the deploymentType, through the deployment generator', () => {
      runResult.assertGeneratorComposedOnce(MOCKED_DOCKER_COMPOSE);
    });
    it('should write the deployment config in the folder of the deploymentType', () => {
      runResult.assertJsonFileContent('docker-compose/.yo-rc.json', {
        'generator-jhipster': { deploymentType: 'docker-compose', appsFolders: ['foo'] },
      });
    });
  });

  describe('for application jdl', () => {
    describe('with valid jdl', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          inline: 'application { }',
        });
      });

      it('should not compose with entities', () => {
        runResult.assertGeneratorNotComposed(MOCKED_ENTITIES);
      });
      it('should compose with app', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_APP);
        expect(runResult.getGeneratorMock(MOCKED_APP).calls[0].arguments).toStrictEqual([
          [],
          expect.not.objectContaining({ applicationWithEntities: expect.any(Object) }),
        ]);
      });
      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });

    describe('with a jdl file outside the destination', () => {
      before(async () => {
        const jdlFile = join(mkdtempSync(join(tmpdir(), 'jhipster-jdl-')), 'app.jdl');
        writeFileSync(jdlFile, 'application { config { baseName outside } }');
        await helpers
          .runJHipster(generator)
          .withMockedGenerators(mockedGenerators)
          .withArguments([jdlFile])
          .withOptions({ skipSampleRepository: true });
      });

      it('should read it where it is', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_APP);
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { baseName: 'outside' } });
      });
    });

    describe('run through the environment, with a blueprint declaring an application option', () => {
      // A blueprint app generator declaring an option of the jdl, which only the configs of its command know.
      const blueprintFiles = createBlueprintFiles('generator-jhipster-foo', {
        generator: 'app',
        generatorContent: `export const createGenerator = async env => {
  const BaseGenerator = await env.requireGenerator('jhipster:base');
  return class extends BaseGenerator {};
};
export const command = { configs: { fooOption: { jdl: { type: 'string', tokenType: 'NAME' }, scope: 'storage' } } };
`,
      });
      const inline = 'application { config { baseName foo fooOption bar } }';

      it('should accept the option of the blueprint', async () => {
        await helpers
          .runJHipster(generator)
          .withFiles(blueprintFiles)
          .withLookups({ localOnly: true })
          .commitFiles()
          .withOptions({ jsonOnly: true, blueprints: 'foo', inline });
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { fooOption: 'bar' } });
      });

      it('should refuse the option without the blueprint', async () => {
        await expect(
          helpers
            .runJHipster(generator)
            .withFiles(blueprintFiles)
            .withLookups({ localOnly: true })
            .commitFiles()
            .withOptions({ jsonOnly: true, inline }),
        ).rejects.toThrow(/Unknown application option: fooOption/);
      });
    });

    describe('with blueprints option and an application without blueprints', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedGenerators(['jhipster-foo:other'])
          .withOptions({ jsonOnly: true, blueprints: 'foo', inline: 'application { config { baseName audited } }' });
      });

      it('should keep the blueprints of the option in the application config', () => {
        runResult.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': { baseName: 'audited', blueprints: [{ name: 'generator-jhipster-foo' }] },
        });
      });
    });

    describe('with blueprints option and an application with blueprints', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedGenerators(['jhipster-foo:other', 'jhipster-bar:other'])
          .withOptions({ jsonOnly: true, blueprints: 'foo', inline: 'application { config { baseName audited blueprints [bar] } }' });
      });

      it('should store the blueprints of the option and of the jdl', () => {
        runResult.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': { blueprints: [{ name: 'generator-jhipster-foo' }, { name: 'generator-jhipster-bar' }] },
        });
      });
    });

    describe('with an application declaring a blueprint', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedGenerators(['jhipster-bar:app'])
          .withOptions({ inline: 'application { config { baseName jhipster blueprints [bar] } }' });
      });

      it('should compose the application with the blueprint', () => {
        runResult.assertGeneratorComposedOnce('jhipster-bar:app');
      });
    });

    describe('with blueprint jdl with blueprint config', () => {
      before(async () => {
        await helpers.runJHipster(generator).withOptions({
          jsonOnly: true,
          inline: 'application { config { blueprints [foo, bar] } config(foo) { config fooValue } config(bar) { config barValue } }',
        });
      });

      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toMatchInlineSnapshot(`
{
  ".yo-rc.json": {
    "contents": "{
  "generator-jhipster": {
    "baseName": "jhipster",
    "blueprints": [
      {
        "name": "generator-jhipster-foo"
      },
      {
        "name": "generator-jhipster-bar"
      }
    ],
    "entities": []
  },
  "generator-jhipster-bar": {
    "config": "barValue"
  },
  "generator-jhipster-foo": {
    "config": "fooValue"
  }
}
",
    "stateCleared": "modified",
  },
}
`);
      });
    });
  });

  describe('for application jdl with custom definitions', () => {
    // The application definitions of a generator with one more option; `jdlDefinition`, application only, is deprecated.
    const application = buildJDLApplicationConfig({
      baseName: { description: 'Application name', jdl: { type: 'string', tokenType: 'NAME' }, scope: 'storage' },
      myOption: { description: 'My option', jdl: { type: 'boolean', tokenType: 'BOOLEAN' }, scope: 'storage' },
    });
    const cliDefinitions = { application: getDefaultJDLDefinitions().application };
    for (const [name, definitionsOptions] of Object.entries({
      jdlDefinitions: { jdlDefinitions: { application } },
      jdlDefinition: { jdlDefinition: application },
      // A generator composing the jdl one with `jdlDefinition`, what the cli passes forwarded.
      'jdlDefinition replacing the cli ones': { jdlDefinitions: cliDefinitions, jdlDefinition: application },
    })) {
      describe(`passed as ${name}`, () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            inline: 'application { config { baseName foo myOption true } }',
            ...definitionsOptions,
          });
        });

        it('should accept the option of the definitions', () => {
          runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { baseName: 'foo', myOption: true } });
        });
      });
    }
  });

  describe('composed by a generator passing the deprecated jdlDefinition', () => {
    // A blueprint composing the jdl generator with its application definitions; the cli ones are forwarded.
    const application = buildJDLApplicationConfig({
      baseName: { description: 'Application name', jdl: { type: 'string', tokenType: 'NAME' }, scope: 'storage' },
      myOption: { description: 'My option', jdl: { type: 'boolean', tokenType: 'BOOLEAN' }, scope: 'storage' },
    });
    class ComposingGenerator extends BaseGenerator {
      get [BaseGenerator.COMPOSING]() {
        return this.asComposingTaskGroup({
          async composeJdl() {
            await this.composeWithJHipster('jdl', { generatorOptions: { jdlDefinition: application } });
          },
        });
      }
    }

    before(async () => {
      const { application: cliApplication } = getDefaultJDLDefinitions();
      await helpers
        .run(ComposingGenerator, { namespace: 'jhipster-composing:app' })
        .withJHipsterGenerators()
        .withOptions({
          jsonOnly: true,
          inline: 'application { config { baseName foo myOption true } }',
          jdlDefinitions: { application: cliApplication },
          jdlDefinition: cliApplication,
        });
    });

    it('should accept the option of the definitions of the composing generator', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { baseName: 'foo', myOption: true } });
    });
  });

  describe('for one application and entity jdl', () => {
    describe('with valid jdl', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          inline: 'application { entities Foo } entity Foo {}',
        });
      });

      it('should not compose with entities', () => {
        runResult.assertGeneratorNotComposed(MOCKED_ENTITIES);
      });
      it('should compose with app', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_APP);
        const { calls } = runResult.getGeneratorMock(MOCKED_APP);
        expect(calls.at(-1)?.arguments).toStrictEqual([[], expect.not.objectContaining({ applicationWithEntities: expect.any(Object) })]);
      });
      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });

    describe('with --ignore-application option', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          ignoreApplication: true,
          inline: 'application { entities Foo } entity Foo {}',
        });
      });

      it('should write entity files', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
  });

  describe('for two applications and entity jdl', () => {
    describe('with valid jdl', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          inline: 'application { entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
        });
      });

      it('should not compose with entities', () => {
        runResult.assertGeneratorNotComposed(MOCKED_ENTITIES);
      });
      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });
      it('should compose with workspaces', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_WORKSPACES);
        const { calls } = runResult.getGeneratorMock(MOCKED_WORKSPACES);
        expect(calls.at(-1)?.arguments).toStrictEqual([
          [],
          expect.objectContaining({ workspacesFolders: ['jhipster', 'jhipster2'], generateApplications: expect.any(Function) }),
        ]);
      });
      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toEqual({});
      });
    });

    describe('with the createEnvBuilder option', () => {
      const run = exnode.fn();
      // A builder whose environment only records what it is asked to run.
      const createEnvBuilder = exnode.fn<typeof EnvironmentBuilder.createDefaultBuilder>(
        async () => ({ getEnvironment: () => ({ run }) }) as unknown as EnvironmentBuilder,
      );

      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedGenerators([MOCKED_APP, MOCKED_ENTITIES, MOCKED_DOCKER_COMPOSE])
          .onEnvironment(env => {
            // The adapter of the tests cannot create the adapter of another environment.
            const adapter = env.adapter as typeof env.adapter & { newAdapter: () => typeof env.adapter };
            adapter.newAdapter = () => adapter;
          })
          .withOptions({
            inline: 'application { entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
            createEnvBuilder,
          });
      });

      it('should build the environment of each application with it', () => {
        expect(createEnvBuilder).toHaveBeenCalledTimes(2);
        expect(createEnvBuilder.mock.calls.map(([envOptions]) => basename(envOptions?.cwd ?? '')).sort()).toEqual([
          'jhipster',
          'jhipster2',
        ]);
      });

      it('should run the application generator in each environment', () => {
        expect(run).toHaveBeenCalledTimes(2);
        expect(run).toHaveBeenCalledWith(['jhipster:app'], expect.objectContaining({ skipPriorities: ['prompting'] }));
      });
    });

    describe('with the blueprints option', () => {
      const run = exnode.fn();
      const createEnvBuilder = exnode.fn<typeof EnvironmentBuilder.createDefaultBuilder>(
        async () => ({ getEnvironment: () => ({ run }) }) as unknown as EnvironmentBuilder,
      );

      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedGenerators([MOCKED_APP, MOCKED_ENTITIES, MOCKED_DOCKER_COMPOSE])
          .onEnvironment(env => {
            const adapter = env.adapter as typeof env.adapter & { newAdapter: () => typeof env.adapter };
            adapter.newAdapter = () => adapter;
          })
          .withOptions({
            // The cli gives the blueprints of the current folder .yo-rc.json as the blueprints option too, and the jdl
            // definitions.
            blueprints: 'foo',
            jdlDefinitions: getDefaultJDLDefinitions(),
            inline:
              'application { config { blueprints [bar] } entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
            createEnvBuilder,
          });
      });

      it('should generate each application with the blueprints of its jdl only', () => {
        expect(run).toHaveBeenCalledTimes(2);
        for (const [, options] of run.mock.calls) {
          expect(options).not.toHaveProperty('blueprints');
          expect(options).not.toHaveProperty('blueprint');
        }
      });
    });

    describe('with the global blueprints option', () => {
      const run = exnode.fn();
      const createEnvBuilder = exnode.fn<typeof EnvironmentBuilder.createDefaultBuilder>(
        async () => ({ getEnvironment: () => ({ run }) }) as unknown as EnvironmentBuilder,
      );

      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedGenerators([MOCKED_APP, MOCKED_ENTITIES, MOCKED_DOCKER_COMPOSE])
          .onEnvironment(env => {
            const adapter = env.adapter as typeof env.adapter & { newAdapter: () => typeof env.adapter };
            adapter.newAdapter = () => adapter;
          })
          .withOptions({
            blueprints: 'foo',
            globalBlueprints: 'baz',
            jdlDefinitions: getDefaultJDLDefinitions(),
            inline:
              'application { config { blueprints [bar] } entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
            createEnvBuilder,
          });
      });

      it('should generate each application with the global blueprints', () => {
        expect(run).toHaveBeenCalledTimes(2);
        for (const [, options] of run.mock.calls) {
          expect(options).not.toHaveProperty('blueprints');
          expect(options).toMatchObject({ globalBlueprints: 'baz' });
        }
      });
    });

    describe('with --ignore-application option', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({
          ignoreApplication: true,
          inline: 'application { entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
        });
      });

      it('should compose with entities', () => {
        expect(runResult.getGeneratorComposeCount(MOCKED_ENTITIES)).toBe(2);
        const { calls } = runResult.getGeneratorMock(MOCKED_ENTITIES);
        expect(calls.at(-1)?.arguments).toStrictEqual([['Bar'], expect.any(Object)]);
      });
      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });
      it('should not compose with workspaces', () => {
        runResult.assertGeneratorNotComposed(MOCKED_WORKSPACES);
      });
      it('should write expected files', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
  });

  describe('over the configuration written before, in memory', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
        .withFiles({
          '.yo-rc.json': {
            'generator-jhipster': {
              baseName: 'jhipster',
              creationTimestamp: 1577836800000,
              lastLiquibaseTimestamp: 1577836860000,
              languages: ['en', 'fr'],
              testFrameworks: ['cypress'],
            },
          },
          '.jhipster/Foo.json': {
            name: 'Foo',
            annotations: { changelogDate: '20200101000100', custom: 'kept' },
            fields: [{ fieldName: 'removed', fieldType: 'String' }],
            pagination: 'pagination',
          },
        })
        .withOptions({
          jsonOnly: true,
          inline: 'application { config { baseName jhipster languages [pt] } entities Foo }\nentity Foo { name String }',
        });
    });

    it('should change what the jdl states and keep the rest of the configuration', () => {
      runResult.assertJsonFileContent('.yo-rc.json', {
        'generator-jhipster': {
          creationTimestamp: 1577836800000,
          lastLiquibaseTimestamp: 1577836860000,
          languages: ['pt'],
          testFrameworks: ['cypress'],
        },
      });
    });

    it('should change what the jdl states and keep the rest of the entity, its changelog date included', () => {
      const entity = JSON.parse(runResult.getSnapshot()['.jhipster/Foo.json'].contents!);
      expect(entity).toMatchObject({
        annotations: { changelogDate: '20200101000100', custom: 'kept' },
        pagination: 'pagination',
      });
      expect(entity.fields.map(({ fieldName }: { fieldName: string }) => fieldName)).toEqual(['name']);
    });
  });

  describe('--json-only option', () => {
    describe('for entities only jdl', () => {
      describe('with valid parameters', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            inline: 'entity Foo {}',
            db: 'postgresql',
            baseName: 'jhipster',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });

      describe('with valid config', () => {
        before(async () => {
          await helpers.runJHipster(generator).withJHipsterConfig().withOptions({
            jsonOnly: true,
            inline: 'entity Foo {}',
          });
        });

        it('should match files snapshot', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });
    });

    describe('for application jdl', () => {
      describe('with valid jdl', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            inline: 'application { }',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.yo-rc.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });
    });

    describe('for one application and entity jdl', () => {
      describe('with valid jdl', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            inline: 'application { entities Foo } entity Foo {}',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.yo-rc.json': expect.objectContaining({ contents: expect.stringMatching(/"entities": \[\s*"Foo"\s*]/g) }),
            '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });

      describe('with --ignore-application option', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            ignoreApplication: true,
            inline: 'application { entities Foo } entity Foo {}',
          });
        });

        it('should write entity files', () => {
          expect(runResult.getSnapshot()).toEqual({
            '.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });
    });

    describe('for two applications and entity jdl', () => {
      describe('with valid jdl', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            inline: 'application { entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toMatchSnapshot();
        });
      });

      describe('with --ignore-application option', () => {
        before(async () => {
          await helpers.runJHipster(generator).withOptions({
            jsonOnly: true,
            ignoreApplication: true,
            inline: 'application { entities Foo } entity Foo {} application { config { baseName jhipster2 } entities Bar } entity Bar',
          });
        });

        it('should write expected files', () => {
          expect(runResult.getSnapshot()).toEqual({
            'jhipster/.jhipster/Foo.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
            'jhipster2/.jhipster/Bar.json': expect.objectContaining({ contents: expect.any(String), stateCleared: 'modified' }),
          });
        });
      });
    });
  });
  describe('with a microservices stack', () => {
    const jdl = `
application { entities Foo }
entity Foo {}
application { config { baseName gatewayApp applicationType gateway } entities * }
entity Bar
`;
    describe('generating the stack', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({ inline: jdl });
      });

      it('should not compose with entities', () => {
        runResult.assertGeneratorNotComposed(MOCKED_ENTITIES);
      });
      it('should not compose with app', () => {
        runResult.assertGeneratorNotComposed(MOCKED_APP);
      });
      it('should compose with workspaces', () => {
        runResult.assertGeneratorComposedOnce(MOCKED_WORKSPACES);
        expect(runResult.getGeneratorMock(MOCKED_WORKSPACES).calls[0].arguments).toStrictEqual([
          [],
          expect.objectContaining({ workspacesFolders: ['gatewayApp', 'jhipster'], generateApplications: expect.any(Function) }),
        ]);
      });
    });
    describe('generating json', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({ inline: jdl, jsonOnly: true });
      });

      it('should generate expected config', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
  });
  describe('with a gateway', () => {
    const jdl = `
application { config { baseName gatewayApp applicationType gateway } entities * }
microservice Bar with ms
entity Bar
`;
    describe('generating json', () => {
      before(async () => {
        await helpers.runJHipster(generator).withMockedGenerators(mockedGenerators).withOptions({ inline: jdl, jsonOnly: true });
      });

      it('should generate expected config', () => {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
    });
  });
  describe('with entrypointGenerator', () => {
    const jdl = `
application { config { baseName gatewayApp applicationType gateway } }
`;
    describe('generating application', () => {
      before(async () => {
        await helpers
          .runJHipster(generator)
          .withMockedGenerators([...mockedGenerators, 'foo:bar'])
          .withOptions({
            inline: jdl,
            entrypointGenerator: 'foo:bar',
          });
      });

      it('should generate expected config', () => {
        runResult.assertGeneratorComposedOnce('foo:bar');
      });
    });
  });

  describe('importing jdl', () => {
    describe('with Entity annotations', () => {
      before(async () => {
        await helpers
          .runJDL(
            `
application { config { baseName jhipster } entities * }

@EntityFalse(false)
@EntityZero(0)
@EntityEmpty("")
entity AnnotatedEntity {
  @FieldFalse(false)
  @FieldZero(0)
  @FieldEmpty("")
  annotatedField String
}

entity RelatedEntity

relationship ManyToOne {
  @RelationshipFalse(false)
  @RelationshipZero(0)
  @RelationshipEmpty("")
  RelatedEntity to AnnotatedEntity
}
`,
          )
          .withOptions({
            jsonOnly: true,
            skipApplication: true,
          });
      });

      it('should generate expected Entity config', () => {
        expect(runResult.getSnapshot('**/.jhipster/**')).toMatchInlineSnapshot(`
{
  ".jhipster/AnnotatedEntity.json": {
    "contents": "{
  "annotations": {
    "entityEmpty": "",
    "entityFalse": false,
    "entityZero": 0
  },
  "applications": [
    "jhipster"
  ],
  "fields": [
    {
      "fieldName": "annotatedField",
      "fieldType": "String",
      "options": {
        "fieldEmpty": "",
        "fieldFalse": false,
        "fieldZero": 0
      }
    }
  ],
  "name": "AnnotatedEntity",
  "relationships": [
    {
      "options": {
        "relationshipEmpty": "",
        "relationshipFalse": false,
        "relationshipZero": 0
      },
      "otherEntityName": "relatedEntity",
      "otherEntityRelationshipName": "annotatedEntity",
      "relationshipName": "relatedEntity",
      "relationshipSide": "right",
      "relationshipType": "one-to-many"
    }
  ]
}
",
    "stateCleared": "modified",
  },
  ".jhipster/RelatedEntity.json": {
    "contents": "{
  "annotations": {},
  "applications": [
    "jhipster"
  ],
  "fields": [],
  "name": "RelatedEntity",
  "relationships": [
    {
      "otherEntityName": "annotatedEntity",
      "otherEntityRelationshipName": "relatedEntity",
      "relationshipName": "annotatedEntity",
      "relationshipSide": "left",
      "relationshipType": "many-to-one"
    }
  ]
}
",
    "stateCleared": "modified",
  },
}
`);
      });
    });
  });
});
