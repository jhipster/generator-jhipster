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

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { GENERATOR_JAVA_PACKAGE_NAME } = require('../generator-list');
const { defaultConfig } = require('./config');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'namespace' });

    this.registerCommonOptions();
    this.registerJavaPackageNameOptions();

    if (this.options.help) return;

    if (this.options.defaults) {
      this.configureJavaPackageName();
    }
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_JAVA_PACKAGE_NAME);
    }
  }

  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        if (!this.showHello()) return;
        this.log(chalk.white('⬢ Welcome to the JHipster Java Package Name ⬢'));
      },
      loadRuntimeOptions() {
        this.loadRuntimeOptions();
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
        if (this.skipPrompts()) return;
        await this.prompt(
          [
            {
              name: 'packageName',
              when: () => !this.abort,
              type: 'input',
              validate: input => this._validatePackageName(input),
              message: 'What is your default Java package name?',
              default: () => this._getDefaultPackageName(),
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
        this.configureJavaPackageName();
      },
    };
  }

  get configuring() {
    if (this.delegateToBlueprint) return;
    return this._configuring();
  }

  _loading() {
    return {
      loadConfig() {
        this.loadProjectNameConfig();
        this.loadJavaPackageNameConfig();
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
