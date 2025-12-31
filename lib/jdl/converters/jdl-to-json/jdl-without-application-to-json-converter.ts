/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import type JDLObject from '../../core/models/jdl-object.ts';

import BasicEntityConverter from './jdl-to-json-basic-entity-converter.ts';
import FieldConverter from './jdl-to-json-field-converter.ts';
import OptionConverter from './jdl-to-json-option-converter.ts';
import RelationshipConverter from './jdl-to-json-relationship-converter.ts';

let entities: Record<string, JSONEntity> | null | undefined;
let jdlObject: JDLObject | null | undefined;

export default {
  convert,
};

/**
 * Converts a JDLObject to ready-to-be exported JSON entities.
 */
export function convert(jdlObjectArg: JDLObject, applicationName: string) {
  if (!jdlObjectArg || !applicationName) {
    throw new Error("The JDL object and its application's name are mandatory.");
  }
  init(jdlObjectArg);
  setBasicEntityInformation();
  setOptions();
  setFields();
  setRelationships();
  setApplicationToEntities();
  return new Map([[applicationName, Object.values(entities!)]]);
}

function init(jdlObjectArg: JDLObject) {
  if (jdlObject) {
    resetState();
  }
  jdlObject = jdlObjectArg;
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
    entities![entityName].applications.push('*');
  });
}
