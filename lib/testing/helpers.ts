import { basename, dirname, isAbsolute, join } from 'path';
import { mock } from 'node:test';
import { merge, set, snakeCase } from 'lodash-es';
import type { RunContextSettings, RunResult } from 'yeoman-test';
import { RunContext, YeomanTest, result } from 'yeoman-test';
import { globSync } from 'glob';

import type { BaseEnvironmentOptions, GetGeneratorConstructor, BaseGenerator as YeomanGenerator } from '@yeoman/types';
import type { EmptyObject } from 'type-fest';
import EnvironmentBuilder from '../../cli/environment-builder.mjs';
import { JHIPSTER_CONFIG_DIR } from '../../generators/generator-constants.js';
import { GENERATOR_WORKSPACES } from '../../generators/generator-list.js';
import { createJHipsterLogger, normalizePathEnd, parseCreationTimestamp } from '../../generators/base/support/index.js';
import BaseGenerator from '../../generators/base/index.js';
import type { JHipsterGeneratorOptions } from '../../generators/base/api.js';
import { getPackageRoot, getSourceRoot, isDistFolder } from '../index.js';
import type CoreGenerator from '../../generators/base-core/generator.js';
import type { ApplicationConfiguration } from '../types/application/yo-rc.js';
import { getDefaultJDLApplicationConfig } from '../command/jdl.js';
import type { Entity } from '../types/base/entity.js';
import { buildJHipster, createProgram } from '../../cli/program.mjs';
import getGenerator, { getGeneratorRelativeFolder } from './get-generator.js';

type GeneratorTestType = YeomanGenerator<JHipsterGeneratorOptions>;
type GeneratorTestOptions = JHipsterGeneratorOptions;
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
  /**
   * Use the EnviromentBuilder default preparation to create the environment.
   * Includes local and dev blueprints.
   */
  useEnvironmentBuilder?: boolean;
};

type JHipsterRunResult<GeneratorType extends CoreGenerator = CoreGenerator> = RunResult<GeneratorType> & {
  /**
   * First argument of mocked source calls.
   */
  sourceCallsArg: Record<string, unknown[]>;

  /**
   * Composed generators that were mocked.
   */
  composedMockedGenerators: string[];

  // eslint-disable-next-line no-use-before-define
  createJHipster: (ns: string, options?: WithJHipsterGenerators) => JHipsterRunContext;
};

const runResult = result as JHipsterRunResult;

export { runResult, runResult as result };

const DEFAULT_TEST_SETTINGS = { forwardCwd: true };
const DEFAULT_TEST_OPTIONS = { skipInstall: true };
const DEFAULT_TEST_ENV_OPTIONS = { skipInstall: true, dryRun: false };

const toJHipsterNamespace = (ns: string) => (/^jhipster[:-]/.test(ns) ? ns : `jhipster:${ns}`);
const generatorsDir = getSourceRoot('generators');
const allGenerators = [
  ...globSync('*/index.{j,t}s', { cwd: generatorsDir, posix: true }).map(file => dirname(file)),
  ...globSync('*/generators/*/index.{j,t}s', { cwd: generatorsDir, posix: true }).map(file => dirname(file).replace('/generators/', ':')),
]
  .map(gen => `jhipster:${gen}`)
  .sort();
const filterBootstrapGenerators = (gen: string): boolean => !gen.startsWith('jhipster:bootstrap-');
const composedGeneratorsToCheck = allGenerators
  .filter(filterBootstrapGenerators)
  .filter(gen => !['jhipster:bootstrap', 'jhipster:project-name'].includes(gen));

const defaultSharedApplication = Object.fromEntries(['CLIENT_WEBPACK_DIR'].map(key => [key, undefined]));

let defaultMockFactory: (original?: any) => any;
let defaultAccumulateMockArgs: (mocks: Record<string, any>) => Record<string, any>;

const createEnvBuilderEnvironment = (...args) => EnvironmentBuilder.createEnv(...args);

