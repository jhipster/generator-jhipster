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

import type JSONEntity from '../../core/basic-types/json-entity.ts';
import type JDLApplication from '../../core/models/jdl-application.ts';
import type JDLObject from '../../core/models/jdl-object.ts';

import BasicEntityConverter from './jdl-to-json-basic-entity-converter.ts';
import FieldConverter from './jdl-to-json-field-converter.ts';
import OptionConverter from './jdl-to-json-option-converter.ts';
import RelationshipConverter from './jdl-to-json-relationship-converter.ts';

let entities: Record<string, JSONEntity> | null | undefined;
let jdlObject: JDLObject | null;
let entitiesPerApplication: Map<string, string[]>;

export default { convert };

/**
 * Converts a JDLObject to ready-to-be exported JSON entities.
 */
export function convert(jdlObjectArg: JDLObject) {
  if (!jdlObjectArg) {
    throw new Error('The JDL object is mandatory.');
  }
  init(jdlObjectArg);
  setEntitiesPerApplication();
  if (entitiesPerApplication.size === 0 && jdlObject) {
    const applicationNames = jdlObject.getApplications().map(jdlApplication => jdlApplication.getConfigurationOptionValue('baseName'));
    return new Map(applicationNames.map(applicationName => [applicationName, []]));
  }
  setBasicEntityInformation();
  setFields();
  setRelationships();
  setApplicationToEntities();
  const entitiesForEachApplicationMap = getEntitiesForEachApplicationMap();
  setOptions(entitiesForEachApplicationMap);
  const entitiesForEachApplication = formatEntitiesForEachApplication(entitiesForEachApplicationMap);
  addApplicationsWithoutEntities(entitiesForEachApplication);
  return entitiesForEachApplication;
}

function init(jdlObjectArg: JDLObject): void {
  if (jdlObject) {
    resetState();
  }
  jdlObject = jdlObjectArg;
  entities = {};
  entitiesPerApplication = new Map();
}

function resetState(): void {
  jdlObject = null;
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
  const convertedEntities = BasicEntityConverter.convert(jdlObject!.getEntities());
  convertedEntities.forEach((jsonEntity, entityName) => {
    entities![entityName] = jsonEntity;
  });
}

function setFields(): void {
  const convertedFields = FieldConverter.convert(jdlObject!);
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

function setOptions(entitiesForEachApplication: Map<string, Record<string, JSONEntity>>) {
  const convertedOptionContents = OptionConverter.convert(jdlObject!);
  convertedOptionContents.forEach((optionContent, entityName) => {
    entities![entityName].setOptions(optionContent);
  });
  jdlObject?.forEachApplication(jdlApplication => {
    const convertedOptionContentsForApplication = OptionConverter.convert(jdlApplication);
    const applicationName = jdlApplication.getConfigurationOptionValue('baseName');
    const applicationEntities = entitiesForEachApplication.get(applicationName)!;
    convertedOptionContentsForApplication.forEach((optionContent, entityName) => {
      if (!applicationEntities[entityName]) {
        return;
      }
      applicationEntities[entityName].setOptions(optionContent);
    });
  });
}

function getEntitiesForEachApplicationMap(): Map<string, Record<string, JSONEntity>> {
  const entitiesForEachApplication = new Map<string, Record<string, JSONEntity>>();
  entitiesPerApplication.forEach((entityNames, applicationName) => {
    const entitiesInObject = entityNames
      .filter(entityName => !!entities![entityName])
      .map(entityName => entities![entityName])
      .reduce(
        (accumulator, currentEntity) => {
          return {
            ...accumulator,
            [currentEntity.name]: currentEntity,
          };
        },
        {} as Record<string, JSONEntity>,
      );

    entitiesForEachApplication.set(applicationName, entitiesInObject);
  });
  return entitiesForEachApplication;
}

function formatEntitiesForEachApplication(entitiesForEachApplication: Map<string, Record<string, JSONEntity>>): Map<string, JSONEntity[]> {
  const map = new Map<string, JSONEntity[]>();
  entitiesForEachApplication.forEach((applicationEntities, applicationName) => {
    map.set(applicationName, Object.values(applicationEntities));
  });
  return map;
}

function addApplicationsWithoutEntities(entitiesForEachApplication: Map<string, JSONEntity[]>): void {
  jdlObject?.forEachApplication(jdlApplication => {
    if (jdlApplication.getEntityNames().length === 0) {
      entitiesForEachApplication.set(jdlApplication.getConfigurationOptionValue('baseName'), []);
    }
  });
}
