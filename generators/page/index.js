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
const chalk = require('chalk');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  DEFAULT_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
  END_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;

const prompts = require('./prompts');
const { writeFiles: writeVueFiles, customizeFiles: customizeVueFiles } = require('./files-vue');
const constants = require('../generator-constants');
const { GENERATOR_PAGE } = require('../generator-list');
const { PROTRACTOR } = require('../../jdl/jhipster/test-framework-types');

const { VUE } = constants.SUPPORTED_CLIENT_FRAMEWORKS;

module.exports = class extends BaseBlueprintGenerator {
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

  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      loadConfig() {
        this.skipClient = this.jhipsterConfig.skipClient;
        this.clientPackageManager = this.jhipsterConfig.clientPackageManager;
        this.enableTranslation = this.jhipsterConfig.enableTranslation;
        this.protractorTests = this.jhipsterConfig.testFrameworks && this.jhipsterConfig.testFrameworks.includes(PROTRACTOR);
        this.clientFramework = this.jhipsterConfig.clientFramework;
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  _prompting() {
    return {
      askForPage: prompts.askForPage,
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._prompting();
  }

  _configuring() {
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

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._configuring();
  }

  _default() {
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

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._default();
  }

  _writing() {
    return {
      writeClientPageFiles() {
        if (this.skipClient) return;
        if (![VUE].includes(this.clientFramework)) {
          throw new Error(`The page sub-generator is not supported for client ${this.clientFramework}`);
        }
        writeVueFiles.call(this);
      },
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  // Public API method used by the getter and also by Blueprints
  _postWriting() {
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

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
  }

  _end() {
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

  get [END_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._end();
  }
};
