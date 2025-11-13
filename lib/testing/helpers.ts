import assert from 'node:assert';
import { randomInt } from 'node:crypto';
import { basename, dirname, isAbsolute, join } from 'node:path';
import { mock } from 'node:test';

import type { BaseGenerator as YeomanGenerator, GetGeneratorConstructor } from '@yeoman/types';
import { globSync } from 'glob';
import { merge, snakeCase } from 'lodash-es';
import type { EmptyObject } from 'type-fest';
import type Environment from 'yeoman-environment';
import type { EnvironmentOptions } from 'yeoman-environment';
import { RunContext, YeomanTest, result } from 'yeoman-test';
import type { RunContextSettings, RunResult } from 'yeoman-test';

import EnvironmentBuilder from '../../cli/environment-builder.ts';
import { buildJHipster, createProgram } from '../../cli/program.ts';
import type { CliCommand } from '../../cli/types.ts';
import BaseGenerator from '../../generators/base/index.ts';
import { parseCreationTimestamp } from '../../generators/base/support/index.ts';
import type BaseApplicationGenerator from '../../generators/base-application/generator.ts';
import type { PRIORITY_NAMES as APPLICATION_PRIORITY_NAMES } from '../../generators/base-application/priorities.ts';
import { CONTEXT_DATA_APPLICATION_ENTITIES_KEY } from '../../generators/base-application/support/constants.ts';
import BaseCoreGenerator from '../../generators/base-core/index.ts';
import { CONTEXT_DATA_APPLICATION_KEY, CONTEXT_DATA_SOURCE_KEY } from '../../generators/base-simple-application/support/constants.ts';
import type { PRIORITY_NAMES as WORKSPACES_PRIORITY_NAMES } from '../../generators/base-workspaces/priorities.ts';
import { JHIPSTER_CONFIG_DIR } from '../../generators/generator-constants.ts';
import type GeneratorsByNamespace from '../../generators/types.ts';
import { getPackageRoot, getSourceRoot, isDistFolder } from '../index.ts';
import { getDefaultJDLApplicationConfig } from '../jdl-config/jhipster-jdl-config.ts';
import type { Entity } from '../jhipster/types/entity.ts';
import type { Relationship } from '../jhipster/types/relationship.d.ts';
import type { ApplicationAll } from '../types/application-all.ts';
import type { ConfigAll as ApplicationConfiguration, OptionsAll } from '../types/command-all.ts';
import { createJHipsterLogger, normalizePathEnd } from '../utils/index.ts';

import getGenerator, { getGeneratorRelativeFolder } from './get-generator.ts';

type GeneratorTestOptions = OptionsAll;
type WithJHipsterGenerators = {
  /**
   * Apply default mocks.
   */
  useDefaultMocks?: boolean;
  /**
   * List of generators to don't mock.
   */
  actualGeneratorsList?: string[];
  /**
   * Filter to mock a generator.
   */
  useMock?: (ns: string) => boolean;
};

type RunJHipster = WithJHipsterGenerators & {
  /**
   * Use the EnvironmentBuilder default preparation to create the environment.
   * Includes local and dev blueprints.
   */
  useEnvironmentBuilder?: boolean;
};

type JHipsterRunResult<GeneratorType extends BaseCoreGenerator = BaseCoreGenerator> = Omit<RunResult<GeneratorType>, 'env'> & {
  env: Environment;

  /**
   * First argument of mocked source calls.
   */
  sourceCallsArg: Record<string, unknown[]>;

  /**
   * Composed generators that were mocked.
   */
  composedMockedGenerators: string[];

  createJHipster: (ns: string, options?: WithJHipsterGenerators) => JHipsterRunContext;

  application?: ApplicationAll;

  entities?: Record<string, Entity>;
};

type HelpersDefaults = {
  /** Blueprint namespace */
  blueprint?: string;
  /** Path where blueprint's generators folder is located */
  blueprintPackagePath?: string;
  entrypointGenerator?: string;
};

const runResult = result as JHipsterRunResult<BaseApplicationGenerator>;
const coreRunResult = result as JHipsterRunResult;

export const resultWithGenerator = <T extends BaseCoreGenerator>(): JHipsterRunResult<T> => runResult as unknown as JHipsterRunResult<T>;

