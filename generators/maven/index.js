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
const { GENERATOR_MAVEN } = require('../generator-list');
const { files } = require('./files');
const { commonOptions, initOptions } = require('../options');
const constants = require('../generator-constants');
const { defaultConfig, requiredConfig } = require('./config');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'namespace' });

    this.jhipsterOptions(commonOptions);
    this.jhipsterOptions(initOptions);

    if (this.options.help) return;

    if (this.options.defaults) {
      this.config.defaults({
        ...requiredConfig,
        packageName: this.getDefaultPackageName(),
      });
    }

    if (!this.fromBlueprint) {
      this.instantiateBlueprints(GENERATOR_MAVEN);
    }
  }

  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        if (!this.showHello()) return;
        this.log(chalk.white('⬢ Welcome to the JHipster Maven ⬢'));
      },
      loadRuntimeOptions() {
        this.loadRuntimeOptions();
      },
    };
  }

  get initializing() {
    if (this.fromBlueprint) return;
    return this._initializing();
  }

  _prompting() {
    return {
      async showPrompts() {
        if (this.options.skipPrompts) return;
        if (this.jhipsterConfig.packageName && !this.options.askAnswered) return;
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
    if (this.fromBlueprint) return;
    return this._prompting();
  }

  _configuring() {
    return {
      setDefaults() {
        this.config.defaults({
          packageName: this.getDefaultPackageName(),
          ...requiredConfig,
        });
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
        this.loadMavenConfig();
      },
      loadDerivedConfig() {
        this.loadDerivedInitConfig();
      },
      loadConstant() {
        this.NODE_VERSION = constants.NODE_VERSION;
      },
    };
  }

  get loading() {
    if (this.fromBlueprint) return;
    return this._loading();
  }

  _writing() {
    return {
      async writeFiles() {
        await this.writeFilesToDisk(files);
      },
    };
  }

  get writing() {
    if (this.fromBlueprint) return;
    return this._writing();
  }

  _install() {
    return {};
  }

  get install() {
    if (this.fromBlueprint) return;
    return this._install();
  }

  _end() {
    return {};
  }

  get end() {
    if (this.fromBlueprint) return;
    return this._end();
  }

  /**
   * @returns default app name
   */
  _getDefaultPackageName() {
    return defaultConfig.projectName;
  }

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
};
