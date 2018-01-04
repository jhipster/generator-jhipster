/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const chalk = require('chalk');
const BaseGenerator = require('../generator-base');
const constants = require('../generator-constants');
const prompts = require('./prompts');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.argument('name', { type: String, required: true });
        this.name = this.options.name;
    }

    initializing() {
        this.log(`The spring-controller ${this.name} is being created.`);
        this.baseName = this.config.get('baseName');
        this.packageName = this.config.get('packageName');
        this.packageFolder = this.config.get('packageFolder');
        this.databaseType = this.config.get('databaseType');
        this.controllerActions = [];
    }

    get prompting() {
        return {
            askForControllerActions: prompts.askForControllerActions
        };
    }

    get default() {
        return {
            insight() {
                const insight = this.insight();
                insight.trackWithEvent('generator', 'spring-controller');
            }
        };
    }

    writing() {
        this.controllerClass = _.upperFirst(this.name);
        this.controllerInstance = _.lowerFirst(this.name);
        this.apiPrefix = _.kebabCase(this.name);

        if (this.controllerActions.length === 0) {
            this.log(chalk.green('No controller actions found, addin a default action'));
            this.controllerActions.push({
                actionName: 'defaultAction',
                actionMethod: 'Get'
            });
        }

        // helper for Java imports
        this.usedMethods = _.uniq(this.controllerActions.map(action => action.actionMethod));
        this.usedMethods = this.usedMethods.sort();

        this.mappingImports = this.usedMethods.map(method => `org.springframework.web.bind.annotation.${method}Mapping`);
        this.mockRequestImports = this.usedMethods.map(method => `static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.${method.toLowerCase()}`);

        // IntelliJ optimizes imports after a certain count
        this.mockRequestImports = this.mockRequestImports.length > 3 ? ['static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*'] : this.mockRequestImports;

        this.mainClass = this.getMainClassName();

        this.controllerActions.forEach((action) => {
            action.actionPath = _.kebabCase(action.actionName);
            action.actionNameUF = _.upperFirst(action.actionName);
            this.log(chalk.green(`adding ${action.actionMethod} action '${action.actionName}' for /api/${this.apiPrefix}/${action.actionPath}`));
        });

        this.template(
            `${SERVER_MAIN_SRC_DIR}package/web/rest/_Resource.java`,
            `${SERVER_MAIN_SRC_DIR}${this.packageFolder}/web/rest/${this.controllerClass}Resource.java`
        );

        this.template(
            `${SERVER_TEST_SRC_DIR}package/web/rest/_ResourceIntTest.java`,
            `${SERVER_TEST_SRC_DIR}${this.packageFolder}/web/rest/${this.controllerClass}ResourceIntTest.java`
        );
    }
};
