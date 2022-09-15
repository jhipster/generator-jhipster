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
const _ = require('lodash');
const chalk = require('chalk');

const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { INITIALIZING_PRIORITY, PROMPTING_PRIORITY, LOADING_PRIORITY, DEFAULT_PRIORITY, WRITING_PRIORITY } =
  require('../../lib/constants/priorities.cjs').compat;

const constants = require('../generator-constants');
const prompts = require('./prompts');
const statistics = require('../statistics');
const { OptionNames } = require('../../jdl/jhipster/application-options');
const cacheProviders = require('../../jdl/jhipster/cache-types');
const messageBrokers = require('../../jdl/jhipster/message-broker-types');
const { GENERATOR_SPRING_CONTROLLER } = require('../generator-list');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
const {
  BASE_NAME,
  PACKAGE_NAME,
  PACKAGE_FOLDER,
  DATABASE_TYPE,
  MESSAGE_BROKER,
  CACHE_PROVIDER,
  APPLICATION_TYPE,
  AUTHENTICATION_TYPE,
  REACTIVE,
} = OptionNames;

const NO_CACHE_PROVIDER = cacheProviders.NO;
const NO_MESSAGE_BROKER = messageBrokers.NO;

module.exports = class extends BaseBlueprintGenerator {
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

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_SPRING_CONTROLLER, { arguments: [this.name] });
    }
  }

  // Public API method used by the getter and also by Blueprints
  _initializing() {
    return {
      validateFromCli() {
        this.checkInvocationFromCLI();
      },

      initializing() {
        this.log(`The spring-controller ${this.name} is being created.`);
        const configuration = this.config;
        this.baseName = configuration.get(BASE_NAME);
        this.packageName = configuration.get(PACKAGE_NAME);
        this.packageFolder = configuration.get(PACKAGE_FOLDER);
        this.databaseType = configuration.get(DATABASE_TYPE);
        this.messageBroker = configuration.get(MESSAGE_BROKER) === NO_MESSAGE_BROKER ? false : configuration.get(MESSAGE_BROKER);
        this.cacheProvider = configuration.get(CACHE_PROVIDER) || NO_CACHE_PROVIDER;
        if (this.messageBroker === undefined) {
          this.messageBroker = false;
        }
        this.reactiveController = false;
        this.applicationType = configuration.get(APPLICATION_TYPE);
        this.authenticationType = configuration.get(AUTHENTICATION_TYPE);
        this.reactive = configuration.get(REACTIVE);
        this.reactiveController = this.reactive;
        this.controllerActions = [];
      },
    };
  }

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
  _prompting() {
    return {
      askForControllerActions: prompts.askForControllerActions,
    };
  }

  get [PROMPTING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._prompting();
  }

  // Public API method used by the getter and also by Blueprints
  _loading() {
    return {
      loadSharedConfig() {
        this.loadServerConfig();
        this.loadDerivedServerConfig();
      },
    };
  }

  get [LOADING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._loading();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_SPRING_CONTROLLER);
      },
    };
  }

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {
      writing() {
        this.controllerClass = _.upperFirst(this.name) + (this.name.endsWith('Resource') ? '' : 'Resource');
        this.controllerInstance = _.lowerFirst(this.controllerClass);
        this.apiPrefix = _.kebabCase(this.name);

        if (this.controllerActions.length === 0) {
          this.log(chalk.green('No controller actions found, adding a default action'));
          this.controllerActions.push({
            actionName: 'defaultAction',
            actionMethod: 'Get',
          });
        }

        // helper for Java imports
        this.usedMethods = _.uniq(this.controllerActions.map(action => action.actionMethod));
        this.usedMethods = this.usedMethods.sort();

        this.mappingImports = this.usedMethods.map(method => `org.springframework.web.bind.annotation.${method}Mapping`);
        this.mockRequestImports = this.usedMethods.map(
          method => `static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.${method.toLowerCase()}`
        );

        this.mockRequestImports =
          this.mockRequestImports.length > 3
            ? ['static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*']
            : this.mockRequestImports;

        this.mainClass = this.getMainClassName();

        this.controllerActions.forEach(action => {
          action.actionPath = _.kebabCase(action.actionName);
          action.actionNameUF = _.upperFirst(action.actionName);
          this.log(
            chalk.green(`adding ${action.actionMethod} action '${action.actionName}' for /api/${this.apiPrefix}/${action.actionPath}`)
          );
        });

        this.template(
          `${this.fetchFromInstalledJHipster('spring-controller/templates')}/${SERVER_MAIN_SRC_DIR}package/web/rest/Resource.java.ejs`,
          `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/web/rest/${this.controllerClass}.java`
        );
        this.template(
          `${this.fetchFromInstalledJHipster('spring-controller/templates')}/${SERVER_TEST_SRC_DIR}package/web/rest/ResourceIT.java.ejs`,
          `${SERVER_TEST_SRC_DIR}${this.packageFolder}/web/rest/${this.controllerClass}IT.java`
        );
      },
    };
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }
};
