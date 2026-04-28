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
import { createDelayedMutationContext, mutateData } from '../../lib/utils/index.ts';
import BaseGenerator from '../base/index.ts';
import { PRIORITY_NAMES } from '../base-core/priorities.ts';
import type { GenericTask } from '../base-core/types.ts';
import type GeneratorsByNamespace from '../types.ts';

import { sanitizeConfigForNodeApplications } from './support/config-hardening.ts';
import { CONTEXT_DATA_APPLICATION_KEY, CONTEXT_DATA_SANITIZATION_KEY, CONTEXT_DATA_SOURCE_KEY } from './support/index.ts';
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
    super(args, options, {
      storeJHipsterVersion: true,
      storeBlueprintVersion: true,
      skipLoadCommand: false,
      configTransform: (...args) => {
        const configTransform = this.getContextData(CONTEXT_DATA_SANITIZATION_KEY, {
          factory: () => (config: Record<string, any>, configKey?: string | undefined) => {
            const cleanups = sanitizeConfigForNodeApplications(config, { depth: -1, keyPath: configKey });
            for (const [key, { oldValue, newValue }] of Object.entries(cleanups)) {
              this.log.warn(
                `The configuration property '${key}' contained a template literal which has been sanitized for security hardening. Original value: '${oldValue}', new value: '${newValue}'`,
              );
            }
            return config;
          },
        });
        return configTransform(...args);
      },
      ...features,
    } as Features);
  }

  override get context(): Application {
    return this.#application;
  }

  get #source(): Record<string, any> {
    return this.getContextData(CONTEXT_DATA_SOURCE_KEY, { factory: () => ({}) });
  }

  get #application(): Application {
    return this.getContextData(CONTEXT_DATA_APPLICATION_KEY, {
      factory: () => createDelayedMutationContext<Application>({ autoDelay: true }),
    });
  }

  /**
   * JHipster config with default values fallback
   */
  override get jhipsterConfigWithDefaults(): Readonly<Config> {
    return getConfigWithDefaults(super.jhipsterConfigWithDefaults) as Config;
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
    return this.getApplicationArgForPriority(getFirstArgForPriority(priorityName));
  }

  protected getApplicationArgForPriority({
    source,
    application,
    applicationDefaults,
  }: {
    source?: boolean;
    application?: boolean;
    applicationDefaults?: boolean;
  }): { application?: any; source?: any; applicationDefaults?: any } {
    const taskArg: { application?: any; source?: any; applicationDefaults?: any } = {};
    if (application) {
      taskArg.application = this.#application;
    }
    if (applicationDefaults) {
      taskArg.applicationDefaults = (...args: any[]): void =>
        mutateData(this.#application, ...args.map(data => ({ __override__: false, ...data })));
    }
    if (source) {
      taskArg.source = this.#source;
    }
    return taskArg;
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
