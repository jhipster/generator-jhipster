import type { Simplify } from 'type-fest';
import type { ExportGeneratorOptionsFromCommand, ExportStoragePropertiesFromCommand } from '../../lib/command/types.js';
import type { CoreConfiguration, CoreFeatures, CoreOptions } from '../base-core/api.js';
import type CoreGenerator from '../base-core/index.js';
/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
export type ApplicationWithConfig = {
  config: Record<string, string | boolean | number | string[]>;
  entities: Record<string, unknown>;
};

export type BaseOptions = CoreOptions & {
  creationTimestamp?: string;
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
} & Simplify<ExportGeneratorOptionsFromCommand<typeof import('./command.js').default>> & {
    composeWithLocalBlueprint?: boolean;
  };

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type BaseConfiguration = CoreConfiguration & Simplify<ExportStoragePropertiesFromCommand<typeof import('./command.js').default>>;

export type JHipsterGeneratorFeatures = CoreFeatures & {
  priorityArgs?: boolean;
  baseGeneratorTaskPrefix?: string;
  storeBlueprintVersion?: boolean;
  /**
   * Wraps write context and shows removed fields and replacements if exists.
   */
  sbsBlueprint?: boolean;
  checkBlueprint?: boolean;
  /**
   * Disable skipPriorities flag.
   */
  disableSkipPriorities?: boolean;
  /**
   * Compose with bootstrap generator.
   *
   * Bootstrap generator adds support to:
   *  - multistep templates.
   *  - sort jhipster configuration json.
   *  - force jhipster configuration commit.
   *  - earlier prettier config commit for correct prettier.
   *  - prettier and eslint.
   */
  jhipsterBootstrap?: boolean;

  /**
   * Create transforms for commit.
   */
  commitTransformFactory?: () => any;

  /**
   * Queue tasks to handle command definitions.
   *  - parse options and configurations from cli.
   *  - prompt configurations.
   *  - configure configurations.
   *  - compose with generators defined in command.
   *  - load configurations.
   *
   * Defaults to true for built-in generator-jhipster generators and false for blueprints.
   */
  queueCommandTasks?: boolean;
};

export type NeedleCallback = (content: string) => string;

export type EditFileCallback<Generator = CoreGenerator<any, any, any, any, any, any>> = (
  this: Generator,
  content: string,
  filePath: string,
) => string;

export type EditFileOptions = { create?: boolean; ignoreNonExisting?: boolean | string; assertModified?: boolean; autoCrlf?: boolean };

export type CascatedEditFileCallback<Generator> = (...callbacks: EditFileCallback<Generator>[]) => CascatedEditFileCallback<Generator>;

export type ValidationResult = {
  debug?: unknown;
  info?: string | string[];
  warning?: string | string[];
  error?: string | string[];
};
