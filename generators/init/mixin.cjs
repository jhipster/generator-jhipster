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
const { defaults } = require('lodash');

const { requiredConfig, defaultConfig } = require('./config.cjs');
const { options } = require('./options.cjs');
const { PRETTIER_DEFAULT_INDENT, SKIP_COMMIT_HOOK, NODE_VERSION } = require('./constants.cjs');

const { GENERATOR_PROJECT_NAME } = require('../generator-list');

module.exports.dependencyChain = [GENERATOR_PROJECT_NAME];

module.exports.mixin = parent =>
  class extends parent {
    /**
     * Load init options constants.
     */
    loadInitOptionsConstants(into = this) {}

    /**
     * Register and parse init options.
     */
    getInitOptions() {
      return options;
    }

    /**
     * Load required init configs into config.
     */
    configureInit() {
      this.config.defaults(requiredConfig);
    }

    /**
     * Load init configs into into.
     * all variables should be set to into,
     * all variables should be referred from config,
     * @param {any} config - config to load config from
     * @param {any} into - destination context to use default is context
     */
    loadInitConfig(config = this.jhipsterConfig, into = this) {
      config = defaults({}, config, defaultConfig);
      into[PRETTIER_DEFAULT_INDENT] = config[PRETTIER_DEFAULT_INDENT];
      into[SKIP_COMMIT_HOOK] = config[SKIP_COMMIT_HOOK];
    }

    /**
     * Load derived init configs into fromInto.
     * @param {any} fromInto - source/destination context
     */
    // eslint-disable-next-line no-empty-pattern
    prepareDerivedInitProperties(fromInto = this) {}

    /**
     * Load derived init configs into 'into'.
     * @param {Object} into - destination context
     */
    loadInitConstants(into = this) {
      this.NODE_VERSION = NODE_VERSION;
    }
  };
