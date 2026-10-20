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

import { join } from 'node:path';

import defaults from 'lodash-es/defaults.js';

import type { ExportGeneratorOptionsFromCommand, ExportStoragePropertiesFromCommand, ParsableCommand } from '../../lib/command/types.ts';
import { isOfficialApplicationType } from '../../lib/core/application-types.ts';
import { getDefaultJDLDeploymentDefaults } from '../../lib/jdl-config/jhipster-jdl-config.ts';
import { createDelayedMutationContext, droppedMutationMessage, removeFieldsWithNullishValues } from '../../lib/utils/object.ts';
import BaseGenerator from '../base/index.ts';
import { priorityMatches } from '../base-core/priorities.ts';
import type { GenericTask } from '../base-core/types.ts';
import { CONTEXT_DATA_APPLICATION_KEY } from '../base-simple-application/support/index.ts';
import type { Application as SimpleApplication } from '../base-simple-application/types.d.ts';

import { CUSTOM_PRIORITIES, PRIORITY_NAMES } from './priorities.ts';
import {
  CONTEXT_DATA_DEPLOYMENT_KEY,
  CONTEXT_DATA_WORKSPACES_APPLICATIONS_KEY,
  CONTEXT_DATA_WORKSPACES_ROOT_KEY,
  CONTEXT_DATA_WORKSPACES_SKIPPED_APPLICATIONS_KEY,
} from './support/index.ts';
import type { Tasks as WorkspacesTasks } from './tasks.ts';
import type {
  Config as BaseWorkspacesConfig,
  Deployment as BaseDeployment,
  Features as BaseWorkspacesFeatures,
  Options as BaseWorkspacesOptions,
  Source as BaseWorkspacesSource,
  WorkspacesApplication,
} from './types.ts';

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
  Application extends SimpleApplication = WorkspacesApplication,
  Config extends BaseWorkspacesConfig = BaseWorkspacesConfig,
  Options extends BaseWorkspacesOptions = BaseWorkspacesOptions,
  Source extends BaseWorkspacesSource = BaseWorkspacesSource,
  Features extends BaseWorkspacesFeatures = BaseWorkspacesFeatures,
  Tasks extends WorkspacesTasks<Deployment, Source, Application> = WorkspacesTasks<Deployment, Source, Application>,
