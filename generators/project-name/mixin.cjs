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
const { defaults, kebabCase, startCase } = require('lodash');

const { requiredConfig, defaultConfig, reproducibleConfigForTests } = require('./config.cjs');
const { options } = require('./options.cjs');
const { BASE_NAME, JHIPSTER_VERSION, PROJECT_NAME } = require('./constants.cjs');

module.exports.dependencyChain = [];

module.exports.mixin = parent =>
  class extends parent {
    /**
     * Load project-name options constants.
     */
    loadProjectNameOptionsConstants(into = this) {}

    /**
     * Register and parse project-name options.
     */
    getProjectNameOptions() {
      return options;
    }

    /**
     * Load required project-name configs into config.
     */
    configureProjectName() {
      if (this.options.reproducible) {
        this.config.defaults(reproducibleConfigForTests);
      }
      this.config.defaults({
        ...requiredConfig,
        baseName: this.getDefaultAppName(),
      });
    }

    /**
     * Load project-name configs into into.
     * all variables should be set to into,
     * all variables should be referred from config,
     * @param {any} config - config to load config from
     * @param {any} into - destination context to use default is context
     */
    loadProjectNameConfig(into = this, config = this.jhipsterConfig) {
      config = defaults({}, config, defaultConfig);
      into[BASE_NAME] = config[BASE_NAME];
      into[JHIPSTER_VERSION] = config[JHIPSTER_VERSION];
      into[PROJECT_NAME] = config[PROJECT_NAME];
    }

    /**
     * Prepare derived project-name properties into fromInto.
     * @param {any} fromInto - source/destination context
     */
    prepareProjectNameDerivedProperties(fromInto = this) {
      fromInto.dasherizedBaseName = kebabCase(fromInto[BASE_NAME]);
      fromInto.humanizedBaseName = startCase(fromInto[BASE_NAME]);
    }

    /**
     * Load project-name constants into 'into'.
     * @param {Object} into - destination context
     */
    loadProjectNameConstants(into = this) {}
  };