export { coreRunResult, runResult, runResult as result };

const DEFAULT_TEST_SETTINGS = { forwardCwd: true };
const DEFAULT_TEST_OPTIONS = { skipInstall: true };
const DEFAULT_TEST_ENV_OPTIONS = { skipInstall: true, dryRun: false };

const toJHipsterNamespace = (ns: string) => (/^jhipster[:-]/.test(ns) ? ns : `jhipster:${ns}`);
const generatorsDir = getSourceRoot('generators');
const allGenerators: (keyof GeneratorsByNamespace)[] = [
  ...globSync('*/index.{j,t}s', { cwd: generatorsDir, posix: true }).map(file => dirname(file)),
  ...globSync('*/generators/*/index.{j,t}s', { cwd: generatorsDir, posix: true }).map(file => dirname(file).replace('/generators/', ':')),
]
  .map(gen => `jhipster:${gen}`)
  .sort() as (keyof GeneratorsByNamespace)[];
const filterBootstrapGenerators = (gen: keyof GeneratorsByNamespace): boolean =>
  !gen.startsWith('jhipster:bootstrap-') && !gen.endsWith(':bootstrap') && gen !== 'jhipster:project-name';
const composedGeneratorsToCheck = allGenerators
  .filter(filterBootstrapGenerators)
  .filter(gen => !['jhipster:bootstrap', 'jhipster:project-name'].includes(gen));

let defaultMockFactory: (original?: any) => any;
let defaultAccumulateMockArgs: (mocks: Record<string, any>) => Record<string, any>;
let helpersDefaults: HelpersDefaults = {};

export const resetDefaults = () => {
  helpersDefaults = {};
};

const createEnvBuilderEnvironment = (
  ...args: Parameters<typeof EnvironmentBuilder.createEnv>
): ReturnType<typeof EnvironmentBuilder.createEnv> => EnvironmentBuilder.createEnv(...args);

export const defineDefaults = async (
  defaults: {
    /** @deprecated mock from `node:test` is used internally */
    mockFactory?: any;
    /** @deprecated mock from `node:test` is used internally */
    accumulateMockArgs?: (mock: Record<string, any>) => Record<string, any>;
  } & HelpersDefaults = {},
) => {
  const { mockFactory, accumulateMockArgs, ...rest } = defaults;
  Object.assign(helpersDefaults, rest);

  if (mockFactory) {
    defaultMockFactory = mockFactory;
  } else if (!defaultMockFactory) {
    try {
      defaultMockFactory = (...args) => mock.fn(...args);
    } catch {
      throw new Error('loadMockFactory should be called before using mock');
    }
  }
  if (!defaultAccumulateMockArgs) {
    defaultAccumulateMockArgs =
      accumulateMockArgs ??
      ((mocks = {}) =>
        Object.fromEntries(
          Object.entries(mocks)
            .filter(([_name, fn]) => fn.mock)
            .map(([name, fn]) => [
              name,
              fn.mock.calls.map((call: any) => (call.arguments.length > 1 ? call.arguments : call.arguments[0])),
            ]),
        ));
  }
};

const createFiles = (workspaceFolder: string, configuration: Record<string, unknown>, entities?: Entity[]): Record<string, any> => {
  if (!configuration.baseName) {
    throw new Error('baseName is required');
  }
  workspaceFolder = workspaceFolder ? normalizePathEnd(workspaceFolder) : workspaceFolder;
  const entityFiles = entities
    ? Object.fromEntries(entities?.map(entity => [`${workspaceFolder}${JHIPSTER_CONFIG_DIR}/${entity.name}.json`, entity]))
    : {};
  configuration = { entities: entities?.map(e => e.name), ...configuration };
  return {
    [`${workspaceFolder}.yo-rc.json`]: { 'generator-jhipster': configuration },
    ...entityFiles,
  };
};

export const createJHipsterConfigFiles = (configuration: Record<string, unknown>, entities?: Entity[]) =>
  createFiles('', configuration, entities);

export type FakeBlueprintOptions = {
  packageJson?: any;
  generator?: string | string[];
  generatorContent?: string;
  files?: Record<string, unknown>;
};

