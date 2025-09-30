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
import type { BaseFeatures as YeomanFeatures, BaseOptions as YeomanOptions } from 'yeoman-generator';

import type { JHipsterCommandDefinition, JHipsterConfigs } from '../../lib/command/types.ts';
import type { JDLApplicationConfig } from '../../lib/jdl/core/types/parsing.ts';

export type GenericTask<ThisType, Arg1Type> = (this: ThisType, arg1: Arg1Type) => unknown;

export type Config = {
  autoCrlf?: boolean;
};

export type Options = YeomanOptions & {
  /* yeoman options */
  skipYoResolve?: boolean;
  force?: boolean;

  /* cli options */
  commandName: string;
  programName: string;
  positionalArguments?: unknown[];
  devBlueprintEnabled?: boolean;

  skipPriorities?: string[];

  /** @experimental */
  jdlDefinition?: JDLApplicationConfig;
  /** @experimental */
  commandsConfigs?: JHipsterConfigs;

  /** bootstrap options */
  applyDefaults?: <const T = any>(data: T) => T;
};

export type Features = YeomanFeatures & {
  /**
   * Wraps write context and shows removed fields and replacements if exists.
   */
  jhipster7Migration?: boolean | 'verbose' | 'silent';

  /**
   * Indicates that the generators extends base.
   */
  blueprintSupport?: boolean;

  /**
   * Disable skipPriorities flag.
   */
  disableSkipPriorities?: boolean;

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

  /**
   * Queue tasks to load and prepare properties from command.
   * This is useful for bootstrap generator.
   */
  loadCommand?: JHipsterCommandDefinition[];

  /**
   * Skip load and prepare properties from command.
   * This is useful when the command is loaded and prepared by a bootstrap generator.
   * @see loadCommand
   */
  skipLoadCommand?: boolean;
};
