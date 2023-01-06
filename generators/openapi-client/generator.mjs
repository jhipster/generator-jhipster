/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import shelljs from 'shelljs';
import chalk from 'chalk';

import BaseGenerator from '../base/index.mjs';

import { GENERATOR_OPENAPI_CLIENT } from '../generator-list.mjs';
import { askActionType, askExistingAvailableDocs, askGenerationInfos } from './prompts.mjs';
import { writeFiles, customizeFiles } from './files.mjs';
import { openapiOptions } from '../../jdl/jhipster/index.mjs';

const { OpenAPIOptionsNames, OpenAPIDefaultValues } = openapiOptions;

export default class OpenapiClientGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);
    this.option(OpenAPIOptionsNames.REGEN, {
      desc: 'Regenerates all saved clients',
      type: Boolean,
      defaults: OpenAPIDefaultValues.REGEN,
    });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_OPENAPI_CLIENT);
    }
  }

  get initializing() {
    return {
      ...super.initializing,
      sayHello() {
        // Have Yeoman greet the user.
        this.log(chalk.white('Welcome to the JHipster OpenApi client Sub-Generator'));
      },
      getConfig() {
        this.openApiClients = this.config.get('openApiClients') || {};
        this.loadAppConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
        this.loadPlatformConfig();

        this.loadDerivedAppConfig();
        this.loadDerivedServerConfig();
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return {
      askActionType,
      askExistingAvailableDocs,
      askGenerationInfos,
    };
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
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

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get writing() {
    return writeFiles();
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return customizeFiles();
  }

  get [BaseGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get install() {
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

  get [BaseGenerator.INSTALL]() {
    return this.delegateTasksToBlueprint(() => this.install);
  }

  get end() {
    return {
      tearDown() {
        this.log('End of openapi-client generator');
      },
    };
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