export const createBlueprintFiles = (
  blueprintPackage: string,
  { packageJson, generator = 'test-blueprint', generatorContent, files = {} }: FakeBlueprintOptions = {},
) => {
  generatorContent =
    generatorContent ??
    `export const createGenerator = async env => {
    const BaseGenerator = await env.requireGenerator('jhipster:base');
    return class extends BaseGenerator {
      get [BaseGenerator.INITIALIZING]() {
        return {};
      }
    };
  };
  `;
  const generators = Array.isArray(generator) ? generator : [generator];
  return {
    [`node_modules/${blueprintPackage}/package.json`]: {
      name: blueprintPackage,
      version: '9.9.9',
      type: 'module',
      ...packageJson,
    },
    ...Object.fromEntries(
      generators.map(generator => [`node_modules/${blueprintPackage}/generators/${generator}/index.js`, generatorContent]),
    ),
    ...Object.fromEntries(Object.entries(files).map(([file, content]) => [`node_modules/${blueprintPackage}/${file}`, content])),
  };
};

const commonTestOptions = {
  reproducible: true,
  skipChecks: true,
  reproducibleTests: true,
  noInsight: true,
  useVersionPlaceholders: true,
  fakeKeytool: true,
  skipGit: true,
  skipEslint: true,
  skipForks: true,
};

class JHipsterRunContext extends RunContext<BaseCoreGenerator> {
  public sharedSource!: Record<string, any>;
  private sharedApplication!: Record<string, any>;
  private workspaceApplications: string[] = [];
  private commonWorkspacesConfig!: Record<string, unknown>;
  private generateApplicationsSet = false;

  withOptions(options: Partial<Omit<OptionsAll, 'env' | 'resolved' | 'namespace'> & Record<string, any>>): this {
    return super.withOptions(options);
  }

  withJHipsterConfig<Config extends EmptyObject>(
    configuration?: Readonly<Partial<Config & ApplicationConfiguration>>,
    entities?: Entity[],
  ): this {
    return this.withFiles(
      createFiles('', { baseName: 'jhipster', creationTimestamp: parseCreationTimestamp('2020-01-01'), ...configuration }, entities),
    );
  }

  withSkipWritingPriorities(): this {
    return this.withOptions({ skipPriorities: ['writing', 'postWriting', 'writingEntities', 'postWritingEntities'] });
  }

  withWorkspacesCommonConfig(commonWorkspacesConfig: Record<string, unknown>): this {
    if (this.workspaceApplications.length > 0) {
      throw new Error('Cannot be called after withWorkspaceApplication');
    }
    this.commonWorkspacesConfig = { ...this.commonWorkspacesConfig, ...commonWorkspacesConfig };
    return this;
  }

  withWorkspaceApplicationAtFolder(workspaceFolder: string, configuration: Record<string, unknown>, entities?: Entity[]): this {
    if (this.generateApplicationsSet) {
      throw new Error('Cannot be called after withWorkspaceApplication');
    }
    this.workspaceApplications.push(workspaceFolder);
    return this.withFiles(createFiles(workspaceFolder, { ...configuration, ...this.commonWorkspacesConfig }, entities));
  }

  withWorkspaceApplication(configuration: Record<string, unknown>, entities?: Entity[]): this {
    return this.withWorkspaceApplicationAtFolder(configuration.baseName as string, configuration, entities);
  }

  withWorkspacesSamples(...appNames: string[]): this {
    return this.onBeforePrepare(async () => {
      try {
        const { default: deploymentTestSamples } = await import('./support/deployment-samples.ts');
        for (const appName of appNames) {
          const application = (deploymentTestSamples as Record<string, Record<string, any>>)[appName];
          if (!application) {
            throw new Error(`Application ${appName} not found`);
          }
          this.withWorkspaceApplicationAtFolder(appName, application);
        }
      } catch {
        throw new Error('Samples are currently not available to blueprint testing.');
      }
    });
  }

  withGenerateWorkspaceApplications(generateWorkspaces = false): this {
    return this.onBeforePrepare(() => {
      this.generateApplicationsSet = true;
      this.withOptions({ generateApplications: true, workspacesFolders: this.workspaceApplications, workspaces: generateWorkspaces });
    });
  }

  withBlueprintConfig(config: Record<string, any>): this {
    const { blueprint } = helpersDefaults;
    assert(blueprint, 'Blueprint must be configured');
    return this.withYoRcConfig(blueprint, config);
  }

