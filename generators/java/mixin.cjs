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

const { GENERATOR_MAVEN, GENERATOR_GRADLE } = require('../generator-list');
const { requiredConfig, defaultConfig } = require('./config.cjs');
const { options } = require('./options.cjs');
const {
  JAVA_VERSION,
  JAVA_APP_VERSION,
  JAVA_COMPATIBLE_VERSIONS,
  PACKAGE_NAME,
  PACKAGE_NAME_DEFAULT_VALUE,
  PRETTIER_JAVA_INDENT,
  PRETTIER_JAVA_INDENT_DEFAULT_VALUE,
  BUILD_TOOL,
  BUILD_TOOL_DEFAULT_VALUE,
  BUILD_TOOL_MAVEN,
  BUILD_TOOL_GRADLE,
  BUILD_TOOL_PROMPT_CHOICES,
  BUILD_DESTINATION,
} = require('./constants.cjs');

const { GENERATOR_INIT } = require('../generator-list');

module.exports.dependencyChain = [GENERATOR_INIT];

module.exports.mixin = parent =>
  class extends parent {
    /**
     * Load java options constants.
     */
    loadJavaOptionsConstants(into = this) {
      into.PACKAGE_NAME_DEFAULT_VALUE = PACKAGE_NAME_DEFAULT_VALUE;
      into.PRETTIER_JAVA_INDENT_DEFAULT_VALUE = PRETTIER_JAVA_INDENT_DEFAULT_VALUE;
      into.BUILD_TOOL_DEFAULT_VALUE = BUILD_TOOL_DEFAULT_VALUE;
      into.BUILD_TOOL_PROMPT_CHOICES = BUILD_TOOL_PROMPT_CHOICES;
    }

    /**
     * Register and parse java options.
     */
    getJavaOptions() {
      return options;
    }

    /**
     * Load required java configs into config.
     */
    configureJava() {
      this.config.defaults(requiredConfig);
    }

    /**
     * Load java configs into into.
     * all variables should be set to into,
     * all variables should be referred from config,
     * @param {any} config - config to load config from
     * @param {any} into - destination context to use default is context
     */
    loadJavaConfig(config = this.jhipsterConfig, into = this) {
      config = defaults({}, config, defaultConfig);
      into[PACKAGE_NAME] = config[PACKAGE_NAME];
      into[PRETTIER_JAVA_INDENT] = config[PRETTIER_JAVA_INDENT];
      into[BUILD_TOOL] = config[BUILD_TOOL];
      into[BUILD_DESTINATION] = config[BUILD_DESTINATION];
    }

    /**
     * Prepare derived java properties into fromInto.
     * @param {any} fromInto - source/destination context
     */
    prepareDerivedJavaProperties(fromInto = this) {
      fromInto.javaMainClass = fromInto.getMainClassName(fromInto.baseName);
      fromInto.packageFolder = fromInto[PACKAGE_NAME].replace(/\./g, '/');

      fromInto.buildToolMaven = fromInto.buildTool === BUILD_TOOL_MAVEN;
      fromInto.buildToolGradle = fromInto.buildTool === BUILD_TOOL_GRADLE;
      fromInto.buildToolUnknown = !fromInto.buildToolMaven && !fromInto.buildToolGradle;
    }

    /**
     * Load java constants into 'into'.
     * @param {Object} into - destination context
     */
    loadJavaConstants(into = this) {
      into.JAVA_VERSION = JAVA_VERSION;
      into.JAVA_APP_VERSION = JAVA_APP_VERSION;
      into.JAVA_COMPATIBLE_VERSIONS = JAVA_COMPATIBLE_VERSIONS;
    }

    /**
     * Compose with selected java configuration.
     */
    async composeWithJavaDependencies(config = this.jhipsterConfig) {
      config = defaults({}, config, defaultConfig);
      const buildTool = config[BUILD_TOOL];
      if (buildTool === BUILD_TOOL_MAVEN) {
        await this.composeWithJHipster(GENERATOR_MAVEN);
      } else if (buildTool === BUILD_TOOL_GRADLE) {
        await this.composeWithJHipster(GENERATOR_GRADLE);
      } else if (buildTool.includes(':')) {
        await this.composeWithJHipster(buildTool);
      }
    }
  };
