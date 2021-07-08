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
const { GENERATOR_PROJECT } = require('../generator-list');
const { defaultConfig } = require('./config');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'namespace' });

    this.registerCommonOptions();
    this.registerProjectNameOptions();

    if (this.options.help) return;

    if (this.options.defaults) {
      this.configureProjectName();
    }

    if (!this.fromBlueprint) {
      this.instantiateBlueprints(GENERATOR_PROJECT);
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
      // TODO move to prompting once queueing composed generator before current support is added.
      async showPrompts() {
        if (this.options.defaults || this.options.skipPrompts || (this.existingModularProject && !this.options.askAnswered)) return;
        await this.prompt(
          [
            {
              name: 'projectName',
              when: () => !this.abort,
              type: 'input',
              message: 'What is the project name of your application?',
              default: () => this._getDefaultProjectName(),
            },
            {
              name: 'baseName',
              when: () => !this.abort,
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

  get initializing() {
    if (this.fromBlueprint) return;
    return this._initializing();
  }

  _prompting() {
    return {};
  }

  get prompting() {
    if (this.fromBlueprint) return;
    return this._prompting();
  }

  _configuring() {
    return {
      configure() {
        this.configureProjectName();
      },
    };
  }

  get configuring() {
    if (this.fromBlueprint) return;
    return this._configuring();
  }

  _loading() {
    return {
      loadConfig() {
        this.loadProjectNameConfig();
      },
    };
  }

  get loading() {
    if (this.fromBlueprint) return;
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