  /**
   * Use configured default blueprint.
   */
  withConfiguredBlueprint(): this {
    const { blueprint, blueprintPackagePath, entrypointGenerator } = helpersDefaults;
    assert(blueprintPackagePath, 'Blueprint generators package path must be configured');
    assert(blueprint, 'Blueprint must be configured');

    if (entrypointGenerator) {
      this.withOptions({ entrypointGenerator });
    }

    return this.withLookups([
      {
        packagePaths: [blueprintPackagePath],
        // @ts-expect-error lookups is not exported
        lookups: [`generators`, `generators/*/generators`],
        customizeNamespace: (ns: string) => ns?.replaceAll(':generators:', ':'),
      },
    ]).withOptions({
      blueprint: [blueprint],
    });
  }

  /**
   * Lookup generators at generator-jhipster's parent at a npm repository
   * @param lookups generators relative folder
   * @returns
   */
  withParentBlueprintLookup(lookups = ['generators', 'generators/*/generators']): this {
    const packageRootParent = join(getPackageRoot(), '..');
    if (basename(packageRootParent) === 'node_modules') {
      this.withLookups([{ packagePaths: [join(packageRootParent, '..')], lookups }] as any);
    } else {
      // Try to lookup at current path for linked generator-jhipster.
      this.withLookups([{ packagePaths: [process.cwd()], lookups }] as any);
    }
    return this;
  }

  withFakeTestBlueprint(blueprintPackage: string, { packageJson, generator = 'test-blueprint' }: FakeBlueprintOptions = {}): this {
    return this.withFiles(createBlueprintFiles(blueprintPackage, { packageJson, generator }))
      .withLookups({ localOnly: true })
      .commitFiles();
  }

  withMockedSource(options: { except?: string[] } = {}): this {
    const { except = [] } = options;
    this.sharedSource = new Proxy(
      {},
      {
        get(target: any, name: string) {
          if (!target[name]) {
            target[name] = defaultMockFactory();
          }
          return target[name];
        },
        set(target: any, property: string, value: any) {
          if (except.includes(property as string)) {
            if (target[property]) {
              throw new Error(`Cannot set ${property as string} mock`);
            }
            target[property] = defaultMockFactory(value);
          }
          return true;
        },
      },
    );

    return this.onBeforePrepare(() => defineDefaults()).withContextData(CONTEXT_DATA_SOURCE_KEY, this.sharedSource);
  }

  withSharedApplication(sharedApplication: Record<string, any>): this {
    this.sharedApplication ??= { nodeDependencies: {}, customizeTemplatePaths: [] };
    merge(this.sharedApplication, sharedApplication);
    return this.withContextData(CONTEXT_DATA_APPLICATION_KEY, this.sharedApplication);
  }

  withMockedNodeDependencies() {
    return this.withSharedApplication({
      nodeDependencies: new Proxy({}, { get: (_target, prop) => `${snakeCase(prop.toString()).toUpperCase()}_VERSION` }),
    } as unknown as ApplicationAll);
  }

  /**
   * Mock every built-in generators except the ones in the except and bootstrap-* generators.
   * Note: Bootstrap generator is mocked by default.
   * @example
   * withMockedJHipsterGenerators({ except: ['jhipster:bootstrap'] })
   * @example
   * withMockedJHipsterGenerators({ except: ['bootstrap', 'server'] })
   * @example
   * // Mock every generator including bootstrap-*
   * withMockedJHipsterGenerators({ filter: () => true })
   */
  withMockedJHipsterGenerators(
    options:
      | (keyof GeneratorsByNamespace)[]
      | { except?: (keyof GeneratorsByNamespace)[]; filter?: (gen: keyof GeneratorsByNamespace) => boolean } = {},
  ): this {
    const optionsObj = Array.isArray(options) ? { except: options } : options;
    const { except = [], filter = filterBootstrapGenerators } = optionsObj;
    const jhipsterExceptList = except.map(toJHipsterNamespace);
    return this.withMockedGenerators(
      allGenerators.filter(filter).filter(gen => !jhipsterExceptList.includes(gen) && this.Generator !== gen),
    );
  }

