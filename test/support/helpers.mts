/* eslint-disable max-classes-per-file */
import { Options } from 'yeoman-environment';
import type YeomanGenerator from 'yeoman-generator';
import { YeomanTest, RunContext, RunContextSettings } from 'yeoman-test';
import { GeneratorConstructor } from 'yeoman-test/dist/helpers.js';

import EnvironmentBuilder from '../../cli/environment-builder.mjs';
import { BaseEntity } from '../../generators/base-application/index.mjs';
import { JHIPSTER_CONFIG_DIR } from '../../generators/generator-constants.mjs';
import getGenerator from './get-generator.mjs';

const DEFAULT_TEST_SETTINGS = { forwardCwd: true };
const DEFAULT_TEST_OPTIONS = { skipInstall: true };
const DEFAULT_TEST_ENV_OPTIONS = { skipInstall: true, dryRun: false };

const createFiles = (workspace: boolean, configuration: Record<string, unknown>, entities: BaseEntity[] = []) => {
  if (!configuration.baseName) {
    throw new Error('baseName is required');
  }
  const workspaceFolder = workspace ? `${configuration.baseName}/` : '';
  const entityFiles = Object.fromEntries(entities?.map(entity => [`${workspaceFolder}${JHIPSTER_CONFIG_DIR}/${entity.name}.json`, entity]));
  configuration = { entities: entities.map(e => e.name), ...configuration };
  return {
    [`${workspaceFolder}.yo-rc.json`]: { 'generator-jhipster': configuration },
    ...entityFiles,
  };
};

class JHipsterRunContext<GeneratorType extends YeomanGenerator> extends RunContext<GeneratorType> {
  workspaceApplications: string[] = [];

  withJHipsterConfig(configuration?: Record<string, unknown>, entities: BaseEntity[] = []): this {
    return this.withFiles(createFiles(false, { baseName: 'jhipster', ...configuration }, entities));
  }

  withSkipWritingPriorities(): this {
    return this.withOptions({ skipPriorities: ['writing', 'postWriting', 'writingEntities', 'postWritingEntities'] });
  }

  withWorkspaceApplication(configuration: Record<string, unknown> = {}, entities?: BaseEntity[]): this {
    this.workspaceApplications.push(configuration.baseName as string);
    return this.withFiles(createFiles(true, configuration, entities));
  }
}

class JHipsterTest extends YeomanTest {
  run<GeneratorType extends YeomanGenerator<YeomanGenerator.GeneratorOptions> = YeomanGenerator<YeomanGenerator.GeneratorOptions>>(
    GeneratorOrNamespace: string | GeneratorConstructor<GeneratorType>,
    settings?: RunContextSettings | undefined,
    envOptions?: Options | undefined
  ): JHipsterRunContext<GeneratorType> {
    return super.run(GeneratorOrNamespace, settings, envOptions) as any;
  }

  runJHipster<GeneratorType extends YeomanGenerator<YeomanGenerator.GeneratorOptions> = YeomanGenerator<YeomanGenerator.GeneratorOptions>>(
    jhipsterGenerator: string,
    settings?: RunContextSettings | undefined,
    envOptions?: Options | undefined
  ): JHipsterRunContext<GeneratorType> {
    return this.run(getGenerator(jhipsterGenerator), settings, envOptions);
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
  generatorOptions: { skipPrettier: true, ...commonTestOptions },
  environmentOptions: { dryRun: true },
});
