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

const { GENERATOR_PROJECT_NAME, GENERATOR_INIT, GENERATOR_JAVA } = require('../generator-list');
const { PACKAGE_NAME, BUILD_TOOL, PRETTIER_JAVA_INDENT } = require('./constants.cjs');
const { files } = require('./files.cjs');
const { defaultConfig } = require('./config.cjs');

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

    if (this.options.defaults) {
      this.configureChain();
    }
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
      if (this.shouldComposeModular()) {
        await this.dependsOnJHipster(GENERATOR_INIT);
      }
      await this.composeWithBlueprints(GENERATOR_JAVA);
    }
  }

  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        if (!this.showHello()) return;
        this.log(chalk.white('⬢ Welcome to the JHipster Java ⬢'));
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
              name: PACKAGE_NAME,
              type: 'input',
              validate: input => this._validatePackageName(input),
              message: 'What is your default Java package name?',
              default: () => this._getDefaultPackageName(),
            },
            {
              name: BUILD_TOOL,
              type: 'list',
              choices: () => this.BUILD_TOOL_PROMPT_CHOICES,
              message: 'What tool do you want to use to build backend?',
              default: () => this.BUILD_TOOL_DEFAULT_VALUE,
            },
            {
              name: PRETTIER_JAVA_INDENT,
              type: 'input',
              message: 'What is the Java indentation?',
              default: defaultConfig[PRETTIER_JAVA_INDENT],
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

  _composing() {
    return {
      async compose() {
        if (!this.shouldComposeModular()) return;
        await this.composeWithJavaDependencies();
      },
    };
  }

  get composing() {
    if (this.delegateToBlueprint) return;
    return this._composing();
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

  _writing() {
    return {
      async writeFiles() {
        if (this.shouldSkipFiles()) return;
        await this.writeFilesToDisk(files);
      },
    };
  }

  get writing() {
    if (this.delegateToBlueprint) return;
    return this._writing();
  }

  /*
   * Start of local public API, blueprints may override to customize the generator behavior.
   */

  /**
   * Validates packageName
   * @param String input - Package name to be checked
   * @returns Boolean
   */
  _validatePackageName(input) {
    if (!/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)) {
      return 'The package name you have provided is not a valid Java package name.';
    }
    return true;
  }

  /**
   * @returns default package name
   */
  _getDefaultPackageName() {
    return defaultConfig.packageName;
  }
};
