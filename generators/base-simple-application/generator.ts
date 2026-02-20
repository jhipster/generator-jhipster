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
import type { ComposeOptions } from 'yeoman-generator';

import { getConfigWithDefaults } from '../../lib/jhipster/default-application-options.ts';
import { mutateData } from '../../lib/utils/index.ts';
import BaseGenerator from '../base/index.ts';
import { PRIORITY_NAMES } from '../base-core/priorities.ts';
import type { GenericTask } from '../base-core/types.ts';
import type GeneratorsByNamespace from '../types.ts';

import { CONTEXT_DATA_APPLICATION_KEY, CONTEXT_DATA_SOURCE_KEY } from './support/index.ts';
import type { SimpleTaskTypes } from './tasks.ts';
import type {
  Application as BaseSimpleApplicationApplication,
  Config as BaseSimpleApplicationConfig,
  Features as BaseSimpleApplicationFeatures,
  Options as BaseSimpleApplicationOptions,
  Source as BaseSimpleApplicationSource,
} from './types.ts';

const { LOADING, PREPARING, POST_PREPARING, DEFAULT, WRITING, POST_WRITING, PRE_CONFLICTS, INSTALL, END } = PRIORITY_NAMES;

const PRIORITY_WITH_SOURCE = new Set<string>([PREPARING, POST_PREPARING, POST_WRITING]);
const PRIORITY_WITH_APPLICATION_DEFAULTS = new Set<string>([PREPARING, LOADING]);
const PRIORITY_WITH_APPLICATION = new Set<string>([
  LOADING,
  PREPARING,
  POST_PREPARING,
  DEFAULT,
  WRITING,
  POST_WRITING,
  PRE_CONFLICTS,
  INSTALL,
  END,
]);

const getFirstArgForPriority = (priorityName: string) => ({
  source: PRIORITY_WITH_SOURCE.has(priorityName),
  application: PRIORITY_WITH_APPLICATION.has(priorityName),
  applicationDefaults: PRIORITY_WITH_APPLICATION_DEFAULTS.has(priorityName),
});

/**
 * This is the base class for a generator that generates entities.
 */
export default class BaseSimpleApplicationGenerator<
  Application extends BaseSimpleApplicationApplication = BaseSimpleApplicationApplication,
  Config extends BaseSimpleApplicationConfig = BaseSimpleApplicationConfig,
  Options extends BaseSimpleApplicationOptions = BaseSimpleApplicationOptions,
  Source extends BaseSimpleApplicationSource = BaseSimpleApplicationSource,
  Features extends BaseSimpleApplicationFeatures = BaseSimpleApplicationFeatures,
  Tasks extends SimpleTaskTypes<Application, Source> = SimpleTaskTypes<Application, Source>,
> extends BaseGenerator<Config, Options, Source, Features, Tasks> {
  constructor(args?: string[], options?: Options, features?: Features) {
    super(args, options, { storeJHipsterVersion: true, storeBlueprintVersion: true, ...features } as Features);
  }

  override get context(): Application {
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

  /**
   * @deprecated use dependsOnBootstrap('common'), dependsOnBootstrap('base-application') or dependsOnBootstrap('base-simple-application')
   */
  dependsOnBootstrapApplicationBase(
    options?: ComposeOptions<GeneratorsByNamespace['jhipster:base-application:bootstrap']>,
  ): Promise<GeneratorsByNamespace['jhipster:base-application:bootstrap']> {
    return this.dependsOnJHipster('jhipster:base-application:bootstrap', options);
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
      args.application = this.context;
    }
    if (source) {
      args.source = this.#source;
    }
    if (applicationDefaults) {
      args.applicationDefaults = (...args: any[]): void =>
        mutateData(this.context, ...args.map(data => ({ __override__: false, ...data })));
    }
    return args;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asBootstrapApplicationTaskGroup<const T extends Record<string, GenericTask<this, Tasks['BootstrapApplicationTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['BootstrapApplicationTaskParam']>> {
    return taskGroup;
  }
}
