/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { binaryOptions } from '../built-in-options/index.ts';

import type AbstractJDLOption from './abstract-jdl-option.ts';
import type JDLApplication from './jdl-application.ts';
import type JDLDeployment from './jdl-deployment.ts';
import type JDLEntity from './jdl-entity.ts';
import type JDLEnum from './jdl-enum.ts';
import JDLEnums from './jdl-enums.ts';
import JDLOptions from './jdl-options.ts';
import type JDLRelationship from './jdl-relationship.ts';
import JDLRelationships from './jdl-relationships.ts';

/**
 * The JDL object class, containing applications, entities etc.
 */
export default class JDLObject {
  applications: Record<string, JDLApplication>;
  deployments: Record<string, JDLDeployment>;
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

  getOptions(): AbstractJDLOption[] {
    return this.options.getOptions();
  }

  /**
   * Adds or replaces an application.
   * @param application the application.
   */
  addApplication(application: JDLApplication): void {
    if (!application) {
      throw new Error("Can't add nil application.");
    }
    const baseName = application.getConfigurationOptionValue('baseName');
    this.applications[baseName] = application;
  }

  getApplicationQuantity(): number {
    return Object.keys(this.applications).length;
  }

  getApplication(applicationName: string): JDLApplication | undefined {
    if (!applicationName) {
      return undefined;
    }
    return this.applications[applicationName];
  }

  getApplications(): JDLApplication[] {
    return Object.values(this.applications);
  }

  forEachApplication(passedFunction: (app: JDLApplication) => void | undefined | null): void {
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
  addDeployment(deployment: JDLDeployment): void {
    if (!deployment) {
      throw new Error("Can't add nil deployment.");
    }
    this.deployments[deployment.deploymentType] = deployment;
  }

  getDeploymentQuantity(): number {
    return Object.keys(this.deployments).length;
  }

  forEachDeployment(passedFunction: (deployment: JDLDeployment, index: number, array: string[]) => void): void {
    if (!passedFunction) {
      return;
    }
    Object.keys(this.deployments).forEach((deploymentName: string, index: number, array: string[]): void => {
      const deployment = this.deployments[deploymentName];
      passedFunction(deployment, index, array);
    });
  }

  /**
   * Adds or replaces an entity.
   * @param entity the entity to add.
   */
  addEntity(entity: JDLEntity): void {
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

  getEntities(): JDLEntity[] {
    return Object.values(this.entities);
  }

  getEntityQuantity(): number {
    return this.getEntityNames().length;
  }

  getEntityNames(): string[] {
    return Object.keys(this.entities);
  }

  forEachEntity(passedFunction: (entity: JDLEntity, index: number, entityNames: string[]) => void): void {
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
  addEnum(enumToAdd: JDLEnum): void {
    if (!enumToAdd) {
      throw new Error("Can't add nil enum.");
    }
    this.enums.add(enumToAdd);
  }

  hasEnum(enumName: string): boolean {
    return this.enums.has(enumName);
  }

  getEnum(enumName: string): JDLEnum | undefined {
    return this.enums.get(enumName);
  }

  getEnumQuantity(): number {
    return this.enums.size();
  }

  forEachEnum(passedFunction: (jdlEnum: JDLEnum) => void): void {
    if (!passedFunction) {
      return;
    }
    this.enums.forEach(jdlEnum => {
      passedFunction(jdlEnum);
    });
  }

  addRelationship(relationship: JDLRelationship): void {
    if (!relationship) {
      throw new Error("Can't add nil relationship.");
    }
    this.relationships.add(relationship);
  }

  getRelationshipQuantity(applicationName?: string): number {
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

  forEachRelationship(passedFunction: (relationship: JDLRelationship) => void): void {
    if (!passedFunction) {
      return;
    }
    this.relationships.forEach(jdlRelationship => {
      passedFunction(jdlRelationship);
    });
  }

  getRelationships(): JDLRelationship[] {
    return this.relationships.toArray();
  }

  addOption(option: AbstractJDLOption): void {
    if (!option?.getType) {
      throw new Error("Can't add nil option.");
    }
    this.options.addOption(option);
  }

  getOptionsForName(optionName: string): AbstractJDLOption[] {
    return this.options.getOptionsForName(optionName);
  }

  forEachOption(passedFunction: (option: AbstractJDLOption) => void) {
    if (!passedFunction) {
      return;
    }
    this.options.forEach(passedFunction);
  }

  hasOption(optionName: string): boolean {
    if (!optionName) {
      return false;
    }
    return this.options.has(optionName);
  }

  isEntityInMicroservice(entityName: string): boolean {
    const options = this.getOptionsForName(binaryOptions.Options.MICROSERVICE);
    return options.some(option => option.entityNames.has('*') || option.entityNames.has(entityName));
  }

  getOptionQuantity(): number {
    return this.options.size();
  }

  toString(): string {
    return [
      applicationsToString(this.applications),
      deploymentsToString(this.deployments),
      entitiesToString(this.entities),
      this.enums.toString(),
      relationshipsToString(this.relationships),
      optionsToString(this.options),
    ]
      .map(section => section.trim())
      .filter(Boolean)
      .join('\n\n')
      .concat('\n');
  }
}

function applicationsToString(applications: Record<string, JDLApplication>): string {
  return Object.values(applications)
    .map(application => application.toString())
    .join('\n');
}

function deploymentsToString(deployments: Record<any, JDLDeployment>): string {
  return Object.values(deployments)
    .map(deployment => deployment.toString())
    .join('\n');
}

function entitiesToString(entities: Record<string, JDLEntity>): string {
  return Object.values(entities)
    .map(entity => entity.toString())
    .join('\n');
}

function relationshipsToString(relationships: JDLRelationships): string {
  return relationships.toString();
}

function optionsToString(options: JDLOptions): string {
  return options.toString();
}