export const defineDefaults = async (
  defaults: {
    /** @deprecated mock from `node:test` is used internally */
    mockFactory?: any;
    /** @deprecated mock from `node:test` is used internally */
    accumulateMockArgs?: (mock: Record<string, any>) => Record<string, any>;
  } = {},
) => {
  const { mockFactory, accumulateMockArgs } = defaults;
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
            .map(([name, fn]) => [name, fn.mock.calls.map(call => (call.arguments.length > 1 ? call.arguments : call.arguments[0]))]),
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

class JHipsterRunContext extends RunContext<GeneratorTestType> {
  public sharedSource!: Record<string, any>;
  private sharedData!: Record<string, any>;
  private sharedApplication!: Record<string, any>;
  private sharedControl!: Record<string, any>;
  private workspaceApplications: string[] = [];
  private commonWorkspacesConfig!: Record<string, unknown>;
  private generateApplicationsSet = false;

  withOptions(options: Partial<Omit<JHipsterGeneratorOptions, 'env' | 'resolved' | 'namespace'> & Record<string, any>>): this {
    return super.withOptions(options as any);
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
        const { default: deploymentTestSamples } = await import('./support/deployment-samples.js');
        for (const appName of appNames) {
          const application = deploymentTestSamples[appName];
          if (!application) {
            throw new Error(`Application ${appName} not found`);
          }
          this.withWorkspaceApplicationAtFolder(appName, deploymentTestSamples[appName]);
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

  /** @deprecated use withJHipsterGenerators */
  withJHipsterLookup(): this {
    return this.withJHipsterGenerators();
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
        get(target, name) {
          if (!target[name]) {
            target[name] = defaultMockFactory();
          }
          return target[name];
        },
        set(target, property, value) {
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

    return this.onBeforePrepare(() => defineDefaults()).withSharedData({ sharedSource: this.sharedSource });
  }

  withControl(sharedControl: Record<string, any>): this {
    this.sharedControl = this.sharedControl ?? {};
    Object.assign(this.sharedControl, sharedControl);
    return this.withSharedData({ control: this.sharedControl });
  }

  withSharedApplication(sharedApplication: Record<string, any>): this {
    this.sharedApplication = this.sharedApplication ?? { ...defaultSharedApplication };
    merge(this.sharedApplication, sharedApplication);
    return this.withSharedData({ sharedApplication: this.sharedApplication });
  }

  withMockedNodeDependencies() {
    return this.withSharedApplication({
      nodeDependencies: new Proxy({}, { get: (_target, prop) => `${snakeCase(prop.toString()).toUpperCase()}_VERSION` }),
    });
  }

  /**
   * Mock every built-in generators except the ones in the except and bootstrap-* generators.
   * Note: Boostrap generator is mocked by default.
   * @example
   * withMockedJHipsterGenerators({ except: ['jhipster:bootstrap'] })
   * @example
   * withMockedJHipsterGenerators({ except: ['bootstrap', 'server'] })
   * @example
   * // Mock every generator including bootstrap-*
   * withMockedJHipsterGenerators({ filter: () => true })
   */
  withMockedJHipsterGenerators(options: string[] | { except?: string[]; filter?: (string) => boolean } = {}): this {
    const optionsObj = Array.isArray(options) ? { except: options } : options;
    const { except = [], filter = filterBootstrapGenerators } = optionsObj;
    const jhipsterExceptList = except.map(toJHipsterNamespace);
    return this.withMockedGenerators(
      allGenerators.filter(filter).filter(gen => !jhipsterExceptList.includes(gen) && (this as any).Generator !== gen),
    );
  }

  withJHipsterGenerators(options: WithJHipsterGenerators = {}): this {
    const { useDefaultMocks, actualGeneratorsList = [], useMock = useDefaultMocks ? filterBootstrapGenerators : () => false } = options;
    const jhipsterExceptList = actualGeneratorsList.map(toJHipsterNamespace);
    const mockedGenerators = allGenerators
      .filter(useMock)
      .filter(gen => !jhipsterExceptList.includes(gen) && (this as any).Generator !== gen);
    const actualGenerators = allGenerators.filter(gen => !mockedGenerators.includes(gen));
    const prefix = isDistFolder() ? 'dist/' : '';
    const filePatterns = actualGenerators.map(ns => getGeneratorRelativeFolder(ns)).map(path => `${prefix}${path}/index.{j,t}s`);
    return this.withMockedGenerators(mockedGenerators).withLookups({
      packagePaths: [getPackageRoot()],
      // @ts-expect-error lookups is not exported
      lookups: [`${prefix}generators`, `${prefix}generators/*/generators`],
      filePatterns,
      customizeNamespace: ns => ns?.replaceAll(':generators:', ':'),
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

  private withSharedData(sharedData: Record<string, any>): this {
    if (!this.sharedData) {
      const applicationId = 'test-application';
      this.sharedData = { ...sharedData };
      set((this as any).envOptions, `sharedOptions.sharedData.applications.${applicationId}`, this.sharedData);
      return this.withOptions({
        applicationId,
      });
    }
    Object.assign(this.sharedData, sharedData);
    return this;
  }

  async run(): Promise<RunResult<GeneratorTestType>> {
    const runResult = (await super.run()) as unknown as JHipsterRunResult;
    if (this.sharedSource) {
      // Convert big objects to an identifier to avoid big snapshot and serialization issues.
      const cleanupArguments = (args: any[] | any[][]) =>
        args.map(arg => {
          if (Array.isArray(arg)) {
            return cleanupArguments(arg);
          }
          const { application, relationships, entities, entity } = arg;
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

    runResult.createJHipster = (ns: string, options?: WithJHipsterGenerators) => {
      ns = toJHipsterNamespace(ns);
      const context = runResult.create(ns) as JHipsterRunContext;
      return context.withJHipsterGenerators(options);
    };

    return runResult as any;
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
    envOptions?: (BaseEnvironmentOptions & { createEnv?: any }) | undefined,
  ): JHipsterRunContext {
    return super
      .run<GeneratorType>(GeneratorOrNamespace, settings, envOptions)
      .withOptions({
        jdlDefinition: getDefaultJDLApplicationConfig(),
      } as any)
      .withAdapterOptions({ log: createJHipsterLogger() }) as any;
  }

  runJHipster(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: BaseEnvironmentOptions | undefined,
  ): JHipsterRunContext;
  runJHipster(jhipsterGenerator: string, options?: WithJHipsterGenerators): JHipsterRunContext;
  runJHipster(
    jhipsterGenerator: string,
    settings?: RunContextSettings | WithJHipsterGenerators | undefined,
    envOptions?: BaseEnvironmentOptions | undefined,
  ): JHipsterRunContext {
    if (!isAbsolute(jhipsterGenerator)) {
      jhipsterGenerator = toJHipsterNamespace(jhipsterGenerator);
    }
    const isWithJHipsterGenerators = (opt: any): opt is WithJHipsterGenerators | undefined =>
      opt === undefined || 'actualGeneratorsList' in opt || 'useMock' in opt || 'useDefaultMocks' in opt || 'useEnvironmentBuilder' in opt;
    if (isWithJHipsterGenerators(settings)) {
      const createEnv = settings?.useEnvironmentBuilder ? createEnvBuilderEnvironment : undefined;
      return this.run(jhipsterGenerator, undefined, { createEnv }).withJHipsterGenerators(settings);
    }
    return this.run(getGenerator(jhipsterGenerator), settings, envOptions).withJHipsterGenerators();
  }

  runCli(command: string | string[]): JHipsterRunContext {
    // Use a dummy generator which will not be used to match yeoman-test requirement.
    return this.run(this.createDummyGenerator(), { namespace: 'non-used-dummy:generator' })
      .withJHipsterGenerators({ useEnvironmentBuilder: true })
      .withEnvironmentRun(async function (this, env) {
        // Customize program to throw an error instead of exiting the process on cli parse error.
        const program = createProgram().exitOverride();
        await buildJHipster({ program, env: env as any, silent: true });
        await program.parseAsync(['jhipster', 'jhipster', ...(Array.isArray(command) ? command : command.split(' '))]);
        // Put the rootGenerator in context to be used in result assertions.
        this.generator = env.rootGenerator();
      });
  }

  /**
   * Run a generator in current application context.
   */
  runJHipsterInApplication(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: BaseEnvironmentOptions | undefined,
  ): JHipsterRunContext {
    const context = runResult.create(getGenerator(jhipsterGenerator), settings, envOptions) as JHipsterRunContext;
    return context.withJHipsterGenerators();
  }

  runJDL(jdl: string, settings?: RunContextSettings | undefined, envOptions?: BaseEnvironmentOptions | undefined): JHipsterRunContext {
    return this.runJHipster('jdl', settings, envOptions).withOptions({ inline: jdl });
  }

  /**
   * Run the JDL generator in current application context.
   */
  runJDLInApplication(
    jdl: string,
    settings?: RunContextSettings | undefined,
    envOptions?: BaseEnvironmentOptions | undefined,
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
    envOptions?: BaseEnvironmentOptions | undefined,
  ): JHipsterRunContext {
    return super.create<GeneratorType>(GeneratorOrNamespace, settings, envOptions) as any;
  }

  /** @deprecated */
  createJHipster(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: BaseEnvironmentOptions | undefined,
  ): JHipsterRunContext {
    return this.create(getGenerator(jhipsterGenerator), settings, envOptions);
  }

  generateDeploymentWorkspaces(commonConfig?: Record<string, unknown>) {
    return this.runJHipster(GENERATOR_WORKSPACES)
      .withWorkspacesCommonConfig(commonConfig ?? {})
      .withOptions({
        generateWorkspaces: true,
        generateWith: 'docker',
        skipPriorities: ['prompting'],
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
