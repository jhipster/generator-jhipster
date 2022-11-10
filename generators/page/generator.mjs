/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import BaseGenerator from '../base/index.mjs';

import { askForPage } from './prompts.mjs';
import { customizeFiles as customizeVueFiles, vueFiles } from './files-vue.mjs';
import constants from '../generator-constants.cjs';
import { GENERATOR_PAGE } from '../generator-list.mjs';

const { VUE } = constants.SUPPORTED_CLIENT_FRAMEWORKS;

/**
 * Base class for a generator that can be extended through a blueprint.
 *
 * @class
 * @extends {BaseGenerator}
 */
export default class PageGenerator extends BaseGenerator {
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

    this.rootGenerator = this.env.rootGenerator() === this;
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_PAGE);
    }
  }

  get initializing() {
    return {
      loadConfig() {
        this.skipClient = this.jhipsterConfig.skipClient;
        this.clientPackageManager = this.jhipsterConfig.clientPackageManager;
        this.enableTranslation = this.jhipsterConfig.enableTranslation;
        this.clientFramework = this.jhipsterConfig.clientFramework;
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return {
      askForPage,
    };
  }

  get [BaseGenerator.PROMPTING]() {
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

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get default() {
    return {
      prepareForTemplates() {
        this.jhiPrefix = this.page.jhiPrefix || this.jhipsterConfig.jhiPrefix;

        this.pageNameDashed = this._.kebabCase(this.pageName);
        this.pageInstance = this._.lowerFirst(this.pageName);
        this.jhiPrefixDashed = this._.kebabCase(this.jhiPrefix);

        this.pageFileName = this.page.pageFileName || this.pageNameDashed;
        this.pageFolderName = this.page.pageFileName || this.pageFileName;
      },
    };
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      writeClientPageFiles() {
        if (this.skipClient) return;
        if (![VUE].includes(this.clientFramework)) {
          throw new Error(`The page sub-generator is not supported for client ${this.clientFramework}`);
        }
        return this.writeFiles({
          sections: vueFiles,
          rootTemplatesPath: ['vue'],
        });
      },
    });
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  // Public API method used by the getter and also by Blueprints
  get postWriting() {
    return {
      customizeFiles() {
        if (this.skipClient) return;
        if (this.clientFramework === VUE) {
          return customizeVueFiles.call(this);
        }
        return undefined;
      },
    };
  }

  get [BaseGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get end() {
    return {
      end() {
        if (!this.rootGenerator || this.options.skipInstall || this.skipClient) return;
        this.rebuildClient();
      },
      success() {
        if (!this.rootGenerator) return;
        this.log(chalk.bold.green(`Page ${this.pageName} generated successfully.`));
      },
    };
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
