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
const shelljs = require('shelljs');
const chalk = require('chalk');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const {
  INITIALIZING_PRIORITY,
  PROMPTING_PRIORITY,
  CONFIGURING_PRIORITY,
  WRITING_PRIORITY,
  POST_WRITING_PRIORITY,
  INSTALL_PRIORITY,
  END_PRIORITY,
} = require('../../lib/constants/priorities.cjs').compat;

const { GENERATOR_OPENAPI_CLIENT } = require('../generator-list');
const { OpenAPIOptionsNames, OpenAPIDefaultValues } = require('../../jdl/jhipster/openapi-options');
const prompts = require('./prompts');
const { writeFiles, customizeFiles } = require('./files');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, features);
    this.option(OpenAPIOptionsNames.REGEN, {
      desc: 'Regenerates all saved clients',
      type: Boolean,
      defaults: OpenAPIDefaultValues.REGEN,
    });
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_OPENAPI_CLIENT);
    }
  }

  _initializing() {
    return {
      ...super._initializing(),
      validateFromCli() {
        this.checkInvocationFromCLI();
      },
      sayHello() {
        // Have Yeoman greet the user.
        this.log(chalk.white('Welcome to the JHipster OpenApi client Sub-Generator'));
      },
      getConfig() {
        this.openApiClients = this.config.get('openApiClients') || {};
        this.loadAppConfig();
        this.loadServerConfig();
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  _prompting() {
    return {
      askActionType: prompts.askActionType,
      askExistingAvailableDocs: prompts.askExistingAvailableDocs,
      askGenerationInfos: prompts.askGenerationInfos,
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._prompting();
  }

  _configuring() {
    return {
      determineApisToGenerate() {
        this.clientsToGenerate = {};
        if (this.options.regen || this.props.action === 'all') {
          this.clientsToGenerate = this.openApiClients;
        } else if (this.props.action === 'new' || this.props.action === undefined) {
          this.clientsToGenerate[this.props.cliName] = {
            spec: this.props.inputSpec,
            useServiceDiscovery: this.props.useServiceDiscovery,
            generatorName: this.props.generatorName,
          };
        } else if (this.props.action === 'select') {
          this.props.selected.forEach(selection => {
            this.clientsToGenerate[selection.cliName] = selection.spec;
          });
        }
      },

      saveConfig() {
        if (!this.options.regen && this.props.saveConfig) {
          this.openApiClients[this.props.cliName] = this.clientsToGenerate[this.props.cliName];
          this.config.set('openApiClients', this.openApiClients);
        }
      },
    };
  }

  get [CONFIGURING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._configuring();
  }

  _writing() {
    return writeFiles();
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }

  _postWriting() {
    return customizeFiles();
  }

  get [POST_WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._postWriting();
  }

  _install() {
    return {
      executeOpenApiClient() {
        this.clientPackageManager = this.config.get('clientPackageManager');
        const { stdout, stderr } = shelljs.exec(`${this.clientPackageManager} install`, { silent: this.silent });
        if (stderr) {
          this.log(`Something went wrong while running npm install: ${stdout} ${stderr}`);
        }
        Object.keys(this.clientsToGenerate).forEach(cliName => {
          this.log(chalk.green(`\nGenerating client for ${cliName}`));
          const generatorName = this.clientsToGenerate[cliName].generatorName;
          const { stdout, stderr } = shelljs.exec(`${this.clientPackageManager} run openapi-client:${cliName}`, { silent: this.silent });
          if (!stderr) {
            this.success(`Succesfully generated ${cliName} ${generatorName} client`);
          } else {
            this.log(`Something went wrong while generating client ${cliName}: ${stdout} ${stderr}`);
          }
        });
      },
    };
  }

  get [INSTALL_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._install();
  }

  _end() {
    return {
      tearDown() {
        this.log('End of openapi-client generator');
      },
    };
  }

  get [END_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._end();
  }
};
