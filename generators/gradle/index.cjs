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
const { generateMixedChain } = require('../../lib/support/mixin.cjs');
const { INITIALIZING_PRIORITY, LOADING_PRIORITY, PREPARING_PRIORITY, WRITING_PRIORITY } = require('../../lib/constants/priorities.cjs');

const { GENERATOR_JAVA, GENERATOR_GRADLE } = require('../generator-list');
const { files } = require('./files.cjs');
const { GRADLE, GRADLE_VERSION, BUILD_DESTINATION_VALUE } = require('./constants.cjs');
const { BUILD_TOOL, BUILD_DESTINATION } = require('../java/constants.cjs');

const MixedChain = generateMixedChain(GENERATOR_JAVA);

module.exports = class extends MixedChain {
  constructor(args, options, features) {
    super(args, options, { jhipsterModular: true, unique: 'namespace', ...features });

    // Register options available to cli.
    if (!this.fromBlueprint) {
      this.registerCommonOptions();
      this.registerChainOptions();
    }

    if (this.options.help) return;

    this.config.defaults({
      [BUILD_TOOL]: GRADLE,
      [BUILD_DESTINATION]: BUILD_DESTINATION_VALUE,
    });

    if (this.options.defaults) {
      this.configureChain();
    }

    // Application context for templates
    this.application = {};

    // Fallback to server templates to avoid duplications.
    // TODO v8 move sources from server templates to gradle templates.
    this.jhipsterTemplatesFolders.push(this.fetchFromInstalledJHipster('server', 'templates'));
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster(GENERATOR_JAVA, [], { configure: true });
      await this.composeWithBlueprints(GENERATOR_GRADLE);
    }
  }

  get initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        if (!this.showHello()) return;
        this.log(chalk.white('⬢ Welcome to the JHipster Gradle ⬢'));
      },
      loadRuntimeOptions() {
        this.loadRuntimeOptions();
      },
      loadOptionsConstants() {
        this.loadChainOptionsConstants();
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.initializing;
  }

  get loading() {
    return {
      configureChain() {
        this.configureChain();
      },
      loadConstants() {
        this.application.GRADLE_VERSION = GRADLE_VERSION;
        this.loadChainConstants(this.application);
      },
      loadConfig() {
        this.loadChainConfig(this.application);
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.loading;
  }

  get preparing() {
    return {
      prepareDerivedProperties() {
        this.prepareChainDerivedProperties(this.application);
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.preparing;
  }

  get writing() {
    return {
      async writeFiles() {
        if (this.shouldSkipFiles()) return;
        await this.writeFiles({ sections: files, context: this.application });
      },
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.writing;
  }
};
