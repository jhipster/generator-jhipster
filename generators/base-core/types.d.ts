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
import type { BaseFeatures as YeomanFeatures, BaseOptions as YeomanOptions } from 'yeoman-generator';

import type { JHipsterCommandDefinition, JHipsterConfigs } from '../../lib/command/types.ts';
import type { JDLApplicationConfig, JDLDefinitions } from '../../lib/jdl/core/parsing/index.ts';

export type GenericTask<ThisType, Arg1Type> = (this: ThisType, arg1: Arg1Type) => unknown;

/**
 * The tasks of a priority by name, as a generator hands them to the environment. The type of the parameter of a task is
 * of no use to a consumer of the generator, and leaving it out of the declaration of every priority keeps the
 * declaration of a generator small: a blueprint that compiles with `skipLibCheck: false` checks those declarations, and
 * the structural type of a task parameter is large enough to exhaust the heap of the compiler. The names are kept, so
 * the tasks a priority holds stay visible to whoever overrides it.
 */
export type TaskGroup<Names extends PropertyKey = string> = Record<Names, GenericTask<any, any>>;

/**
 * The custom objects of a generator by name, with the type of their getters: the ones of the names it declares as the
 * `customObjectNames` type, the names of its `customObjects` feature:
 * `declare readonly customObjectNames: readonly ['service']`.
 */
export type CustomObjectsOf<G> =
  G extends { readonly customObjectNames: readonly (infer N)[] } ? { [K in N & keyof G]: G[K] } : Record<never, never>;

export type Config = {
  defaultCommand?: string;
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

  /**
   * The definitions of the jdl, the JHipster ones completing those not passed.
   * @experimental
   */
  jdlDefinitions?: Partial<JDLDefinitions>;
  /** @deprecated use `jdlDefinitions`, `{ application: jdlDefinition }` */
  jdlDefinition?: JDLApplicationConfig;
  /** @experimental */
  commandsConfigs?: JHipsterConfigs;

  /** bootstrap options */
  applyDefaults?: <const T = any>(data: T) => T;
  autoCrlf?: boolean;
};

export type Features = YeomanFeatures & {
  /**
   * Custom objects, like `[{ name: 'service' }]`, each with its phases before the `before` priority, the post preparing
   * one by default: `loadingService`, `preparingService` and `postPreparingService`, with the `service` object. The
   * generator implements the `service` getter giving the object.
   */
  customObjects?: { name: string; before?: string }[];

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
  loadCommand?: JHipsterCommandDefinition[] | string[];

  /**
   * Skip load and prepare properties from command.
   * This is useful when the command is loaded and prepared by a bootstrap generator.
   * @see loadCommand
   */
  skipLoadCommand?: boolean;
};
