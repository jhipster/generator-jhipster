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
const { startCase } = require('lodash');

const { generateMixedChain } = require('../../lib/support/mixin.cjs');
const {
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
} = require('../../lib/constants/priorities.cjs');

const { GENERATOR_PROJECT_NAME } = require('../generator-list');
const { defaultConfig } = require('./config.cjs');
const { BASE_NAME, PROJECT_NAME } = require('./constants.cjs');
const { dependencyChain } = require('./mixin.cjs');

const MixedChain = generateMixedChain(GENERATOR_PROJECT_NAME);

module.exports = class extends MixedChain {
  constructor(args, options, features) {
    super(args, options, { jhipsterModular: true, unique: 'namespace', ...features });

    // Register options available to cli.
    if (!this.fromBlueprint) {
      this.registerCommonOptions();
      this.registerChainOptions();
    }

    if (this.options.help) return;

    // Application context for templates
    this.application = {};

    if (this.options.defaults) {
      this.configureChain();
    }
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      const configure = this.options.configure || !this.shouldComposeModular();
      for (const generator of dependencyChain) {
        await this.dependsOnJHipster(generator, [], { configure });
      }
      await this.composeWithBlueprints(GENERATOR_PROJECT_NAME);
    }
  }

  get initializing() {
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

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.initializing;
  }

  get prompting() {
    return {
      async showPrompts() {
        if (this.shouldSkipPrompts()) return;
        await this.prompt(
          [
            {
              name: BASE_NAME,
              type: 'input',
              validate: input => this._validateBaseName(input),
              message: 'What is the base name of your application?',
              default: () => this.getDefaultAppName(),
            },
            {
              name: PROJECT_NAME,
              type: 'input',
              message: 'What is the project name of your application?',
              default: answers => this._getDefaultProjectName(answers[BASE_NAME]),
            },
          ],
          this.config
        );
      },
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.prompting;
  }

  get configuring() {
    return {
      configure() {
        this.configureProjectName();
      },
    };
  }

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return;
    return this.configuring;
  }

  get loading() {
    return {
      configureChain() {
        this.configureChain();
      },
      loadConstants() {
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

  /*
   * Start of local public API, blueprints may override to customize the generator behavior.
   */

  /**
   * @param {String} baseName - Base name to be derived
   * @returns default app name
   */
  _getDefaultProjectName(baseName) {
    return baseName ? `${startCase(baseName)} Application` : defaultConfig.projectName;
  }

  /**
   * Validates baseName
   * @param {String} input - Base name to be checked
   * @returns Boolean
   */
  _validateBaseName(input) {
    if (!/^([\w-]*)$/.test(input)) {
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
