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
import type { ComposeOptions } from 'yeoman-generator';

import type GeneratorsByNamespace from '../types.js';
import BaseGenerator from '../base/index.js';
import { mutateData } from '../../lib/utils/index.js';
import { GENERATOR_BOOTSTRAP_APPLICATION_BASE } from '../generator-list.js';
import { getConfigWithDefaults } from '../../lib/jhipster/default-application-options.js';
import { PRIORITY_NAMES } from '../base-core/priorities.ts';
import type { GenericTaskGroup } from '../base-core/types.js';
import type { SimpleTaskTypes } from './tasks.js';
import { CONTEXT_DATA_APPLICATION_KEY, CONTEXT_DATA_SOURCE_KEY } from './support/index.js';
import type {
  Application as SimpleApplication,
  Config as SimpleApplicationConfig,
  Features as SimpleApplicationFeatures,
  Options as SimpleApplicationOptions,
  Source as SimpleApplicationSource,
} from './types.js';
import { BOOTSTRAP_APPLICATION, CUSTOM_PRIORITIES } from './priorities.js';

const { LOADING, PREPARING, POST_PREPARING, DEFAULT, WRITING, POST_WRITING, PRE_CONFLICTS, INSTALL, END } = PRIORITY_NAMES;

const PRIORITY_WITH_SOURCE: string[] = [PREPARING, POST_PREPARING, POST_WRITING];
const PRIORITY_WITH_APPLICATION_DEFAULTS: string[] = [BOOTSTRAP_APPLICATION, PREPARING, LOADING];
const PRIORITY_WITH_APPLICATION: string[] = [
  LOADING,
  PREPARING,
  POST_PREPARING,

  DEFAULT,
  WRITING,
  POST_WRITING,
  PRE_CONFLICTS,
  INSTALL,
  END,
];

const getFirstArgForPriority = (priorityName: string) => ({
  source: PRIORITY_WITH_SOURCE.includes(priorityName),
  application: PRIORITY_WITH_APPLICATION.includes(priorityName),
  applicationDefaults: PRIORITY_WITH_APPLICATION_DEFAULTS.includes(priorityName),
});

/**
 * This is the base class for a generator that generates entities.
 */
export default class BaseSimpleApplicationGenerator<
  Application extends SimpleApplication = SimpleApplication,
  Config extends SimpleApplicationConfig = SimpleApplicationConfig,
  Options extends SimpleApplicationOptions = SimpleApplicationOptions,
  Source extends SimpleApplicationSource = SimpleApplicationSource,
  Features extends SimpleApplicationFeatures = SimpleApplicationFeatures,
  Tasks extends SimpleTaskTypes<Application, Source> = SimpleTaskTypes<Application, Source>,
> extends BaseGenerator<Config, Options, Source, Features, Tasks> {
  static BOOTSTRAP_APPLICATION = BaseSimpleApplicationGenerator.asPriority(BOOTSTRAP_APPLICATION);

  constructor(args: string | string[], options: Options, features: Features) {
    super(args, options, { storeJHipsterVersion: true, storeBlueprintVersion: true, ...features });

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES);
  }

  get #application(): Application {
    return this.getContextData(CONTEXT_DATA_APPLICATION_KEY, {
      factory: () => ({ nodeDependencies: {}, customizeTemplatePaths: [], user: undefined }) as unknown as Application,
    });
  }

  get #source(): Record<string, any> {
    return this.getContextData(CONTEXT_DATA_SOURCE_KEY, { factory: () => ({}) });
  }

  /**
   * JHipster config with default values fallback
   */
  override get jhipsterConfigWithDefaults(): Readonly<Config> {
    const configWithDefaults = getConfigWithDefaults(super.jhipsterConfigWithDefaults);
    return configWithDefaults as Config;
  }

  dependsOnBootstrapApplicationBase(
    options?: ComposeOptions<GeneratorsByNamespace[typeof GENERATOR_BOOTSTRAP_APPLICATION_BASE]> | undefined,
  ): Promise<GeneratorsByNamespace[typeof GENERATOR_BOOTSTRAP_APPLICATION_BASE]> {
    return this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_BASE, options);
  }

  getArgsForPriority(priorityName: (typeof PRIORITY_NAMES)[keyof typeof PRIORITY_NAMES]): any {
    const args = super.getArgsForPriority(priorityName);
    let firstArg = this.getTaskFirstArgForPriority(priorityName);
    if (args.length > 0) {
      firstArg = { ...args[0], ...firstArg };
    }
    return [firstArg];
  }

  /**
   * @protected
   */
  protected getTaskFirstArgForPriority(priorityName: (typeof PRIORITY_NAMES)[keyof typeof PRIORITY_NAMES]): any {
    const { source, application, applicationDefaults } = getFirstArgForPriority(priorityName);

    const args: Record<string, any> = {};
    if (application) {
      args.application = this.#application;
    }
    if (source) {
      args.source = this.#source;
    }
    if (applicationDefaults) {
      args.applicationDefaults = (...args) => mutateData(this.#application, ...args.map(data => ({ __override__: false, ...data })));
    }
    return args;
  }

  get bootstrapApplication() {
    return {};
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asBootstrapApplicationTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['BootstrapApplicationTaskParam']>,
  ): GenericTaskGroup<any, Tasks['BootstrapApplicationTaskParam']> {
    return taskGroup;
  }
}
