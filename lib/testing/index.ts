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

export {
  type FakeBlueprintOptions,
  basicHelpers,
  coreRunResult,
  createBlueprintFiles,
  createJHipsterConfigFiles,
  createTestHelpers,
  defaultHelpers,
  defineDefaults,
  dryRunHelpers,
  resetDefaults,
  result,
  resultWithGenerator,
  runResult,
  skipPrettierHelpers,
  typedResult,
} from './helpers.ts';
export * from './mutate-data.ts';

// test matrix
export * from './support/matcher.ts';
export * from './support/entity-samples.ts';
export * from '../ci/support/application-samples.ts';
export * from '../ci/support/client-samples.ts';
export * from '../ci/support/matrix-utils.ts';
export * from '../ci/support/server-samples.ts';
