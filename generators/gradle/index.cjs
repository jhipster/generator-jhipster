/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const {
  generateMixedChain,
  Priorities: { INITIALIZING_PRIORITY, LOADING_PRIORITY, WRITING_PRIORITY },
} = require('generator-jhipster/support');

const { GENERATOR_JAVA, GENERATOR_GRADLE } = require('../generator-list');
const { files } = require('./files.cjs');
const { GRADLE, GRADLE_VERSION, BUILD_DESTINATION_VALUE } = require('./constants.cjs');
const { BUILD_TOOL, BUILD_DESTINATION } = require('../java/constants.cjs');

const MixedChain = generateMixedChain(GENERATOR_JAVA);

module.exports = class extends MixedChain {
  constructor(args, opts, features) {
    super(args, opts, { jhipsterModular: true, unique: 'namespace', ...features });

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

  _initializing() {
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
    return this._initializing();
  }

  _loading() {
    return {
      configureChain() {
        this.configureChain();
      },
      loadConstants() {
        this.GRADLE_VERSION = GRADLE_VERSION;
        this.loadChainConstants();
      },
      loadConfig() {
        this.loadChainConfig();
      },
      loadDerivedConfig() {
        this.loadDerivedChainConfig();
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this._loading();
  }

  _writing() {
    return {
      async writeFiles() {
        if (this.shouldSkipFiles()) return;
        await this.writeFilesToDisk(files);
      },
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this._writing();
  }
};
