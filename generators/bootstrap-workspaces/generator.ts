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
import { CONTEXT_DATA_EXISTING_PROJECT } from '../base/support/constants.ts';
import { CommandBaseWorkspacesGenerator as BaseWorkspacesGenerator } from '../base-workspaces/index.js';
import type command from './command.js';

export default class BootstrapWorkspacesGenerator extends BaseWorkspacesGenerator<typeof command> {
  customWorkspacesConfig?: boolean;

  async beforeQueue() {
    this.getContextData(CONTEXT_DATA_EXISTING_PROJECT, {
      factory: () => Boolean(this.jhipsterConfig.appsFolders),
    });

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async askForOptions({ control }) {
        if (this.customWorkspacesConfig || !this.shouldAskForPrompts({ control })) return;

        await this.askForWorkspacesConfig();
      },
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configureWorkspaces() {
        this.configureWorkspacesConfig();
      },
    });
  }

  get [BaseWorkspacesGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadWorkspacesConfig() {
        this.loadWorkspacesConfig();
      },
    });
  }

  get [BaseWorkspacesGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get postPreparing() {
    return this.asPostPreparingTaskGroup({
      async bootstrapApplications() {
        await this.bootstrapApplications();
      },
    });
  }

  get [BaseWorkspacesGenerator.POST_PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.postPreparing);
  }

  get loadingWorkspaces() {
    return this.asAnyTaskGroup({
      loadWorkspacesConfig({ workspaces }) {
        this.loadWorkspacesConfig({ context: workspaces });
      },
    });
  }

  get [BaseWorkspacesGenerator.LOADING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.loadingWorkspaces);
  }
}
