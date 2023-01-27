/* eslint-disable max-classes-per-file */
import { Options } from 'yeoman-environment';
import type YeomanGenerator from 'yeoman-generator';
import { GeneratorOptions } from 'yeoman-generator';
import { YeomanTest, RunContext, RunContextSettings } from 'yeoman-test';
import { GeneratorConstructor } from 'yeoman-test/dist/helpers.js';

import EnvironmentBuilder from '../../cli/environment-builder.mjs';

const DEFAULT_TEST_SETTINGS = { forwardCwd: true };
const DEFAULT_TEST_OPTIONS = { skipInstall: true };
const DEFAULT_TEST_ENV_OPTIONS = { skipInstall: true, dryRun: false };

class JHipsterRunContext<GeneratorType extends YeomanGenerator> extends RunContext<GeneratorType> {
  withJHipsterConfig(content: Record<string, unknown>): this {
    return this.withYoRcConfig('generator-jhipster', content);
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

export const basicHelpers = createTestHelpers({ generatorOptions: { reproducible: true, skipChecks: true } });

export const defaultHelpers = createTestHelpers({
  generatorOptions: { skipPrettier: true, reproducible: true, skipChecks: true },
  environmentOptions: { dryRun: true },
});

export const skipPrettierHelpers = createTestHelpers({ generatorOptions: { skipPrettier: true, reproducible: true, skipChecks: true } });

export const dryRunHelpers = createTestHelpers({
  generatorOptions: { skipPrettier: true, reproducible: true, skipChecks: true },
  environmentOptions: { dryRun: true },
});
