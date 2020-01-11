/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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

const { createApplicationConfigurationFromObject } = require('./jdl_application_configuration_factory');
const JDLApplicationEntities = require('./jdl_application_entities');

module.exports = class JDLApplication {
  constructor({ config = {}, entityNames = [] } = {}) {
    this.config = createApplicationConfigurationFromObject(config);
    this.entityNames = new JDLApplicationEntities(entityNames);
  }

  getConfig() {
    return this.config;
  }

  addEntityName(entityName) {
    if (!entityName) {
      throw new Error('An entity name has to be passed so as to be added to the application.');
    }
    this.entityNames.add(entityName);
  }

  addEntityNames(entityNames = []) {
    this.entityNames.addEntityNames(entityNames);
  }

  getEntityNames() {
    return this.entityNames.toArray();
  }

  forEachEntityName(passedFunction) {
    this.entityNames.forEach(passedFunction);
  }

  toString() {
    let stringifiedApplication = `application {\n${this.config.toString(2)}\n`;
    if (this.entityNames.size() !== 0) {
      stringifiedApplication += `\n${this.entityNames.toString(2)}\n`;
    }
    stringifiedApplication += '}';
    return stringifiedApplication;
  }
};
