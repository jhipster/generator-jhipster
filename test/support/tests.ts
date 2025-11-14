import { before, describe, expect, it } from 'esmocha';
import { existsSync } from 'node:fs';

import sinon from 'sinon';

import { buildJHipster } from '../../cli/index.ts';
import type JHipsterCommand from '../../cli/jhipster-command.js';
import { ENTITY_PRIORITY_NAMES, PRIORITY_NAMES, PRIORITY_NAMES_LIST } from '../../generators/base-application/priorities.ts';
import type CoreGenerator from '../../generators/base-core/index.ts';
import { CONTEXT_DATA_APPLICATION_KEY } from '../../generators/base-simple-application/support/constants.ts';
import { WORKSPACES_PRIORITY_NAMES } from '../../generators/base-workspaces/priorities.ts';
import { GENERATOR_JHIPSTER } from '../../generators/generator-constants.ts';
import { getGenerator, runResult, skipPrettierHelpers as helpers } from '../../lib/testing/index.ts';

const workspacesPriorityList = Object.values(WORKSPACES_PRIORITY_NAMES);

const {
  CONFIGURING_EACH_ENTITY,
  LOADING_ENTITIES,
  PREPARING_EACH_ENTITY,
  PREPARING_EACH_ENTITY_FIELD,
  PREPARING_EACH_ENTITY_RELATIONSHIP,
  POST_PREPARING_EACH_ENTITY,
  WRITING_ENTITIES,
  POST_WRITING_ENTITIES,
} = PRIORITY_NAMES;

export const getCommandHelpOutput = async (command?: string) => {
  await helpers.prepareTemporaryDir();
  const program = await buildJHipster();
  const cmd = command ? (program.commands.find(cmd => cmd.name() === command) as JHipsterCommand) : program;
  if (!cmd) {
    throw new Error(`Command ${command} not found.`);
  }
  if (command) {
    await cmd._lazyBuildCommandCallBack!();
  }
  return cmd.configureOutput({ getOutHelpWidth: () => 1000, getErrHelpWidth: () => 1000 }).helpInformation();
};

export const testOptions = (data: { generatorPath: string; customOptions: Record<string, unknown> }) => {
  const { generatorPath, customOptions } = data;
  before(async () => {
    await helpers.runJHipster(generatorPath).withOptions({ ...customOptions });
  });

  it('should write options to .yo-rc.json', () => {
    runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customOptions });
  });
};

const skipWritingPriorities = ['writing', 'writingEntities', 'postWriting', 'postWritingEntities'];

export const basicTests = (data: {
  generatorNamespace?: string;
  generatorPath?: string;
  customPrompts: Record<string, any>;
  requiredConfig: Record<string, any>;
  defaultConfig: Record<string, any>;
  getTemplateData?: (generator: CoreGenerator) => Record<string, any>;
}) => {
  const {
    generatorNamespace,
    generatorPath = generatorNamespace,
    customPrompts,
    requiredConfig,
    defaultConfig,
    getTemplateData = generator => generator.getContextData(CONTEXT_DATA_APPLICATION_KEY, { factory: () => undefined }),
  } = data;
  describe('with default options', () => {
    before(async () => {
      await helpers.runJHipster(generatorPath!).withOptions({
        configure: true,
        skipPriorities: skipWritingPriorities,
      });
    });
    it('should write default config to .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
    });
    it('should load default config into the context', () => {
      expect(getTemplateData(runResult.generator)).toEqual(expect.objectContaining(defaultConfig));
    });
  });
  describe('with defaults option', () => {
    before(async () => {
      await helpers.runJHipster(generatorPath!).withOptions({ defaults: true, skipPriorities: skipWritingPriorities });
    });
    it('should write default config to .yo-rc.json', () => {
      runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
    });
    it('should load default config into the context', () => {
      expect(getTemplateData(runResult.generator)).toEqual(expect.objectContaining(requiredConfig));
    });
  });
  describe('with custom prompt values', () => {
    describe('and default options', () => {
      before(async () => {
        await helpers
          .runJHipster(generatorPath!)
          .withOptions({ configure: true, skipPriorities: skipWritingPriorities })
          .withAnswers(customPrompts);
      });
      it('should show prompts and write prompt values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customPrompts });
      });
      it('should load default config with prompt values into the context', () => {
        expect(getTemplateData(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...customPrompts }));
      });
    });
    describe('and defaults option', () => {
      before(async () => {
        await helpers
          .runJHipster(generatorPath!)
          .withOptions({ defaults: true, skipPriorities: skipWritingPriorities })
          .withAnswers(customPrompts);
      });
      it('should not show prompts and write default config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
      });
      it('should load default config into the context', () => {
        expect(getTemplateData(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...requiredConfig }));
      });
    });
    describe('and skipPriorities option', () => {
      before(async () => {
        await helpers.runJHipster(generatorPath!).withOptions({ skipPriorities: skipWritingPriorities }).withAnswers(customPrompts);
      });
      it('should not show prompts and write required config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: requiredConfig });
      });
      it('should load default config and required config into the context', () => {
        expect(getTemplateData(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...requiredConfig }));
      });
    });
    describe('and existing config', () => {
      const existing = { baseName: 'existing' };
      before(async () => {
        await helpers
          .runJHipster(generatorPath!)
          .withJHipsterConfig(existing)
          .withOptions({ skipPriorities: skipWritingPriorities })
          .withAnswers(customPrompts);
      });
      it('should not show prompts and write required config to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { ...requiredConfig, ...existing } });
      });
      it('should load default config and required config into the context', () => {
        expect(getTemplateData(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...requiredConfig, ...existing }));
      });
    });
    describe('and askAnswered option on an existing project', () => {
      before(async () => {
        await helpers
          .runJHipster(generatorPath!)
          .withJHipsterConfig({ baseName: 'existing' })
          .withOptions({
            askAnswered: true,
            skipPriorities: ['writing', 'writingEntities', 'postWriting', 'postWritingEntities'],
          })
          .withAnswers(customPrompts);
      });
      it('should show prompts and write prompt values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: customPrompts });
      });
      it('should load default config and prompt values into the context', () => {
        expect(getTemplateData(runResult.generator)).toEqual(expect.objectContaining({ ...defaultConfig, ...customPrompts }));
      });
    });
    describe('and add option on an existing project', () => {
      const existingConfig = { baseName: 'existing' };
      before(async () => {
        await helpers
          .runJHipster(generatorPath!)
          .withJHipsterConfig(existingConfig)
          .withOptions({
            add: true,
            skipPriorities: ['writing', 'writingEntities', 'postWriting', 'postWritingEntities'],
          })
          .withAnswers(customPrompts);
      });
      it('should show prompts and write prompt values to .yo-rc.json', () => {
        runResult.assertJsonFileContent('.yo-rc.json', { [GENERATOR_JHIPSTER]: { ...customPrompts, ...existingConfig } });
      });
      it('should load default config and prompt values into the context', () => {
        expect(getTemplateData(runResult.generator)).toEqual(
          expect.objectContaining({ ...defaultConfig, ...customPrompts, ...existingConfig }),
        );
      });
    });
  });
};

