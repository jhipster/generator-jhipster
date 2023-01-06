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
import _ from 'lodash';

import BaseGenerator from '../base/index.mjs';

import { SERVER_MAIN_SRC_DIR } from '../generator-constants.mjs';
import statistics from '../statistics.cjs';
import { GENERATOR_SPRING_SERVICE } from '../generator-list.mjs';
import { applicationOptions } from '../../jdl/jhipster/index.mjs';

const { OptionNames } = applicationOptions;
const { BASE_NAME, PACKAGE_NAME, PACKAGE_FOLDER, DATABASE_TYPE } = OptionNames;
export default class SpringServiceGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.argument('name', { type: String, required: true });
    this.name = this.options.name;

    this.option('default', {
      type: Boolean,
      default: false,
      description: 'default option',
    });
    this.defaultOption = this.options.default;
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SPRING_SERVICE, { arguments: [this.name] });
    }
  }

  // Public API method used by the getter and also by Blueprints
  get initializing() {
    return {
      initializing() {
        this.log(`The service ${this.name} is being created.`);
        const configuration = this.config;
        this.baseName = configuration.get(BASE_NAME);
        this.packageName = configuration.get(PACKAGE_NAME);
        this.packageFolder = configuration.get(PACKAGE_FOLDER);
        this.databaseType = configuration.get(DATABASE_TYPE);
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  // Public API method used by the getter and also by Blueprints
  get prompting() {
    return {
      prompting() {
        const prompts = [
          {
            type: 'confirm',
            name: 'useInterface',
            message: '(1/1) Do you want to use an interface for your service?',
            default: false,
          },
        ];
        if (!this.defaultOption) {
          const done = this.async();
          this.prompt(prompts).then(props => {
            this.useInterface = props.useInterface;
            done();
          });
        } else {
          this.useInterface = true;
        }
      },
    };
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  // Public API method used by the getter and also by Blueprints
  get loading() {
    return {
      loadSharedConfig() {
        this.loadAppConfig();
        this.loadServerConfig();

        this.loadDerivedAppConfig();
        this.loadDerivedServerConfig();
      },
    };
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  // Public API method used by the getter and also by Blueprints
  get default() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_SPRING_SERVICE, { interface: this.useInterface });
      },
    };
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  // Public API method used by the getter and also by Blueprints
  get writing() {
    return {
      write() {
        this.serviceClass = _.upperFirst(this.name) + (this.name.endsWith('Service') ? '' : 'Service');
        this.serviceInstance = _.lowerCase(this.serviceClass);

        this.writeFile(
          `${this.fetchFromInstalledJHipster('spring-service/templates')}/${SERVER_MAIN_SRC_DIR}package/service/Service.java.ejs`,
          `${SERVER_MAIN_SRC_DIR + this.packageFolder}/service/${this.serviceClass}.java`
        );

        if (this.useInterface) {
          this.writeFile(
            `${this.fetchFromInstalledJHipster(
              'spring-service/templates'
            )}/${SERVER_MAIN_SRC_DIR}package/service/impl/ServiceImpl.java.ejs`,
            `${SERVER_MAIN_SRC_DIR + this.packageFolder}/service/impl/${this.serviceClass}Impl.java`
          );
        }
      },
    };
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}
