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
const { SPRING_BOOT_VERSION, SPRING_BOOT_PARENT_BOM } = require('./constants.cjs');

const { GENERATOR_JAVA } = require('../generator-list');

module.exports.dependencyChain = [GENERATOR_JAVA];

module.exports.mixin = parent =>
  class extends parent {
    /**
     * Register and parse spring-boot options.
     */
    registerSpringBootOptions() {
      this.jhipsterOptions(options);
    }

    /**
     * Load required spring-boot configs into config.
     */
    configureSpringBoot() {
      this.config.defaults(requiredConfig);
    }

    /**
     * Load spring-boot configs into into.
     * all variables should be set to into,
     * all variables should be referred from config,
     * @param {any} config - config to load config from
     * @param {any} into - destination context to use default is context
     */
    loadSpringBootConfig(config = this.jhipsterConfig, into = this) {
      config = defaults({}, config, defaultConfig);
      into[SPRING_BOOT_PARENT_BOM] = config[SPRING_BOOT_PARENT_BOM];
    }

    /**
     * Load derived spring-boot configs into fromInto.
     * @param {any} fromInto - source/destination context
     */
    loadDerivedSpringBootConfig(fromInto = this) {}

    /**
     * Load derived spring-boot configs into 'into'.
     * @param {Object} into - destination context
     */
    loadSpringBootConstants(into = this) {
      into.SPRING_BOOT_VERSION = SPRING_BOOT_VERSION;
    }

    /**
     * Load derived spring-boot configs into 'into'.
     * @param {Object} into - destination context
     */
    loadSpringBootOptionsConstants(into = this) {}

    /**
     * Compose with selected spring-boot.
     */
    async composeWithSelectedSpringBoot(config = this.jhipsterConfig) {
      config = defaults({}, config, defaultConfig);
    }
  };
