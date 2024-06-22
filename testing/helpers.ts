/* eslint-disable max-classes-per-file */
import type { BaseEnvironmentOptions, GetGeneratorConstructor, BaseGenerator as YeomanGenerator } from '@yeoman/types';
import { YeomanTest, RunContext, RunContextSettings, RunResult, result } from 'yeoman-test';
import { merge, set } from 'lodash-es';
import { globSync } from 'glob';

import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import EnvironmentBuilder from '../cli/environment-builder.mjs';
import { JHIPSTER_CONFIG_DIR } from '../generators/generator-constants.js';
import { GENERATOR_WORKSPACES } from '../generators/generator-list.js';
import getGenerator from './get-generator.js';
import { createJHipsterLogger, normalizePathEnd, parseCreationTimestamp } from '../generators/base/support/index.js';
import BaseGenerator from '../generators/base/index.js';
import type { JHipsterGeneratorOptions } from '../generators/base/api.js';
import { getPackageRoot, isDistFolder } from '../lib/index.js';
import type { JSONEntity } from '../jdl/converters/types.js';
import CoreGenerator from '../generators/base-core/generator.js';

type BaseEntity = { name: string } & JSONEntity;
type GeneratorTestType = YeomanGenerator<JHipsterGeneratorOptions>;
type GeneratorTestOptions = JHipsterGeneratorOptions;

type JHipsterRunResult<GeneratorType extends CoreGenerator = CoreGenerator> = RunResult<GeneratorType> & {
  /**
   * First argument of mocked source calls.
   */
  sourceCallsArg: Record<string, unknown[]>;

  /**
   * Composed generators that were mocked.
   */
  composedMockedGenerators: string[];
};

const runResult = result as JHipsterRunResult;

export { runResult, runResult as result };

const DEFAULT_TEST_SETTINGS = { forwardCwd: true };
const DEFAULT_TEST_OPTIONS = { skipInstall: true };
const DEFAULT_TEST_ENV_OPTIONS = { skipInstall: true, dryRun: false };

const generatorsDir = join(fileURLToPath(import.meta.url), '../../generators');
const mockedGenerators = [
  ...globSync('*/index.{j,t}s', { cwd: generatorsDir, posix: true }).map(file => dirname(file)),
  ...globSync('*/generators/*/index.{j,t}s', { cwd: generatorsDir, posix: true }).map(file => dirname(file).replace('/generators/', ':')),
]
  .filter(gen => !gen.startsWith('bootstrap-'))
  .map(gen => `jhipster:${gen}`)
  .sort();

const defaultSharedApplication = Object.fromEntries(['CLIENT_WEBPACK_DIR'].map(key => [key, undefined]));

let defaultMockFactory;

export const defineDefaults = async ({ mockFactory }: { mockFactory?: any } = {}) => {
  if (mockFactory) {
    defaultMockFactory = mockFactory;
  } else if (!defaultMockFactory) {
    try {
      const { esmocha } = await import('esmocha');
      defaultMockFactory = esmocha.fn;
    } catch {
      throw new Error('loadMockFactory should be called before using mock');
    }
  }
};