  withJHipsterGenerators(options: WithJHipsterGenerators = {}): this {
    const { useDefaultMocks, actualGeneratorsList = [], useMock = useDefaultMocks ? filterBootstrapGenerators : () => false } = options;
    const jhipsterExceptList = actualGeneratorsList.map(toJHipsterNamespace);
    const mockedGenerators = allGenerators.filter(useMock).filter(gen => !jhipsterExceptList.includes(gen) && this.Generator !== gen);
    const actualGenerators = allGenerators.filter(gen => !mockedGenerators.includes(gen));
    const prefix = isDistFolder() ? 'dist/' : '';
    const filePatterns = actualGenerators.map(ns => getGeneratorRelativeFolder(ns)).map(path => `${prefix}${path}/index.{j,t}s`);
    return this.withMockedGenerators(mockedGenerators).withLookups({
      packagePaths: [getPackageRoot()],
      filePatterns,
      // @ts-expect-error customizeNamespace is not exported
      customizeNamespace: (ns?: string) => ns?.replaceAll(':generators:', ':'),
    });
  }

  withGradleBuildTool(): this {
    return this.withFiles({
      'build.gradle': `
dependencies {
// jhipster-needle-gradle-dependency
}
plugins {
// jhipster-needle-gradle-plugins
}
`,
    }).withJHipsterConfig({ buildTool: 'gradle' });
  }

  private withContextData(key: string, sharedData: any): this {
    this.onEnvironment(env => {
      const contextMap: Map<string, any> = (env as Environment).getContextMap(this.targetDirectory!);
      contextMap.set(key, sharedData);
    });
    return this;
  }

  async run(): Promise<RunResult<BaseCoreGenerator>> {
    const runResult = (await super.run()) as unknown as JHipsterRunResult;
    if (this.sharedSource) {
      // Convert big objects to an identifier to avoid big snapshot and serialization issues.
      const cleanupArguments: any = (args: any[] | any[][]) =>
        args.map((arg: any) => {
          if (Array.isArray(arg)) {
            return cleanupArguments(arg);
          }
          const { application, relationships, entities, entity } = arg as {
            application?: ApplicationAll;
            relationships?: Relationship[];
            entities?: Entity[];
            entity?: Entity;
          };
          if (application) {
            arg = { ...arg, application: `Application[${application.baseName}]` };
          }
          if (entity) {
            arg = { ...arg, entity: `Entity[${entity.name}]` };
          }
          for (const key of ['control', 'entities', 'source'].filter(key => arg[key])) {
            arg = { ...arg, [key]: `TaskParameter[${key}]` };
          }
          if (relationships) {
            arg = { ...arg, relationships: relationships.map(rel => `Relationship[${rel.relationshipName}]`) };
          }
          if (entities) {
            arg = { ...arg, entities: entities.map(entity => `Entity[${entity.name}]`) };
          }
          return arg;
        });
      runResult.sourceCallsArg = Object.fromEntries(
        Object.entries(defaultAccumulateMockArgs(this.sharedSource)).map(([name, args]) => [name, cleanupArguments(args)]),
      );
    }

    runResult.composedMockedGenerators = composedGeneratorsToCheck.filter(gen => runResult.mockedGenerators[gen]?.mock.callCount() > 0);

    runResult.application = runResult.generator.getContextData(CONTEXT_DATA_APPLICATION_KEY, { factory: () => undefined });
    const entitiesMap: Map<string, Entity> | undefined = runResult.generator.getContextData(CONTEXT_DATA_APPLICATION_ENTITIES_KEY, {
      factory: (): any => undefined,
    });
    runResult.entities = entitiesMap ? Object.fromEntries(entitiesMap.entries()) : undefined;

    return runResult;
  }

  withTask(
    priorityName:
      | (typeof APPLICATION_PRIORITY_NAMES)[keyof typeof APPLICATION_PRIORITY_NAMES]
      | (typeof WORKSPACES_PRIORITY_NAMES)[keyof typeof WORKSPACES_PRIORITY_NAMES],
    method: (this: BaseCoreGenerator, ...args: any[]) => any,
  ): this {
    return this.onGenerator(async gen => {
      const generator = gen as BaseApplicationGenerator;
      generator.on('queueOwnTasks', () => {
        const priority = generator._queues[priorityName];
        const queueName = priority.queueName ?? priority.priorityName;
        generator.queueTask({
          taskName: `test-task${randomInt(1000)}`,
          queueName,
          method,
        });
      });
    });
  }
}