> extends BaseGenerator<Config, Options, Source, Features, Tasks> {
  static readonly PROMPTING_WORKSPACES = BaseGenerator.asPriority(PROMPTING_WORKSPACES);

  static readonly CONFIGURING_WORKSPACES = BaseGenerator.asPriority(CONFIGURING_WORKSPACES);

  static readonly LOADING_WORKSPACES = BaseGenerator.asPriority(LOADING_WORKSPACES);

  static readonly PREPARING_WORKSPACES = BaseGenerator.asPriority(PREPARING_WORKSPACES);

  constructor(args?: string[], options?: Options, features?: Features) {
    super(args, options, {
      skipLoadCommand: false,
      ...features,
      customPriorities: [...CUSTOM_PRIORITIES, ...(features?.customPriorities ?? [])],
      // The phases of the custom objects run once the deployment and its applications are prepared.
      customObjects: features?.customObjects?.map(customObject => ({ before: DEFAULT, ...customObject })),
    } as Features);
  }

  override get jhipsterConfigWithDefaults() {
    return defaults(
      {},
      removeFieldsWithNullishValues(this.config.getAll()),
      getDefaultJDLDeploymentDefaults(this.jhipsterConfig.deploymentType),
    );
  }

  get context() {
    // Delayed mutation context so command defaults and derived properties are applied only after the configuration is
    // loaded, like the application context.
    return this.getContextData(CONTEXT_DATA_DEPLOYMENT_KEY, {
      factory: () =>
        createDelayedMutationContext({
          autoDelay: true,
          onDroppedMutation: dropped => this.log.debug(droppedMutationMessage(dropped)),
        }),
    });
  }

  get appsFolders(): string[] {
    return this.jhipsterConfigWithDefaults.appsFolders;
  }

  get directoryPath(): string {
    return this.jhipsterConfigWithDefaults.directoryPath;
  }

  get #applications() {
    return this.getContextData(CONTEXT_DATA_WORKSPACES_APPLICATIONS_KEY, {
      factory: () => {
        // The ports of the applications a deployment of JHipster deploys.
        let composePort = 8080;
        return Object.entries(this.resolveApplicationFolders()).map(([appFolder, resolvedFolder]) => {
          const contextMap = this.env.getContextMap(resolvedFolder) as Map<string, WorkspacesApplication>;
          const application = contextMap.get(CONTEXT_DATA_APPLICATION_KEY);
          if (!application) {
            throw new Error(`No application found in ${resolvedFolder}`);
          }
          application.appFolder = appFolder;
          if (isOfficialApplicationType(application.applicationType)) {
            application.composePort = composePort++;
          }
          return application;
        });
      },
    });
  }

  get #officialApplications() {
    const applications = this.#applications.filter(application => isOfficialApplicationType(application.applicationType));
    if (applications.length < this.#applications.length) {
      this.getContextData(CONTEXT_DATA_WORKSPACES_SKIPPED_APPLICATIONS_KEY, {
        factory: () => {
          for (const { appFolder, applicationType } of this.#applications.filter(app => !applications.includes(app))) {
            this.log.warn(`Skipping ${appFolder}: ${applicationType} is not an official application type.`);
          }
          return true;
        },
      });
    }
    return applications;
  }

  get workspacesRoot(): string {
    return this.getContextData(CONTEXT_DATA_WORKSPACES_ROOT_KEY);
  }

  get promptingWorkspaces() {
    return {};
  }

  get configuringWorkspaces() {
    return {};
  }

  get loadingWorkspaces() {
    return {};
  }

  get preparingWorkspaces() {
    return {};
  }

  workspacePath(...dest: string[]): string {
    return join(this.workspacesRoot, ...dest);
  }

  private resolveApplicationFolders({ appsFolders = this.appsFolders }: { directoryPath?: string; appsFolders?: string[] } = {}) {
    return Object.fromEntries(appsFolders.map(appFolder => [appFolder, this.workspacePath(appFolder)]));
  }

  setWorkspacesRoot(root: string) {
    const oldValue = this.getContextData(CONTEXT_DATA_WORKSPACES_ROOT_KEY, { replacement: root });
    if (oldValue) {
      throw new Error(`Workspaces root is already set to ${oldValue}. Cannot change it to ${root}.`);
    }
  }

  async bootstrapApplications() {
    const resolvedApplicationFolders = this.resolveApplicationFolders();
    for (const [_appFolder, resolvedFolder] of Object.entries(resolvedApplicationFolders)) {
      await this.composeWithJHipster('jhipster:app:bootstrap', {
        generatorOptions: { destinationRoot: resolvedFolder, reproducible: true },
      });
    }
  }

  getArgsForPriority(priorityName: string): any {
    const args = super.getArgsForPriority(priorityName);
    if (
      !priorityMatches(
        [
          // The priorities of the custom objects (`loadingService`), which run after the workspaces priorities.
          'loading*',
          'preparing*',
          'postPreparing*',
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
        ],
        priorityName,
      )
    ) {
      return args;
    }
    const [first, ...others] = args ?? [];
    // The deployment context is loaded from the configuration in the loading workspaces priority, earlier tasks
    // read the configuration.
    const deployment =
      ([PROMPTING_WORKSPACES, CONFIGURING_WORKSPACES] as string[]).includes(priorityName) ? {} : { deployment: this.context };
    return [
      {
        ...first,
        ...deployment,
        applications: this.features.officialApplicationTypesOnly ? this.#officialApplications : this.#applications,
      },
      ...others,
    ];
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPromptingWorkspacesTaskGroup<const T extends Record<string, GenericTask<this, Tasks['PromptingWorkspacesTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['PromptingWorkspacesTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asConfiguringWorkspacesTaskGroup<const T extends Record<string, GenericTask<this, Tasks['ConfiguringWorkspacesTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['ConfiguringWorkspacesTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asLoadingWorkspacesTaskGroup<const T extends Record<string, GenericTask<this, Tasks['LoadingWorkspacesTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['LoadingWorkspacesTaskParam']>> {
    return taskGroup;
  }

  /**
   * Utility method to get typed objects for autocomplete.
   */
  asPreparingWorkspacesTaskGroup<const T extends Record<string, GenericTask<this, Tasks['PreparingWorkspacesTaskParam']>>>(
    taskGroup: T,
  ): Record<keyof T, GenericTask<any, Tasks['PreparingWorkspacesTaskParam']>> {
    return taskGroup;
  }
}

export class CommandBaseWorkspacesGenerator<Command extends ParsableCommand, AdditionalOptions = unknown> extends BaseWorkspacesGenerator<
  BaseDeployment,
  WorkspacesApplication,
  BaseWorkspacesConfig & ExportStoragePropertiesFromCommand<Command>,
  BaseWorkspacesOptions & ExportGeneratorOptionsFromCommand<Command> & AdditionalOptions
> {}
