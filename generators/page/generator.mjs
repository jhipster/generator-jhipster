/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
/* eslint-disable consistent-return */
import chalk from 'chalk';

import BaseApplicationGenerator from '../base-application/index.mjs';

import { askForPage } from './prompts.mjs';
import { customizeFiles as customizeVueFiles, vueFiles } from './files-vue.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION_CLIENT, GENERATOR_PAGE } from '../generator-list.mjs';

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../client/types.mjs').ClientApplication>}
 */
export default class PageGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    // This makes it possible to pass `pageName` by argument
    this.argument('pageName', {
      type: String,
      required: false,
      description: 'Page name',
    });

    this.option('skip-prompts', {
      desc: 'Skip prompts',
      type: Boolean,
      hide: true,
      defaults: false,
    });
    this.option('recreate', {
      type: Boolean,
      required: false,
      description: 'Recreate the page',
    });

    if (this.options.help) {
      return;
    }
    this.pageName = this.options.pageName;
    this.page = this.options.page || {};

    this.loadRuntimeOptions();
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_CLIENT);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_PAGE);
    }
  }

  get prompting() {
    return {
      askForPage,
    };
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      save() {
        const pages = this.jhipsterConfig.pages || [];
        const page = pages.find(page => page.name === this.pageName);
        if (page) {
          return;
        }
        this.jhipsterConfig.pages = pages.concat({ name: this.pageName });
      },
    };
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get writing() {
    return this.asWritingTaskGroup({
      writeClientPageFiles({ application }) {
        const jhiPrefix = this.page.jhiPrefix || this.jhipsterConfig.jhiPrefix;
        const { pageName } = this;

        const pageNameDashed = this._.kebabCase(pageName);
        const pageInstance = this._.lowerFirst(pageName);
        const jhiPrefixDashed = this._.kebabCase(jhiPrefix);

        const pageFilename = this.page.pageFilename || pageNameDashed;
        const pageFolderName = this.page.pageFilename || pageFilename;

        const recreate = this.options.recreate;

        this.data = {
          jhiPrefix,
          pageNameDashed,
          pageInstance,
          jhiPrefixDashed,
          pageFilename,
          pageFolderName,
          recreate,
          pageName,
        };

        if (!application.clientFrameworkVue) {
          throw new Error(`The page sub-generator is not supported for client ${application.clientFramework}`);
        }
        return this.writeFiles({
          sections: vueFiles,
          rootTemplatesPath: ['vue'],
          context: {
            ...application,
            ...this.data,
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  // Public API method used by the getter and also by Blueprints
  get postWriting() {
    return {
      customizeFiles({ application }) {
        if (application.clientFrameworkVue) {
          return customizeVueFiles.call(this, { ...application, ...this.data });
        }
        return undefined;
      },
    };
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get end() {
    return {
      success() {
        if (this.env.rootGenerator() !== this) return;
        this.log(chalk.bold.green(`Page ${this.pageName} generated successfully.`));
      },
    };
  }

  get [BaseApplicationGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
