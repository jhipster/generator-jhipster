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

import { camelCase, snakeCase, upperFirst } from 'lodash-es';

import { PRIORITY_NAMES_LIST as BASE_PRIORITY_NAMES_LIST } from '../base-core/priorities.ts';
import BaseSimpleApplicationGenerator from '../base-simple-application/index.ts';

import {
  LOCAL_BLUEPRINT_OPTION,
  PRIORITIES,
  WRITTEN,
  allGeneratorsConfig,
  defaultConfig,
  defaultSubGeneratorConfig,
  prompts,
  subGeneratorPrompts,
} from './constants.ts';
import { lookupGeneratorsNamespaces } from './internal/lookup-namespaces.ts';
import type {
  Application as GenerateBlueprintApplication,
  Config as GenerateBlueprintConfig,
  Features as GenerateBlueprintFeatures,
  Options as GenerateBlueprintOptions,
} from './types.ts';

export class GenerateBlueprintBaseGenerator extends BaseSimpleApplicationGenerator<
  GenerateBlueprintApplication,
  GenerateBlueprintConfig,
  GenerateBlueprintOptions
> {
  getSubGeneratorStorage(subGenerator: string) {
    return this.config.createStorage<Record<string, any>>(`generators.${subGenerator}`);
  }
}

export default class extends GenerateBlueprintBaseGenerator {
  allGenerators!: boolean;

  constructor(args?: string[], options?: GenerateBlueprintOptions, features?: GenerateBlueprintFeatures) {
    super(args, options, { storeJHipsterVersion: true, ...features });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async loadOptions() {
        if (this.allGenerators) {
          this.config.set(allGeneratorsConfig());
        }
        if (this.options.defaults) {
          this.config.defaults(defaultConfig({ config: this.jhipsterConfig }));
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async prompting() {
        await this.prompt(prompts(), this.config);
      },
      async eachSubGenerator() {
        const { localBlueprint } = this.jhipsterConfig;
        const { allPriorities } = this.options;
        const subGenerators = (this.jhipsterConfig.subGenerators ?? []) as string[];
        for (const subGenerator of subGenerators) {
          const subGeneratorStorage = this.getSubGeneratorStorage(subGenerator);
          if (allPriorities) {
            subGeneratorStorage.defaults({ [PRIORITIES]: BASE_PRIORITY_NAMES_LIST });
          }
          await this.prompt(subGeneratorPrompts({ subGenerator, localBlueprint, additionalSubGenerator: false }), subGeneratorStorage);
        }
      },
      async eachAdditionalSubGenerator() {
        const { localBlueprint } = this.jhipsterConfig;
        const { allPriorities } = this.options;
        const additionalSubGenerators = this.jhipsterConfig.additionalSubGenerators ?? '';
        for (const subGenerator of additionalSubGenerators
          .split(',')
          .map(sub => sub.trim())
          .filter(Boolean)) {
          const subGeneratorStorage = this.getSubGeneratorStorage(subGenerator);
          if (allPriorities) {
            subGeneratorStorage.defaults({ [PRIORITIES]: BASE_PRIORITY_NAMES_LIST });
          }
          await this.prompt(subGeneratorPrompts({ subGenerator, localBlueprint, additionalSubGenerator: true }), subGeneratorStorage);
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      migrateTypescript({ control }) {
        if (control.isJhipsterVersionLessThan('9.0.1')) {
          this.jhipsterConfig.javascriptBlueprint ??= true;
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async compose() {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) {
          await this.composeWithJHipster('jhipster:generate-blueprint:local');
        } else {
          await this.composeWithJHipster('jhipster:generate-blueprint:standalone');
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ control }) {
        await control.cleanupFiles({
          '8.5.1': ['.eslintrc.json'],
          '8.7.2': ['.eslintignore', 'vitest.test-setup.ts'],
          '8.7.4': ['.blueprint/generate-sample/get-samples.mjs', '.blueprint/github-build-matrix/build-matrix.mjs'],
        });
      },
      async writing({ application }) {
        application.sampleWritten = this.jhipsterConfig.sampleWritten;
        await this.writeFiles({
          sections: {
            baseFiles: [
              {
                condition: data => data.commands.length > 0,
                templates: ['cli/commands.cjs'],
              },
            ],
          },
          context: application,
        });
        this.jhipsterConfig.sampleWritten = true;
      },
      async writingGenerators({ application }) {
        if (!application.generators) return;
        const templateExtension = application.javascriptBlueprint ? 'mjs' : 'ts';
        const outputExtension = application.javascriptBlueprint ? application.blueprintMjsExtension : 'ts';
        for (const generator of Object.keys(application.generators)) {
          const subGeneratorStorage = this.getSubGeneratorStorage(generator);
          const subGeneratorConfig = subGeneratorStorage.getAll();
          const priorities: { name: string; asTaskGroup: string; constant: string }[] = (subGeneratorConfig[PRIORITIES] || []).map(
            (priority: string) => ({
              name: priority,
              asTaskGroup: `as${upperFirst(priority)}TaskGroup`,
              constant: snakeCase(priority).toUpperCase(),
            }),
          );
          const customGenerator = !lookupGeneratorsNamespaces().includes(generator);
          const jhipsterGenerator = customGenerator || subGeneratorConfig.sbs ? 'base-application' : generator;
          const generatorClass = upperFirst(camelCase(jhipsterGenerator));
          const subTemplateData = {
            ...application,
            application,
            ...defaultSubGeneratorConfig(),
            ...subGeneratorConfig,
            generator,
            parentGenerator: customGenerator ? generatorClass : generatorClass,
            customGenerator,
            jhipsterGenerator,
            subGenerator: generator,
            generatorClass,
            priorities,
          };
          await this.writeFiles<typeof subTemplateData>({
            sections: {
              generator: [
                {
                  path: 'generators/generator',
                  to: data => `${data.application.blueprintsPath}${data.generator.replaceAll(':', '/generators/')}`,
                  templates: [
                    { sourceFile: `index.${templateExtension}`, destinationFile: `index.${outputExtension}` },
                    {
                      sourceFile: `command.${templateExtension}`,
                      destinationFile: `command.${outputExtension}`,
                      override: data => !data.ignoreExistingGenerators,
                    },
                    {
                      sourceFile: `generator.${templateExtension}.jhi`,
                      destinationFile: `generator.${outputExtension}.jhi`,
                      override: data => !data.ignoreExistingGenerators,
                    },
                    {
                      condition: data => !data.generator.startsWith('entity') && !data.application[LOCAL_BLUEPRINT_OPTION],
                      sourceFile: `generator.spec.${templateExtension}`,
                      destinationFile: `generator.spec.${outputExtension}`,
                      override: data => !data.ignoreExistingGenerators,
                    },
                  ],
                },
                {
                  path: 'generators/generator',
                  to: data => `${data.application.blueprintsPath}${data.generator.replaceAll(':', '/generators/')}`,
                  condition(data) {
                    return !data.written && data.priorities.some(priority => priority.name === 'writing');
                  },
                  transform: false,
                  templates: [
                    {
                      sourceFile: 'templates/template-file.ejs',
                      destinationFile: data => `templates/template-file-${data.generator}.ejs`,
                    },
                  ],
                },
              ],
            },
            context: subTemplateData,
          });
          subGeneratorStorage.set(WRITTEN, true);
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}
