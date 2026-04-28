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
import { defaultConfig } from '../../constants.ts';
import BlueprintGenerator from '../../index.ts';

export default class BootstrapGenerator extends BlueprintGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('base-simple-application', { generatorOptions: { applyDefaults: data => data } });
    await this.dependsOnBootstrap('javascript-simple-application');
    await this.dependsOnBootstrap('ci-cd');
  }

  get loading() {
    return this.asLoadingTaskGroup({
      async loading({ applicationDefaults }) {
        applicationDefaults({ commands: () => [], typescriptEslint: false });
      },
    });
  }

  get [BlueprintGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async preparing({ applicationDefaults }) {
        applicationDefaults(defaultConfig(), {
          blueprintsPath: data => (data.localBlueprint ? '.blueprint/' : 'generators/'),
          githubRepository: data => `jhipster/generator-jhipster-${data.baseName}`,
          blueprintMjsExtension: data => (data.js ? 'js' : 'mjs'),
          cliName: data => (data.cli ? `jhipster-${data.baseName}` : undefined),
        });
      },
      prepareCommands({ application }) {
        if (!application.generators) return;
        for (const generator of Object.keys(application.generators)) {
          const subGeneratorConfig = this.getSubGeneratorStorage(generator).getAll();
          if (subGeneratorConfig.command) {
            application.commands.push(generator);
          }
        }
      },
    });
  }

  get [BlueprintGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }
}
