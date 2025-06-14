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

import BaseGenerator from '../base/index.js';
import { GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.js';
import { normalizePathEnd } from '../../lib/utils/index.js';
import { CONTEXT_DATA_APPLICATION_KEY } from '../base-simple-application/support/index.js';
import type { ExportGeneratorOptionsFromCommand, ExportStoragePropertiesFromCommand, ParseableCommand } from '../../lib/command/types.js';
import type { Application as SimpleApplication } from '../base-simple-application/types.d.ts';
import type { GenericTaskGroup } from '../base-core/types.js';
import { CUSTOM_PRIORITIES, PRIORITY_NAMES } from './priorities.js';
import { CONTEXT_DATA_DEPLOYMENT_KEY, CONTEXT_DATA_WORKSPACES_APPLICATIONS_KEY, CONTEXT_DATA_WORKSPACES_KEY } from './support/index.js';
import type {
  Deployment as BaseDeployment,
  Workspaces as BaseWorkspaces,
  Config as BaseWorkspacesConfig,
  Features as BaseWorkspacesFeatures,
  Options as BaseWorkspacesOptions,
  Source as BaseWorkspacesSource,
  WorkspacesApplication,
} from './types.js';
import type { Tasks as WorkspacesTasks } from './tasks.js';

const {
  PROMPTING_WORKSPACES,
  CONFIGURING_WORKSPACES,
  LOADING_WORKSPACES,
  PREPARING_WORKSPACES,
  DEFAULT,
  WRITING,
  POST_WRITING,
  PRE_CONFLICTS,
  INSTALL,
  END,
} = PRIORITY_NAMES;

/**
 * This is the base class for a generator that generates entities.
 */
export default abstract class BaseWorkspacesGenerator<
  Deployment extends BaseDeployment = BaseDeployment,
  Workspaces extends BaseWorkspaces = BaseWorkspaces,
  Application extends SimpleApplication = WorkspacesApplication,
  Config extends BaseWorkspacesConfig = BaseWorkspacesConfig,
  Options extends BaseWorkspacesOptions = BaseWorkspacesOptions,
  Source extends BaseWorkspacesSource = BaseWorkspacesSource,
  Features extends BaseWorkspacesFeatures = BaseWorkspacesFeatures,
  Tasks extends WorkspacesTasks<Deployment, Workspaces, Source, Application> = WorkspacesTasks<Deployment, Workspaces, Source, Application>,
> extends BaseGenerator<Config, Options, Source, Features, Tasks> {
  static PROMPTING_WORKSPACES = BaseGenerator.asPriority(PROMPTING_WORKSPACES);

  static CONFIGURING_WORKSPACES = BaseGenerator.asPriority(CONFIGURING_WORKSPACES);

  static LOADING_WORKSPACES = BaseGenerator.asPriority(LOADING_WORKSPACES);

  static PREPARING_WORKSPACES = BaseGenerator.asPriority(PREPARING_WORKSPACES);

  customWorkspacesConfig?: boolean;
  appsFolders?: string[];
  directoryPath!: string;

  constructor(args, options: Options, features: Features) {
    super(args, options, features);

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES);
  }

  get context() {
    return this.getContextData(CONTEXT_DATA_DEPLOYMENT_KEY, { factory: () => ({}) });
  }

  get #applications() {
    return this.getContextData(CONTEXT_DATA_WORKSPACES_APPLICATIONS_KEY, {
      factory: () =>
        Object.entries(this.resolveApplicationFolders()).map(([appFolder, resolvedFolder], index) => {
          const contextMap = this.env.getContextMap(resolvedFolder);
          const application = contextMap.get(CONTEXT_DATA_APPLICATION_KEY);
          if (!application) {
            throw new Error(`No application found in ${resolvedFolder}`);
          }
          application.appFolder = appFolder;
          application.composePort = 8080 + index;
          return application;
        }),
    });
  }

  get #sharedWorkspaces(): any {
    return this.getContextData(CONTEXT_DATA_WORKSPACES_KEY, { factory: () => ({}) });
  }

  protected loadWorkspacesConfig(opts?) {
    const { context = this } = opts ?? {};
    context.appsFolders = this.jhipsterConfig.appsFolders;
    context.directoryPath = this.jhipsterConfig.directoryPath ?? './';
  }

  protected configureWorkspacesConfig() {
    this.jhipsterConfig.directoryPath = normalizePathEnd(this.jhipsterConfig.directoryPath ?? './');
  }

  private resolveApplicationFolders({
    directoryPath = this.directoryPath,
    appsFolders = this.appsFolders ?? [],
  }: { directoryPath?: string; appsFolders?: string[] } = {}) {
    return Object.fromEntries(appsFolders.map(appFolder => [appFolder, this.destinationPath(directoryPath ?? '.', appFolder)]));
  }

  async bootstrapApplications() {
    const resolvedApplicationFolders = this.resolveApplicationFolders();
    for (const [_appFolder, resolvedFolder] of Object.entries(resolvedApplicationFolders)) {
      await this.composeWithJHipster(GENERATOR_BOOTSTRAP_APPLICATION, {
        generatorOptions: { destinationRoot: resolvedFolder, reproducible: true },
      });
    }
  }

  getArgsForPriority(priorityName: string): any {
    const args = super.getArgsForPriority(priorityName);
    if (
      !(
        [
          PROMPTING_WORKSPACES,
          CONFIGURING_WORKSPACES,
          LOADING_WORKSPACES,
          PREPARING_WORKSPACES,
          DEFAULT,
          WRITING,
          POST_WRITING,
          PRE_CONFLICTS,
          INSTALL,
          END,
        ] as string[]
      ).includes(priorityName)
    ) {
      return args;
    }
    const [first, ...others] = args ?? [];
    return [
      {
        ...first,
        workspaces: this.#sharedWorkspaces,
        deployment: this.context,
        applications: this.#applications,
      },
      ...others,
    ];
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPromptingWorkspacesTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['PromptingWorkspacesTaskParam']>,
  ): GenericTaskGroup<any, Tasks['PromptingWorkspacesTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asConfiguringWorkspacesTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['ConfiguringWorkspacesTaskParam']>,
  ): GenericTaskGroup<any, Tasks['ConfiguringWorkspacesTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asLoadingWorkspacesTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['LoadingWorkspacesTaskParam']>,
  ): GenericTaskGroup<any, Tasks['LoadingWorkspacesTaskParam']> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingWorkspacesTaskGroup(
    taskGroup: GenericTaskGroup<this, Tasks['PreparingWorkspacesTaskParam']>,
  ): GenericTaskGroup<any, Tasks['PreparingWorkspacesTaskParam']> {
    return taskGroup;
  }
}

export class CommandBaseWorkspacesGenerator<Command extends ParseableCommand, AdditionalOptions = unknown> extends BaseWorkspacesGenerator<
  BaseDeployment,
  BaseWorkspaces,
  WorkspacesApplication,
  BaseWorkspacesConfig & ExportStoragePropertiesFromCommand<Command>,
  BaseWorkspacesOptions & ExportGeneratorOptionsFromCommand<Command> & AdditionalOptions
> {}