class JHipsterTest extends YeomanTest {
  constructor() {
    super();

    this.adapterOptions = { log: createJHipsterLogger() };
  }

  // @ts-expect-error testing types should be improved
  run<GeneratorType extends YeomanGenerator<GeneratorTestOptions> = YeomanGenerator<GeneratorTestOptions>>(
    GeneratorOrNamespace: string | GetGeneratorConstructor<GeneratorType>,
    settings?: RunContextSettings | undefined,
    envOptions?: (EnvironmentOptions & { createEnv?: any }) | undefined,
  ): JHipsterRunContext {
    return super
      .run<GeneratorType>(GeneratorOrNamespace, settings, envOptions)
      .withOptions({
        jdlDefinition: getDefaultJDLApplicationConfig(),
      } as any)
      .withAdapterOptions({ log: createJHipsterLogger() }) as unknown as JHipsterRunContext;
  }

  runJHipster(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: EnvironmentOptions | undefined,
  ): JHipsterRunContext;
  runJHipster(jhipsterGenerator: string, options?: RunJHipster): JHipsterRunContext;
  runJHipster(
    jhipsterGenerator: string,
    settings: RunContextSettings | RunJHipster | undefined,
    envOptions?: EnvironmentOptions | undefined,
  ): JHipsterRunContext {
    const generatorSpec =
      !isAbsolute(jhipsterGenerator) && !jhipsterGenerator.startsWith('@') ? toJHipsterNamespace(jhipsterGenerator) : jhipsterGenerator;
    const isRunJHipster = (opt: any): opt is RunJHipster | undefined =>
      envOptions === undefined &&
      (opt === undefined ||
        'actualGeneratorsList' in opt ||
        'useMock' in opt ||
        'useDefaultMocks' in opt ||
        'useEnvironmentBuilder' in opt);
    let context: JHipsterRunContext;
    if (isRunJHipster(settings)) {
      const { useEnvironmentBuilder, ...otherOptions } = settings ?? {};
      if (useEnvironmentBuilder) {
        context = this.run(generatorSpec, undefined, {
          createEnv: async (...args: Parameters<typeof EnvironmentBuilder.create>) => {
            const builder = await EnvironmentBuilder.create(...args).prepare();
            return builder.getEnvironment();
          },
        });
      } else {
        // If not using EnvironmentBuilder, use the default JHipster generators lookup.
        context = this.run(generatorSpec).withJHipsterGenerators(otherOptions);
      }
    } else {
      context = this.run(getGenerator(generatorSpec), settings, envOptions).withJHipsterGenerators();
    }
    if (jhipsterGenerator.match(/^(jhipster:)?[a-zA-Z0-9-]*$/)) {
      // Set the commandName to the entrypoint generator name.
      context = context.withOptions({ commandName: jhipsterGenerator.split(':').pop() });
    }
    return context;
  }

  runCli(
    command: string | string[],
    options: { commands?: Record<string, CliCommand>; useEnvironmentBuilder?: boolean; entrypointGenerator?: string } = {},
  ): JHipsterRunContext {
    const { useEnvironmentBuilder, ...buildJHipsterOptions } = options;
    // Use a dummy generator which will not be used to match yeoman-test requirement.
    const context = this.run(
      this.createDummyGenerator(BaseCoreGenerator),
      { namespace: 'non-used-dummy:generator' },
      { createEnv: useEnvironmentBuilder ? createEnvBuilderEnvironment : undefined, sharedOptions: { ...(commonTestOptions as any) } },
    );
    if (!useEnvironmentBuilder) {
      // If not using EnvironmentBuilder, use the default JHipster generators lookup.
      context.withJHipsterGenerators();
    }
    return context.withEnvironmentRun(async function (this, env) {
      // Customize program to throw an error instead of exiting the process on cli parse error.
      const program = createProgram().exitOverride();
      await buildJHipster({ program, env: env as Environment, silent: true, ...buildJHipsterOptions });
      await program.parseAsync(['jhipster', 'jhipster', ...(Array.isArray(command) ? command : command.split(' '))]);
      // Put the rootGenerator in context to be used in result assertions.
      this.generator = env.rootGenerator();
    });
  }

