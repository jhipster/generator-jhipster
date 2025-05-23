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

import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import chalk from 'chalk';

import BaseGenerator, { type Config as BaseConfig, type Features as BaseFeatures } from '../base/index.js';
import { YO_RC_FILE } from '../generator-constants.js';
import { GENERATOR_BOOTSTRAP_APPLICATION } from '../generator-list.js';
import { normalizePathEnd } from '../base/support/path.js';
import type { TaskTypes } from '../../lib/types/base/tasks.js';
import type { Entity } from '../../lib/types/application/entity.js';
import type { ApplicationType } from '../../lib/types/application/application.js';
import { CONTEXT_DATA_APPLICATION_KEY } from '../base-application/support/constants.js';
import type { JHipsterGeneratorOptions } from '../base/api.js';
import { CUSTOM_PRIORITIES, PRIORITY_NAMES } from './priorities.js';
import { CONTEXT_DATA_DEPLOYMENT_KEY, CONTEXT_DATA_WORKSPACES_APPLICATIONS_KEY, CONTEXT_DATA_WORKSPACES_KEY } from './support/index.js';

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

type WorkspacesTypes<E extends Entity = Entity, A extends ApplicationType<E> = ApplicationType<E>> = TaskTypes & {
  LoadingTaskParam: TaskTypes['LoadingTaskParam'] & { applications: A[] };
  PreparingTaskParam: TaskTypes['PreparingTaskParam'] & { applications: A[] };
  PostPreparingTaskParam: TaskTypes['PostPreparingTaskParam'] & { applications: A[] };
  DefaultTaskParam: TaskTypes['DefaultTaskParam'] & { applications: A[] };
  WritingTaskParam: TaskTypes['WritingTaskParam'] & { applications: A[] };
  PostWritingTaskParam: TaskTypes['PostWritingTaskParam'] & { applications: A[] };
  InstallTaskParam: TaskTypes['InstallTaskParam'] & { applications: A[] };
  PostInstallTaskParam: TaskTypes['PostInstallTaskParam'] & { applications: A[] };
  EndTaskParam: TaskTypes['EndTaskParam'] & { applications: A[] };
};

/**
 * This is the base class for a generator that generates entities.
 */
export default abstract class BaseWorkspacesGenerator<Config = unknown> extends BaseGenerator<
  Config &
    BaseConfig & {
      appsFolders: string[];
      directoryPath: string;
      deploymentType: string;
      jwtSecretKey: string;
      adminPassword: string;
      serviceDiscoveryType: string;
    },
  JHipsterGeneratorOptions,
  BaseFeatures,
  WorkspacesTypes
> {
  static PROMPTING_WORKSPACES = BaseGenerator.asPriority(PROMPTING_WORKSPACES);

  static CONFIGURING_WORKSPACES = BaseGenerator.asPriority(CONFIGURING_WORKSPACES);

  static LOADING_WORKSPACES = BaseGenerator.asPriority(LOADING_WORKSPACES);

  static PREPARING_WORKSPACES = BaseGenerator.asPriority(PREPARING_WORKSPACES);

  appsFolders?: string[];
  directoryPath!: string;

  constructor(args, options, features) {
    super(args, options, features);

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES);
  }

  get #deployment() {
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

  get sharedWorkspaces(): any {
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

  protected async askForWorkspacesConfig() {
    let appsFolders;
    await this.prompt(
      [
        {
          type: 'input',
          name: 'directoryPath',
          message: 'Enter the root directory where your applications are located',
          default: '../',
          validate: async input => {
            const path = this.destinationPath(input);
            if (existsSync(path)) {
              const applications = await this.findApplicationFolders(path);
              return applications.length === 0 ? `No application found in ${path}` : true;
            }
            return `${path} is not a directory or doesn't exist`;
          },
        },
        {
          type: 'checkbox',
          name: 'appsFolders',
          when: async answers => {
            const directoryPath = answers.directoryPath;
            appsFolders = (await this.findApplicationFolders(directoryPath)).filter(
              app => app !== 'jhipster-registry' && app !== 'registry',
            );
            this.log.log(chalk.green(`${appsFolders.length} applications found at ${this.destinationPath(directoryPath)}\n`));
            return true;
          },
          message: 'Which applications do you want to include in your configuration?',
          choices: () => appsFolders,
          default: () => appsFolders,
          validate: input => (input.length === 0 ? 'Please choose at least one application' : true),
        },
      ],
      this.config,
    );
  }

  protected async findApplicationFolders(directoryPath = this.directoryPath ?? '.') {
    return (await readdir(this.destinationPath(directoryPath), { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(
        folder =>
          existsSync(this.destinationPath(directoryPath, folder, 'package.json')) &&
          existsSync(this.destinationPath(directoryPath, folder, YO_RC_FILE)),
      );
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
        workspaces: this.sharedWorkspaces,
        deployment: this.#deployment,
        applications: this.#applications,
      },
      ...others,
    ];
  }
}
