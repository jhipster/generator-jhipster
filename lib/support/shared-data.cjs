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
const assert = require('assert');

module.exports = class SharedData {
  constructor() {
    this._configDefaultValues = {};
    this._configChoices = {};
  }

  /**
   * Get default value for a given config.
   * @param {String} configName
   * @param {Any} defaultValueFallback
   * @returns {Any}
   */
  getConfigDefaultValue(configName, defaultValueFallback) {
    assert(configName, 'Config name is required');
    const defaultValue = this._configDefaultValues[configName];
    return defaultValue === undefined ? defaultValueFallback : defaultValue;
  }

  /**
   * Set default value for a given config.
   * @param {String} configName
   * @param {Any} defaultValue
   */
  setConfigDefaultValue(configName, defaultValue) {
    assert(configName, 'Config name is required');
    assert(defaultValue !== undefined, `Default value is required for ${configName}`);
    this._configDefaultValues[configName] = defaultValue;
  }

  /**
   * Get choices for a given config.
   * @param {String} configName
   * @param {Any[]} defaultValueFallback
   * @returns {Any[]}
   */
  getConfigChoices(configName, choicesFallback) {
    assert(configName, 'Config name is required');
    const sharedChoices = this._configChoices[configName];
    const choices = sharedChoices === undefined ? choicesFallback : sharedChoices;
    assert(Array.isArray(choices), `Choices must be an array for ${configName}`);
    return choices;
  }

  /**
   * Set choices for a given config.
   * @param {String} configName
   * @param {Any} defaultValue
   */
  setConfigChoices(configName, choices) {
    assert(configName, 'Config name is required');
    assert(Array.isArray(choices), `Choices must be an array for ${configName}`);
    this._configChoices[configName] = choices;
  }
};
