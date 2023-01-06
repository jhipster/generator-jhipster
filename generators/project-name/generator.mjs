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

import BaseApplicationGenerator from '../base-application/index.mjs';

import { GENERATOR_PROJECT_NAME } from '../generator-list.mjs';
import { BASE_NAME } from './constants.mjs';

const { startCase } = _;

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../base-application/types.mjs').BaseApplication>}
 */
export default class ProjectNameGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    if (this.options.help) return;

    this.sharedData.getControl().existingProject =
      this.options.defaults ||
      this.options.withEntities ||
      this.options.applicationWithConfig ||
      (this.jhipsterConfig.baseName !== undefined && this.config.existed);
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_PROJECT_NAME);
    }
    if (this.sharedData.getControl().existingProject && !this.jhipsterConfig.baseName) {
      this.jhipsterConfig.baseName = this.getDefaultAppName();
    }
  }

  get prompting() {
    return {
      async showPrompts() {
        await this.prompt(
          [
            {
              name: BASE_NAME,
              type: 'input',
              validate: input => this.validateBaseName(input),
              message: 'What is the base name of your application?',
              default: () => this.getDefaultAppName(),
            },
          ],
          this.config
        );
      },
    };
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      load({ application }) {
        const { baseName, projectDescription } = this.jhipsterConfig;
        application.baseName = baseName;
        application.projectDescription = projectDescription;
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ application }) {
        const { baseName } = application;
        const humanizedBaseName = baseName.toLowerCase() === 'jhipster' ? 'JHipster' : _.startCase(baseName);
        _.defaults(application, {
          humanizedBaseName,
          camelizedBaseName: _.camelCase(baseName),
          hipster: this.getHipster(baseName),
          capitalizedBaseName: _.upperFirst(baseName),
          dasherizedBaseName: _.kebabCase(baseName),
          lowercaseBaseName: baseName.toLowerCase(),
          upperFirstCamelCaseBaseName: this.upperFirstCamelCase(baseName),
          projectDescription: `Description for ${humanizedBaseName}`,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  /*
   * Start of local public API, blueprints may override to customize the generator behavior.
   */

  /**
   * Validates baseName
   * @param {String} input - Base name to be checked
   * @returns Boolean
   */
  validateBaseName(input) {
    if (!/^([\w-]*)$/.test(input)) {
      return 'Your base name cannot contain special characters or a blank space';
    }
    if (/_/.test(input)) {
      return 'Your base name cannot contain underscores as this does not meet the URI spec';
    }
    if (input?.toLowerCase() === 'application') {
      return "Your base name cannot be named 'application' as this is a reserved name for Spring Boot";
    }
    return true;
  }
}
