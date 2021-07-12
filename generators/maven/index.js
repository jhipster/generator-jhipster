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
const { GENERATOR_MAVEN, GENERATOR_PROJECT_NAME, GENERATOR_JAVA_PACKAGE_NAME } = require('../generator-list');
const { files } = require('./files');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts, { unique: 'namespace' });

    this.registerCommonOptions();
    this.registerProjectNameOptions();
    this.registerJavaPackageNameOptions();

    if (this.options.help) return;

    if (this.options.defaults) {
      this.configureProjectName();
      this.configureJavaPackageName();
    }
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
      await this.dependsOnJHipster(GENERATOR_JAVA_PACKAGE_NAME);
      await this.composeWithBlueprints(GENERATOR_MAVEN);
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
    if (this.delegateToBlueprint) return;
    return this._initializing();
  }

  _configuring() {
    return {
      configure() {
        this.configureProjectName();
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
      loadDerivedConfig() {
        this.loadDerivedProjectNameConfig();
        this.loadDerivedJavaPackageNameConfig();
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
        await this.writeFilesToDisk(files);
      },
    };
  }

  get writing() {
    if (this.delegateToBlueprint) return;
    return this._writing();
  }
};
