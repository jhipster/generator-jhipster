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
const { generateMixedChain } = require('generator-jhipster/support');

const { GENERATOR_PROJECT_NAME } = require('../generator-list');
const { defaultConfig } = require('./config.cjs');
const { BASE_NAME, PROJECT_NAME } = require('./constants.cjs');
const { dependencyChain } = require('./mixin.cjs');

const MixedChain = generateMixedChain(GENERATOR_PROJECT_NAME);

module.exports = class extends MixedChain {
  constructor(args, opts, features) {
    super(args, opts, { jhipsterModular: true, unique: 'namespace', ...features });

    // Register options available to cli.
    if (!this.fromBlueprint) {
      this.registerCommonOptions();
      this.registerChainOptions();
    }

    if (this.options.help) return;

    if (this.options.defaults) {
      this.configureChain();
    }
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      const configure = this.options.configure || !this.shouldComposeModular();
      // eslint-disable-next-line no-restricted-syntax
      for (const generator of dependencyChain) {
        // eslint-disable-next-line no-await-in-loop
        await this.dependsOnJHipster(generator, [], { configure });
      }
      await this.composeWithBlueprints(GENERATOR_PROJECT_NAME);
    }
  }

  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        if (!this.showHello()) return;
        this.log(chalk.white('⬢ Welcome to the JHipster Project Name ⬢'));
      },
      loadRuntimeOptions() {
        this.loadRuntimeOptions();
      },
      loadOptionsConstants() {
        this.loadChainOptionsConstants();
      },
    };
  }

  get initializing() {
    if (this.delegateToBlueprint) return;
    return this._initializing();
  }

  _prompting() {
    return {
      async showPrompts() {
        if (this.shouldSkipPrompts()) return;
        await this.prompt(
          [
            {
              name: PROJECT_NAME,
              type: 'input',
              message: 'What is the project name of your application?',
              default: () => this._getDefaultProjectName(),
            },
            {
              name: BASE_NAME,
              type: 'input',
              validate: input => this._validateBaseName(input),
              message: 'What is the base name of your application?',
              default: () => this.getDefaultAppName(),
            },
          ],
          this.config
        );
      },
    };
  }

  get prompting() {
    if (this.delegateToBlueprint) return;
    return this._prompting();
  }

  _configuring() {
    return {
      configure() {
        this.configureChain();
      },
    };
  }

  get configuring() {
    if (this.delegateToBlueprint) return;
    return this._configuring();
  }

  _loading() {
    return {
      loadConstants() {
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

  get loading() {
    if (this.delegateToBlueprint) return;
    return this._loading();
  }

  /*
   * Start of local public API, blueprints may override to customize the generator behavior.
   */

  /**
   * @returns default app name
   */
  _getDefaultProjectName() {
    return defaultConfig.projectName;
  }

  /**
   * Validates baseName
   * @param String input - Base name to be checked
   * @returns Boolean
   */
  _validateBaseName(input) {
    if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
      return 'Your base name cannot contain special characters or a blank space';
    }
    if (/_/.test(input)) {
      return 'Your base name cannot contain underscores as this does not meet the URI spec';
    }
    if (input === 'application') {
      return "Your base name cannot be named 'application' as this is a reserved name for Spring Boot";
    }
    return true;
  }
};
