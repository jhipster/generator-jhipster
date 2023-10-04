/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import BasicEntityConverter from './jdl-to-json-basic-entity-converter.js';
import FieldConverter from './jdl-to-json-field-converter.js';
import RelationshipConverter from './jdl-to-json-relationship-converter.js';
import OptionConverter from './jdl-to-json-option-converter.js';
import JDLObject from '../../models/jdl-object.js';
import SecureClauseConverter from './jdl-to-json-secure-converter.js';
import { JDLSecurityType } from '../../models/jdl-security-type.js';

let entities;
let jdlObject: JDLObject | null;

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
export function convert(args: any = {}) {
  if (!args.jdlObject || !args.applicationName || !args.databaseType) {
    throw new Error("The JDL object, the application's name and its the database type are mandatory.");
  }
  init(args);
  setBasicEntityInformation();
  setOptions();
  setFields();
  setRelationships();
  setSecureClause();
  setApplicationToEntities();
  return new Map([[args.applicationName, Object.values(entities)]]);
}

function init(args) {
  if (jdlObject) {
    resetState();
  }
  jdlObject = args.jdlObject;
  entities = {};
}

function resetState() {
  jdlObject = null;
  entities = null;
}

function setBasicEntityInformation() {
  const convertedEntities = BasicEntityConverter.convert(jdlObject!.getEntities());
  convertedEntities.forEach((jsonEntity, entityName) => {
    entities[entityName] = jsonEntity;
  });
}

function setOptions() {
  const convertedOptionContents = OptionConverter.convert(jdlObject!);
  convertedOptionContents.forEach((optionContent, entityName) => {
    entities[entityName].setOptions(optionContent);
  });
}

function setFields() {
  const convertedFields = FieldConverter.convert(jdlObject!);
  convertedFields.forEach((entityFields, entityName) => {
    entities[entityName].addFields(entityFields);
  });
}

function setSecureClause() {
  if (jdlObject) {
    const convertedSecure = SecureClauseConverter.convert(jdlObject.getEntities());
    convertedSecure.forEach((entitySecure, entityName) => {
      if (entitySecure && entitySecure.securityType !== JDLSecurityType.None) {
        entities[entityName].secure = entitySecure;
      }
    });
  }
}

function setRelationships() {
  const convertedRelationships = RelationshipConverter.convert(jdlObject!.getRelationships(), jdlObject!.getEntityNames());
  convertedRelationships.forEach((entityRelationships, entityName) => {
    entities[entityName].addRelationships(entityRelationships);
  });
}

function setApplicationToEntities() {
  Object.keys(entities).forEach(entityName => {
    entities[entityName].applications = '*';
  });
}
