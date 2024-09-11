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
import type JSONEntity from '../../core/basic-types/json-entity.js';
import type { JdlObjectWrapper } from '../../core/models/jdl-object-wrapper.js';
import BasicEntityConverter from './jdl-to-json-basic-entity-converter.js';
import FieldConverter from './jdl-to-json-field-converter.js';
import RelationshipConverter from './jdl-to-json-relationship-converter.js';
import OptionConverter from './jdl-to-json-option-converter.js';

let entities: Record<string, JSONEntity> | null | undefined;
let jdlObject: JDLObject | null | undefined;

export default {
  convert,
};

/**
 * Converts a JDLObject to ready-to-be exported JSON entities.
 * @param {Object} args - the configuration object, keys:
 * @param {JDLObject} args.jdlObject - the JDLObject to convert to JSON
 * @param {String} args.applicationName - the application's name
 * @param {String} args.databaseType - the database type
 * @param {string} args.applicationType - the application's type
 * @returns {Map} entities that can be exported to JSON
 */
export function convert(args: JdlObjectWrapper) {
  if (!args?.jdlObject || !args.applicationName || !args.databaseType) {
    throw new Error("The JDL object, the application's name, and its the database type are mandatory.");
  }
  init(args);
  setBasicEntityInformation();
  setOptions();
  setFields();
  setRelationships();
  setApplicationToEntities();
  return new Map([[args.applicationName, Object.values(entities!)]]);
}

function init(args: JdlObjectWrapper) {
  if (jdlObject) {
    resetState();
  }
  jdlObject = args.jdlObject;
  entities = {};
}

function resetState(): void {
  jdlObject = null;
  entities = null;
}

function setBasicEntityInformation(): void {
  const convertedEntities = BasicEntityConverter.convert(jdlObject!.getEntities());
  convertedEntities.forEach((jsonEntity, entityName) => {
    entities![entityName] = jsonEntity;
  });
}

function setOptions(): void {
  const convertedOptionContents = OptionConverter.convert(jdlObject!);
  convertedOptionContents.forEach((optionContent, entityName) => {
    entities![entityName].setOptions(optionContent);
  });
}

function setFields(): void {
  const convertedFields = FieldConverter.convert(jdlObject!);
  convertedFields.forEach((entityFields, entityName) => {
    entities![entityName].addFields(entityFields);
  });
}

function setRelationships(): void {
  const convertedRelationships = RelationshipConverter.convert(jdlObject!.getRelationships(), jdlObject!.getEntityNames());
  convertedRelationships.forEach((entityRelationships, entityName) => {
    entities![entityName].addRelationships(entityRelationships);
  });
}

function setApplicationToEntities(): void {
  Object.keys(entities!).forEach(entityName => {
    entities![entityName].applications = '*';
  });
}