  runJHipsterDeployment(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: EnvironmentOptions | undefined,
  ): JHipsterRunContext {
    return this.runJHipsterInApplication(jhipsterGenerator, settings, envOptions).withOptions({
      destinationRoot: join(runResult.cwd, jhipsterGenerator.split(':').pop()!),
    });
  }

  /**
   * Run a generator in current application context.
   */
  runJHipsterInApplication(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: EnvironmentOptions | undefined,
  ): JHipsterRunContext {
    const context = runResult.create(getGenerator(jhipsterGenerator), settings, envOptions) as JHipsterRunContext;
    return context.withJHipsterGenerators();
  }

  runJDL(jdl: string, settings?: RunContextSettings | undefined, envOptions?: EnvironmentOptions | undefined): JHipsterRunContext {
    return this.runJHipster('jdl', settings, envOptions).withOptions({ inline: jdl });
  }

  /**
   * Run the JDL generator in current application context.
   */
  runJDLInApplication(
    jdl: string,
    settings?: RunContextSettings | undefined,
    envOptions?: EnvironmentOptions | undefined,
  ): JHipsterRunContext {
    return this.runJHipsterInApplication('jdl', settings, envOptions).withOptions({ inline: jdl });
  }

  runTestBlueprintGenerator() {
    const blueprintNS = 'jhipster:test-blueprint';
    class BlueprintedGenerator extends BaseGenerator {
      async beforeQueue() {
        if (!this.fromBlueprint) {
          await this.composeWithBlueprints();
        }
      }

      rootGeneratorName(): string {
        // Force fromBlueprint to be false.
        return 'generator-jhipster';
      }

      get [BaseGenerator.INITIALIZING]() {
        return {};
      }
    }
    return this.runJHipster(blueprintNS).withGenerators([[BlueprintedGenerator, { namespace: blueprintNS }]]);
  }

  // @ts-expect-error testing types should be improved
  create<GeneratorType extends YeomanGenerator<GeneratorTestOptions> = YeomanGenerator<GeneratorTestOptions>>(
    GeneratorOrNamespace: string | GetGeneratorConstructor<GeneratorType>,
    settings?: RunContextSettings | undefined,
    envOptions?: EnvironmentOptions | undefined,
  ): JHipsterRunContext {
    return super.create<GeneratorType>(GeneratorOrNamespace, settings, envOptions) as any;
  }

  generateDeploymentWorkspaces(commonConfig?: Record<string, unknown>) {
    return this.runJHipster('workspaces')
      .withWorkspacesCommonConfig(commonConfig ?? {})
      .withOptions({
        generateWorkspaces: true,
        generateWith: 'docker',
        skipPriorities: ['prompting'],
      });
  }

  async instantiateDummyBaseCoreGenerator(): Promise<BaseCoreGenerator> {
    return new (this.createDummyGenerator(BaseCoreGenerator))([], {
      namespace: 'dummy:generator',
      env: await this.createTestEnv(),
    });
  }
}

export function createTestHelpers(options: any = {}) {
  const { environmentOptions = {} } = options;
  const sharedOptions = {
    ...DEFAULT_TEST_OPTIONS,
    ...environmentOptions.sharedOptions,
  };
  const helper = new JHipsterTest();
  helper.settings = { ...DEFAULT_TEST_SETTINGS, ...options.settings };
  helper.environmentOptions = { ...DEFAULT_TEST_ENV_OPTIONS, ...environmentOptions, sharedOptions };
  helper.generatorOptions = { ...DEFAULT_TEST_OPTIONS, ...options.generatorOptions };
  // @ts-expect-error testing types should be improved
  helper.getRunContextType = () => JHipsterRunContext;
  return helper;
}

export const basicHelpers = createTestHelpers({ generatorOptions: { ...commonTestOptions } });

export const defaultHelpers = createTestHelpers({
  generatorOptions: { skipPrettier: true, ...commonTestOptions },
  environmentOptions: { dryRun: true },
});

export const skipPrettierHelpers = createTestHelpers({ generatorOptions: { skipPrettier: true, ...commonTestOptions } });

export const dryRunHelpers = createTestHelpers({
  generatorOptions: { ...commonTestOptions },
  environmentOptions: { dryRun: true },
});
