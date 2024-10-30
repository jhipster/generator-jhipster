/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import type JDLObject from '../../core/models/jdl-object.js';
import type JDLApplication from '../../core/models/jdl-application.js';
import type JSONEntity from '../../core/basic-types/json-entity.js';
import type { JdlObjectWrapper } from '../../core/models/jdl-object-wrapper.js';
import BasicEntityConverter from './jdl-to-json-basic-entity-converter.js';
import FieldConverter from './jdl-to-json-field-converter.js';
import RelationshipConverter from './jdl-to-json-relationship-converter.js';
import OptionConverter from './jdl-to-json-option-converter.js';

let entities: Record<string, JSONEntity> | null | undefined;
let jdlObject: JDLObject;
let entitiesPerApplication: Map<string, string[]>;

export default { convert };

/**
 * Converts a JDLObject to ready-to-be exported JSON entities.
 * @param {Object} args - the configuration object, keys:
 * @param {JDLObject} args.jdlObject - the JDLObject to convert to JSON
 * @returns {Map} entities that can be exported to JSON
 */
export function convert(args: JdlObjectWrapper) {
  if (!args?.jdlObject) {
    throw new Error('The JDL object is mandatory.');
  }
  init(args);
  setEntitiesPerApplication();
  if (entitiesPerApplication.size === 0 && jdlObject) {
    const applicationNames = jdlObject.getApplications().map(jdlApplication => jdlApplication.getConfigurationOptionValue('baseName'));
    return new Map(applicationNames.map(applicationName => [applicationName, []]));
  }
  setBasicEntityInformation();
  setFields();
  setRelationships();
  setApplicationToEntities();
  const entitiesForEachApplication = getEntitiesForEachApplicationMap();
  setOptions(entitiesForEachApplication);
  formatEntitiesForEachApplication(entitiesForEachApplication);
  addApplicationsWithoutEntities(entitiesForEachApplication);
  return entitiesForEachApplication;
}

function init(args: JdlObjectWrapper): void {
  if (jdlObject) {
    resetState();
  }
  jdlObject = args.jdlObject;
  entities = {};
  entitiesPerApplication = new Map();
}

function resetState(): void {
  jdlObject = null as any;
  entities = null;
}

function setEntitiesPerApplication(): void {
  jdlObject?.forEachApplication((jdlApplication: JDLApplication) => {
    const entityNames = jdlApplication.getEntityNames();
    if (entityNames.length === 0) {
      return;
    }
    const baseName = jdlApplication.getConfigurationOptionValue('baseName');
    entitiesPerApplication.set(baseName, entityNames);
  });
}

function setBasicEntityInformation(): void {
  const convertedEntities = BasicEntityConverter.convert(jdlObject.getEntities());
  convertedEntities.forEach((jsonEntity, entityName) => {
    entities![entityName] = jsonEntity;
  });
}

function setFields(): void {
  const convertedFields = FieldConverter.convert(jdlObject);
  convertedFields.forEach((entityFields, entityName) => {
    entities![entityName].addFields(entityFields);
  });
}

function setRelationships(): void {
  const convertedRelationships = RelationshipConverter.convert(jdlObject?.getRelationships(), jdlObject?.getEntityNames());
  convertedRelationships.forEach((entityRelationships, entityName) => {
    entities![entityName].addRelationships(entityRelationships);
  });
}

function setApplicationToEntities(): void {
  jdlObject?.forEachApplication((jdlApplication: JDLApplication) => {
    const baseName = jdlApplication.getConfigurationOptionValue('baseName');
    jdlApplication.forEachEntityName((entityName: string) => {
      if (!entities![entityName]) {
        return;
      }
      entities![entityName].applications.push(baseName);
    });
  });
}

function setOptions(entitiesForEachApplication) {
  const convertedOptionContents = OptionConverter.convert(jdlObject);
  convertedOptionContents.forEach((optionContent, entityName) => {
    entities![entityName].setOptions(optionContent);
  });
  jdlObject?.forEachApplication(jdlApplication => {
    const convertedOptionContentsForApplication = OptionConverter.convert(jdlApplication);
    const applicationName = jdlApplication.getConfigurationOptionValue('baseName');
    const applicationEntities = entitiesForEachApplication.get(applicationName);
    convertedOptionContentsForApplication.forEach((optionContent, entityName) => {
      if (!applicationEntities[entityName]) {
        return;
      }
      applicationEntities[entityName].setOptions(optionContent);
    });
  });
}

function getEntitiesForEachApplicationMap(): Map<string, any> {
  const entitiesForEachApplication = new Map();
  entitiesPerApplication.forEach((entityNames, applicationName) => {
    const entitiesInObject = entityNames
      .filter(entityName => !!entities![entityName])
      .map(entityName => entities![entityName])
      .reduce((accumulator, currentEntity) => {
        return {
          ...accumulator,
          [currentEntity.name]: currentEntity,
        };
      }, {});

    entitiesForEachApplication.set(applicationName, entitiesInObject);
  });
  return entitiesForEachApplication;
}

function formatEntitiesForEachApplication(entitiesForEachApplication) {
  entitiesForEachApplication.forEach((applicationEntities, applicationName) => {
    entitiesForEachApplication.set(applicationName, Object.values(applicationEntities));
  });
}

function addApplicationsWithoutEntities(entitiesForEachApplication: Map<string, string[]>) {
  jdlObject?.forEachApplication(jdlApplication => {
    if (jdlApplication.getEntityNames().length === 0) {
      entitiesForEachApplication.set(jdlApplication.getConfigurationOptionValue('baseName'), []);
    }
  });
}
