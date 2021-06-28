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
const _ = require('lodash');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const writeFiles = require('./files').writeFiles;
const packagejs = require('../../package.json');
const prompts = require('./prompts');

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, opts) {
    super(args, opts);

    this.option('skip-build', {
      desc: 'Skips building the application',
      type: Boolean,
      defaults: false,
    });
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        this.log(chalk.white('⬢ Welcome to the JHipster Maven ⬢'));
      },
      getConfig() {
        const configuration = this.config;

        this.projectName = configuration.get('projectName');
        this.baseName = configuration.get('baseName');
        this.packageName = configuration.get('packageName');

        this.dasherizedBaseName = _.kebabCase(this.baseName);
        this.humanizedBaseName = _.startCase(this.baseName);
      },
    };
  }

  get initializing() {
    if (useBlueprints) return;
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
  _prompting() {
    return {
      askPackageName: prompts.askPackageName,
    };
  }

  get prompting() {
    if (useBlueprints) return;
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _configuring() {
    return {
      setup() {
        this.packagejs = packagejs;

        this.jhipsterConfig.projectName = this.projectName;
        this.jhipsterConfig.baseName = this.baseName;
        this.jhipsterConfig.packageName = this.packageName;

        this.dasherizedBaseName = _.kebabCase(this.baseName);
        this.humanizedBaseName = _.startCase(this.baseName);
      },
    };
  }

  get configuring() {
    if (useBlueprints) return;
    return this._configuring();
  }

  _writing() {
    return {
      ...writeFiles(),
      ...super._missingPostWriting(),
    };
  }

  get writing() {
    if (useBlueprints) return;
    return this._writing();
  }

  _install() {
    return {};
  }

  get install() {
    if (useBlueprints) return;
    return this._install();
  }

  _end() {
    return {};
  }

  get end() {
    if (useBlueprints) return;
    return this._end();
  }
};
