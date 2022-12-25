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

import JDLEnums from './jdl-enums.js';
import JDLRelationships from './jdl-relationships.js';
import JDLOptions from './jdl-options.js';
import { binaryOptions } from '../jhipster/index.mjs';
import JDLEntity from './jdl-entity.js';

/**
 * The JDL object class, containing applications, entities etc.
 */
export default class JDLObject {
  applications: Record<string, any>;
  deployments: Record<string, any>;
  entities: Record<string, JDLEntity>;
  enums: JDLEnums;
  relationships: JDLRelationships;
  options: JDLOptions;

  constructor() {
    this.applications = {};
    this.deployments = {};
    this.entities = {};
    this.enums = new JDLEnums();
    this.relationships = new JDLRelationships();
    this.options = new JDLOptions();
  }

  getOptions() {
    return this.options.getOptions();
  }

  /**
   * Adds or replaces an application.
   * @param application the application.
   */
  addApplication(application) {
    if (!application) {
      throw new Error("Can't add nil application.");
    }
    const baseName = application.getConfigurationOptionValue('baseName');
    this.applications[baseName] = application;
  }

  getApplicationQuantity() {
    return Object.keys(this.applications).length;
  }

  getApplication(applicationName) {
    if (!applicationName) {
      return undefined;
    }
    return this.applications[applicationName];
  }

  getApplications() {
    return Object.values(this.applications);
  }

  forEachApplication(passedFunction) {
    if (!passedFunction) {
      return;
    }
    Object.keys(this.applications).forEach(applicationName => {
      const application = this.applications[applicationName];
      passedFunction(application);
    });
  }

  /**
   * Adds or replaces a deployment.
   * @param deployment the deployment.
   */
  addDeployment(deployment) {
    if (!deployment) {
      throw new Error("Can't add nil deployment.");
    }
    this.deployments[deployment.deploymentType] = deployment;
  }

  getDeploymentQuantity() {
    return Object.keys(this.deployments).length;
  }

  forEachDeployment(passedFunction) {
    if (!passedFunction) {
      return;
    }
    Object.keys(this.deployments).forEach((deploymentName, index, array) => {
      const deployment = this.deployments[deploymentName];
      passedFunction(deployment, index, array);
    });
  }

  /**
   * Adds or replaces an entity.
   * @param entity the entity to add.
   */
  addEntity(entity: JDLEntity) {
    if (!entity) {
      throw new Error("Can't add nil entity.");
    }
    this.entities[entity.name] = entity;
  }

  getEntity(entityName: string): JDLEntity {
    if (!entityName) {
      throw new Error('An entity name must be passed so as to be retrieved.');
    }
    return this.entities[entityName];
  }

  getEntities() {
    return Object.values(this.entities);
  }

  getEntityQuantity() {
    return this.getEntityNames().length;
  }

  getEntityNames() {
    return Object.keys(this.entities);
  }

  forEachEntity(passedFunction: (entity: JDLEntity, index: number, entityNames: string[]) => void) {
    if (!passedFunction) {
      return;
    }
    Object.keys(this.entities).forEach((entityName, index, array) => {
      const entity = this.entities[entityName];
      passedFunction(entity, index, array);
    });
  }

  /**
   * Adds or replaces an enum.
   * @param enumToAdd the enum to add.
   */
  addEnum(enumToAdd) {
    if (!enumToAdd) {
      throw new Error("Can't add nil enum.");
    }
    this.enums.add(enumToAdd);
  }

  hasEnum(enumName) {
    return this.enums.has(enumName);
  }

  getEnum(enumName) {
    return this.enums.get(enumName);
  }

  getEnumQuantity() {
    return this.enums.size();
  }

  forEachEnum(passedFunction) {
    if (!passedFunction) {
      return;
    }
    this.enums.forEach(jdlEnum => {
      passedFunction(jdlEnum);
    });
  }

  addRelationship(relationship) {
    if (!relationship) {
      throw new Error("Can't add nil relationship.");
    }
    this.relationships.add(relationship);
  }

  getRelationshipQuantity(applicationName?: string) {
    if (!applicationName) {
      return this.relationships.size();
    }
    const applicationEntityNames = this.applications[applicationName].entityNames;
    let count = 0;
    this.relationships.forEach(relationship => {
      if (applicationEntityNames.has(relationship.from) || applicationEntityNames.has(relationship.to)) {
        count++;
      }
    });
    return count;
  }

  forEachRelationship(passedFunction) {
    if (!passedFunction) {
      return;
    }
    this.relationships.forEach(jdlRelationship => {
      passedFunction(jdlRelationship);
    });
  }

  getRelationships() {
    return this.relationships.toArray();
  }

  addOption(option) {
    if (!option || !option.getType) {
      throw new Error("Can't add nil option.");
    }
    this.options.addOption(option);
  }

  getOptionsForName(optionName) {
    return this.options.getOptionsForName(optionName);
  }

  forEachOption(passedFunction) {
    if (!passedFunction) {
      return;
    }
    this.options.forEach(passedFunction);
  }

  hasOption(optionName) {
    if (!optionName) {
      return false;
    }
    return this.options.has(optionName);
  }

  isEntityInMicroservice(entityName) {
    const options = this.getOptionsForName(binaryOptions.Options.MICROSERVICE);
    return options.some(option => option.entityNames.has('*') || option.entityNames.has(entityName));
  }

  getOptionQuantity() {
    return this.options.size();
  }

  toString() {
    let string = '';
    if (this.getApplicationQuantity() !== 0) {
      string += `${applicationsToString(this.applications)}\n`;
    }
    if (this.getDeploymentQuantity() !== 0) {
      string += `${deploymentsToString(this.deployments)}\n`;
    }
    if (this.getEntityQuantity() !== 0) {
      string += `${entitiesToString(this.entities)}\n`;
    }
    if (this.getEnumQuantity() !== 0) {
      string += `${this.enums.toString()}\n`;
    }
    if (this.getRelationshipQuantity() !== 0) {
      string += `${relationshipsToString(this.relationships)}\n`;
    }
    if (this.getOptionQuantity() !== 0) {
      string += `${optionsToString(this.options)}`;
    }
    return string;
  }
}

function applicationsToString(applications) {
  let string = '';
  Object.keys(applications).forEach(applicationName => {
    string += `${applications[applicationName].toString()}\n`;
  });
  return string;
}

function deploymentsToString(deployments: Record<any, any>) {
  let string = '';
  Object.values(deployments).forEach(deployment => {
    string += `${deployment.toString()}\n`;
  });
  return string;
}

function entitiesToString(entities) {
  let string = '';
  Object.keys(entities).forEach(entityName => {
    string += `${entities[entityName].toString()}\n`;
  });
  return string.slice(0, string.length - 1);
}

function relationshipsToString(relationships) {
  const string = relationships.toString();
  if (string === '') {
    return '';
  }
  return `${relationships.toString()}\n`;
}
function optionsToString(options) {
  const string = options.toString();
  if (string === '') {
    return '';
  }
  return `${string}\n`;
}
