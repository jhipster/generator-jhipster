import { createHelpers } from 'yeoman-test';

import EnvironmentBuilder from '../../cli/environment-builder.mjs';

const DEFAULT_TEST_SETTINGS = { forwardCwd: true };
const DEFAULT_TEST_OPTIONS = { skipInstall: true };
const DEFAULT_TEST_ENV_OPTIONS = { skipInstall: true, dryRun: false };

export function createTestHelpers(options = {}) {
  const { environmentOptions = {} } = options;
  const sharedOptions = {
    ...DEFAULT_TEST_OPTIONS,
    ...environmentOptions.sharedOptions,
  };
  const newOptions = {
    settings: { ...DEFAULT_TEST_SETTINGS, ...options.settings },
    environmentOptions: { ...DEFAULT_TEST_ENV_OPTIONS, ...environmentOptions, sharedOptions },
    generatorOptions: { ...DEFAULT_TEST_OPTIONS, ...options.generatorOptions },
    createEnv: (...args) => EnvironmentBuilder.createEnv(...args),
  };
  return createHelpers(newOptions);
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