export const testBlueprintSupport = (
  generatorName: string,
  options: { skipSbsBlueprint?: boolean; entity?: boolean; bootstrapGenerator?: boolean } = {},
) => {
  if (typeof options === 'boolean') {
    options = { skipSbsBlueprint: options };
  }
  const { skipSbsBlueprint = false, entity = false, bootstrapGenerator = false } = options;

  const generatorPath = getGenerator(generatorName);
  if (!existsSync(generatorPath)) {
    throw new Error(`Generator ${generatorName} not found.`);
  }
  const addSpies = (generator: CoreGenerator) => {
    const { taskPrefix = '' } = generator.features;
    const apiPrefix = taskPrefix ? '' : '_';
    const prioritiesSpy = sinon.spy();
    const prioritiesTasks: Record<string, sinon.SinonSpy> = {};
    let prioritiesCount = 0;
    [...PRIORITY_NAMES_LIST, ...workspacesPriorityList].forEach(priority => {
      let callback;
      if (Object.getOwnPropertyDescriptor(Object.getPrototypeOf(generator), `${taskPrefix}${priority}`)) {
        prioritiesCount++;
        callback = prioritiesSpy;
      } else {
        callback = () => {
          throw new Error(`${apiPrefix}${priority} should not be called`);
        };
      }
      const property = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(generator), `${apiPrefix}${priority}`);
      if (property) {
        const task = sinon.spy();
        prioritiesTasks[priority] = task;
        if (property.value && typeof property.value === 'function') {
          (generator as any)[`${apiPrefix}${priority}`] = () => {
            callback();
            return { task };
          };
        } else if (property.get) {
          Object.defineProperty(generator, `${apiPrefix}${priority}`, {
            get() {
              callback();
              return { task };
            },
            enumerable: true,
            configurable: true,
          });
        }
      }
    });
    return { prioritiesSpy, prioritiesCount, prioritiesTasks };
  };
  describe('with blueprint', () => {
    let spy: { prioritiesSpy: sinon.SinonSpy; prioritiesCount: number; prioritiesTasks: Record<string, sinon.SinonSpy> };
    before(async () => {
      await helpers
        .runJHipster(generatorName)
        .withMockedJHipsterGenerators({ filter: () => true })
        .withMockedGenerators([`jhipster-foo:${generatorName}`])
        .withJHipsterConfig()
        .withOptions({ blueprint: ['foo'] })
        .onGenerator(generator => {
          spy = addSpies(generator);
        });
    });
    it(`should compose with jhipster-foo:${generatorName} blueprint once`, () => {
      expect(runResult.getGeneratorComposeCount(`jhipster-foo:${generatorName}`)).toBe(1);
    });
    if (bootstrapGenerator) {
      it('should call every priority', () => {
        expect(spy.prioritiesSpy.callCount).toBe(spy.prioritiesCount);
      });
    } else {
      it('should not call any priority', () => {
        expect(spy.prioritiesSpy.callCount).toBe(0);
      });
    }
  });
  describe('with sbs blueprint', () => {
    let spy: { prioritiesSpy: sinon.SinonSpy; prioritiesCount: number; prioritiesTasks: Record<string, sinon.SinonSpy> };
    before(async function () {
      if (skipSbsBlueprint) {
        this.skip();
      }
      const context = helpers
        .runJHipster(generatorName)
        .withMockedJHipsterGenerators({ filter: () => true })
        .withMockedGenerators([`jhipster-foo-sbs:${generatorName}`])
        .withJHipsterConfig(
          {},
          entity
            ? [
                {
                  name: 'One',
                  fields: [{ fieldName: 'id', fieldType: 'Long' }],
                  relationships: [{ relationshipName: 'relationship', otherEntityName: 'Two', relationshipType: 'many-to-one' }],
                },
                {
                  name: 'Two',
                  fields: [
                    { fieldName: 'id', fieldType: 'Long' },
                    { fieldName: 'name', fieldType: 'String' },
                  ],
                  relationships: [
                    { relationshipName: 'relationship1', otherEntityName: 'One', relationshipType: 'many-to-one' },
                    { relationshipName: 'relationship2', otherEntityName: 'Two', relationshipType: 'many-to-one' },
                  ],
                },
              ]
            : undefined,
        )
        .commitFiles()
        .withOptions({ blueprint: ['foo-sbs'] })
        .onGenerator(generator => {
          spy = addSpies(generator);
        });

      // simulate a sbs blueprint
      Object.defineProperty(
        (context.mockedGenerators[`jhipster-foo-sbs:${generatorName}`] as unknown as Function).prototype,
        'sbsBlueprint',
        {
          get() {
            return true;
          },
          enumerable: true,
          configurable: true,
        },
      );

      await context;
    });
    it(`should compose with jhipster-foo:${generatorName} blueprint once`, () => {
      expect(runResult.assertGeneratorComposedOnce(`jhipster-foo-sbs:${generatorName}`));
    });
    it('should call every priority', () => {
      expect(spy.prioritiesSpy.callCount).toBe(spy.prioritiesCount);
    });
    [...PRIORITY_NAMES_LIST, ...workspacesPriorityList]
      .filter(priority => !Object.values(ENTITY_PRIORITY_NAMES).includes(priority as any))
      .forEach(priority => {
        it(`should call ${priority} tasks if implemented`, function () {
          if (!spy.prioritiesTasks[priority]) {
            this.skip();
            return;
          }
          expect(spy.prioritiesTasks[priority].callCount).toBe(1);
        });
      });
    if (entity) {
      [LOADING_ENTITIES, WRITING_ENTITIES, POST_WRITING_ENTITIES].forEach(priority => {
        it(`should call ${priority} tasks once`, function () {
          if (!spy.prioritiesTasks[priority]) {
            this.skip();
            return;
          }
          expect(spy.prioritiesTasks[priority].callCount).toBe(1);
        });
      });
      [CONFIGURING_EACH_ENTITY, PREPARING_EACH_ENTITY, POST_PREPARING_EACH_ENTITY].forEach(priority => {
        it(`should call ${priority} tasks twice`, function () {
          if (!spy.prioritiesTasks[priority]) {
            this.skip();
            return;
          }
          expect(spy.prioritiesTasks[priority].callCount).toBe(2);
        });
      });
      it(`should call ${PREPARING_EACH_ENTITY_FIELD} tasks 3 times`, function () {
        if (!spy.prioritiesTasks[PREPARING_EACH_ENTITY_FIELD]) {
          this.skip();
          return;
        }
        expect(spy.prioritiesTasks[PREPARING_EACH_ENTITY_FIELD].callCount).toBe(3);
      });
      it(`should call ${PREPARING_EACH_ENTITY_RELATIONSHIP} tasks 3 times`, function () {
        if (!spy.prioritiesTasks[PREPARING_EACH_ENTITY_RELATIONSHIP]) {
          this.skip();
          return;
        }
        expect(spy.prioritiesTasks[PREPARING_EACH_ENTITY_RELATIONSHIP].callCount).toBe(3);
      });
    }
  });
};

export const shouldSupportFeatures = (Generator: any) => {
  it('should support features parameter', () => {
    const instance = new Generator([], { help: true, namespace: 'foo', resolved: 'bar', env: { cwd: 'foo' } as any }, { uniqueBy: 'bar' });
    expect(instance.features!.uniqueBy).toBe('bar');
  });
};