const createFiles = (workspaceFolder: string, configuration: Record<string, unknown>, entities?: BaseEntity[]) => {
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

export const createJHipsterConfigFiles = (configuration: Record<string, unknown>, entities?: BaseEntity[]) =>
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

  withJHipsterConfig(configuration?: Record<string, unknown>, entities?: BaseEntity[]): this {
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

  withWorkspaceApplicationAtFolder(workspaceFolder: string, configuration: Record<string, unknown>, entities?: BaseEntity[]): this {
    if (this.generateApplicationsSet) {
      throw new Error('Cannot be called after withWorkspaceApplication');
    }
    this.workspaceApplications.push(workspaceFolder);
    return this.withFiles(createFiles(workspaceFolder, { ...configuration, ...this.commonWorkspacesConfig }, entities));
  }

  withWorkspaceApplication(configuration: Record<string, unknown>, entities?: BaseEntity[]): this {
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

  withGenerateWorkspaceApplications(generateWorkspaces: boolean = false): this {
    return this.onBeforePrepare(() => {
      this.generateApplicationsSet = true;
      this.withOptions({ generateApplications: true, workspacesFolders: this.workspaceApplications, workspaces: generateWorkspaces });
    });
  }

  withJHipsterLookup(): this {
    return this.withLookups([{ packagePaths: [getPackageRoot()], lookups: [`${isDistFolder() ? 'dist/' : ''}generators`] }] as any);
  }

  /**
   * Lookup generators at generator-jhipster's parent at a npm repository
   * @param lookups generators relative folder
   * @returns
   */
  withParentBlueprintLookup(lookups = ['generators']): this {
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

  withMockedSource(): this {
    this.sharedSource = new Proxy(
      {},
      {
        get(target, name) {
          if (!target[name]) {
            target[name] = defaultMockFactory();
          }
          return target[name];
        },
        set() {
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

  /**
   * Mock every built-in generators except the ones in the exceptList and bootstrap-* generators.
   * Note: Boostrap generator is mocked by default.
   * @example
   * withMockedJHipsterGenerators(['jhipster:bootstrap'])
   * @example
   * withMockedJHipsterGenerators(['bootstrap', 'server'])
   */
  withMockedJHipsterGenerators(exceptList: string[] = []): this {
    exceptList = exceptList.map(gen => (gen.startsWith('jhipster:') ? gen : `jhipster:${gen}`));
    return this.withMockedGenerators(mockedGenerators.filter(gen => !exceptList.includes(gen) && (this as any).Generator !== gen));
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
      const sourceCallsArg = Object.fromEntries(
        Object.entries(this.sharedSource).map(([name, fn]) => [name, fn.mock.calls.map(args => args[0])]),
      );
      if (sourceCallsArg.addEntitiesToClient) {
        sourceCallsArg.addEntitiesToClient = (sourceCallsArg.addEntitiesToClient as any).map(({ application, entities }) => ({
          application: `Application[${application.baseName}]`,
          entities: entities.map(entity => `Entity[${entity.name}]`),
        }));
      }
      if (sourceCallsArg.addEntityToCache) {
        sourceCallsArg.addEntityToCache = (sourceCallsArg.addEntityToCache as any).map(({ relationships, ...fields }) => ({
          ...fields,
          relationships: relationships.map(rel => `Relationship[${rel.relationshipName}]`),
        }));
      }
      runResult.sourceCallsArg = sourceCallsArg;
    }

    runResult.composedMockedGenerators = mockedGenerators.filter(
      gen => runResult.mockedGenerators[gen]?.called && !['jhipster:bootstrap', 'jhipster:project-name'].includes(gen),
    );

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
    envOptions?: BaseEnvironmentOptions | undefined,
  ): JHipsterRunContext {
    return super.run<GeneratorType>(GeneratorOrNamespace, settings, envOptions).withAdapterOptions({ log: createJHipsterLogger() }) as any;
  }

  runJHipster(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: BaseEnvironmentOptions | undefined,
  ): JHipsterRunContext {
    return this.run(getGenerator(jhipsterGenerator), settings, envOptions);
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
    return this.run(blueprintNS).withGenerators([[BlueprintedGenerator, { namespace: blueprintNS }]]);
  }

  // @ts-expect-error testing types should be improved
  create<GeneratorType extends YeomanGenerator<GeneratorTestOptions> = YeomanGenerator<GeneratorTestOptions>>(
    GeneratorOrNamespace: string | GetGeneratorConstructor<GeneratorType>,
    settings?: RunContextSettings | undefined,
    envOptions?: BaseEnvironmentOptions | undefined,
  ): JHipsterRunContext {
    return super.create<GeneratorType>(GeneratorOrNamespace, settings, envOptions) as any;
  }

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
  helper.createEnv = (...args) => EnvironmentBuilder.createEnv(...args) as any;
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
