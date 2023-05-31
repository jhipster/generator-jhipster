/* eslint-disable max-classes-per-file */
import { esmocha } from 'esmocha';
import type { BaseEnvironmentOptions } from '@yeoman/types';
import { YeomanTest, RunContext, RunContextSettings, RunResult, result } from 'yeoman-test';
import { GeneratorConstructor } from 'yeoman-test/dist/helpers.js';
import _ from 'lodash';

import EnvironmentBuilder from '../../cli/environment-builder.mjs';
import { BaseEntity } from '../../generators/base-application/index.mjs';
import { JHIPSTER_CONFIG_DIR } from '../../generators/generator-constants.mjs';
import { GENERATOR_WORKSPACES } from '../../generators/generator-list.mjs';
import getGenerator from './get-generator.mjs';
import deploymentTestSamples from './deployment-samples.mjs';
import { createJHipsterLogger, normalizePathEnd } from '../../generators/base/support/index.mjs';
import BaseGenerator from '../../generators/base/index.mjs';

const { set } = _;

type JHipsterRunResult<GeneratorType extends YeomanGenerator = YeomanGenerator> = RunResult<GeneratorType> & {
  /**
   * First argument of mocked source calls.
   */
  sourceCallsArg: Record<string, unknown[]>;
};

const runResult = result as JHipsterRunResult;

export { runResult, runResult as result };

const DEFAULT_TEST_SETTINGS = { forwardCwd: true };
const DEFAULT_TEST_OPTIONS = { skipInstall: true };
const DEFAULT_TEST_ENV_OPTIONS = { skipInstall: true, dryRun: false };

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

export type FakeBlueprintOptions = {
  packageJson?: any;
  generator?: string | string[];
  generatorContent?: string;
  files?: Record<string, unknown>;
};

export const createBlueprintFiles = (
  blueprintPackage: string,
  { packageJson, generator = 'test-blueprint', generatorContent, files = {} }: FakeBlueprintOptions = {}
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
      generators.map(generator => [`node_modules/${blueprintPackage}/generators/${generator}/index.js`, generatorContent])
    ),
    ...Object.fromEntries(Object.entries(files).map(([file, content]) => [`node_modules/${blueprintPackage}/${file}`, content])),
  };
};

class JHipsterRunContext<GeneratorType extends YeomanGenerator = BaseGenerator> extends RunContext<GeneratorType> {
  public sharedSource: Record<string, esmocha.Mock>;
  private sharedApplication: Record<string, any>;
  private sharedControl: Record<string, any>;
  private workspaceApplications: string[] = [];
  private commonWorkspacesConfig: Record<string, unknown>;
  private generateApplicationsSet = false;

  withJHipsterConfig(configuration?: Record<string, unknown>, entities?: BaseEntity[]): this {
    return this.withFiles(createFiles('', { baseName: 'jhipster', ...configuration }, entities));
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
    for (const appName of appNames) {
      const application = deploymentTestSamples[appName];
      if (!application) {
        throw new Error(`Application ${appName} not found`);
      }
      this.withWorkspaceApplicationAtFolder(appName, deploymentTestSamples[appName]);
    }
    return this;
  }

  withGenerateWorkspaceApplications(): this {
    this.generateApplicationsSet = true;
    return this.withOptions({ generateApplications: true, workspacesFolders: this.workspaceApplications });
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
            target[name] = esmocha.fn();
          }
          return target[name];
        },
        set() {
          return true;
        },
      }
    );

    return this.withSharedApplication({ sharedSource: this.sharedSource });
  }

  withControl(sharedControl: Record<string, any>): this {
    this.sharedControl = {};
    Object.assign(this.sharedControl, sharedControl);
    return this.withSharedApplication({ sharedData: this.sharedControl });
  }

  private withSharedApplication(sharedApplication: Record<string, any>): this {
    if (!this.sharedApplication) {
      const applicationId = 'test-application';
      this.sharedApplication = { ...sharedApplication };
      set((this as any).envOptions, `sharedOptions.sharedData.applications.${applicationId}`, this.sharedApplication);
      return this.withOptions({
        applicationId,
      });
    }
    Object.assign(this.sharedApplication, sharedApplication);
    return this;
  }

  async run(): Promise<RunResult<GeneratorType>> {
    const runResult = await super.run();
    if (this.sharedSource) {
      const sourceCallsArg = Object.fromEntries(
        Object.entries(this.sharedSource).map(([name, fn]) => [name, fn.mock.calls.map(args => args[0])])
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
      const jhipsterRunResult = runResult as unknown as JHipsterRunResult;
      jhipsterRunResult.sourceCallsArg = sourceCallsArg;
    }
    return runResult;
  }
}

class JHipsterTest extends YeomanTest {
  constructor() {
    super();

    this.adapterOptions = { log: createJHipsterLogger() };
  }

  run<GeneratorType extends YeomanGenerator<YeomanGenerator.GeneratorOptions> = YeomanGenerator<YeomanGenerator.GeneratorOptions>>(
    GeneratorOrNamespace: string | GeneratorConstructor<GeneratorType>,
    settings?: RunContextSettings | undefined,
    envOptions?: BaseEnvironmentOptions | undefined
  ): JHipsterRunContext<GeneratorType> {
    return super.run(GeneratorOrNamespace, settings, envOptions).withAdapterOptions({ log: createJHipsterLogger() }) as any;
  }

  runJHipster<GeneratorType extends YeomanGenerator<YeomanGenerator.GeneratorOptions> = YeomanGenerator<YeomanGenerator.GeneratorOptions>>(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: Options | undefined
  ): JHipsterRunContext<GeneratorType> {
    return this.run(getGenerator(jhipsterGenerator), settings, envOptions);
  }

  runTestBlueprintGenerator() {
    const blueprintNS = 'jhipster:test-blueprint';
    class BlueprintedGenerator extends BaseGenerator {
      async beforeQueue() {
        if (!this.fromBlueprint) {
          await this.composeWithBlueprints('test-blueprint');
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

  create<GeneratorType extends YeomanGenerator<YeomanGenerator.GeneratorOptions> = YeomanGenerator<YeomanGenerator.GeneratorOptions>>(
    GeneratorOrNamespace: string | GeneratorConstructor<GeneratorType>,
    settings?: RunContextSettings | undefined,
    envOptions?: Options | undefined
  ): JHipsterRunContext<GeneratorType> {
    return super.create(GeneratorOrNamespace, settings, envOptions) as any;
  }

  createJHipster<
    GeneratorType extends YeomanGenerator<YeomanGenerator.GeneratorOptions> = YeomanGenerator<YeomanGenerator.GeneratorOptions>
  >(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: Options | undefined
  ): JHipsterRunContext<GeneratorType> {
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
  helper.getRunContextType = () => JHipsterRunContext;
  return helper;
}

const commonTestOptions = { reproducible: true, skipChecks: true, reproducibleTests: true, noInsight: true };

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
