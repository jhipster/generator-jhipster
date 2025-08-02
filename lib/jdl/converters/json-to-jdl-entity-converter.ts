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

import { lowerFirst, upperFirst } from 'lodash-es';

import { asJdlRelationshipType } from '../core/basic-types/relationship-types.ts';
import { binaryOptions, relationshipOptions, unaryOptions } from '../core/built-in-options/index.ts';
import { JDLEntity, JDLEnum } from '../core/models/index.ts';
import JDLBinaryOption from '../core/models/jdl-binary-option.ts';
import JDLField from '../core/models/jdl-field.ts';
import JDLObject from '../core/models/jdl-object.ts';
import type { JDLRelationshipModel, JDLRelationshipOptions, JDLSourceEntitySide } from '../core/models/jdl-relationship.js';
import JDLRelationship from '../core/models/jdl-relationship.ts';
import JDLUnaryOption from '../core/models/jdl-unary-option.ts';
import JDLValidation from '../core/models/jdl-validation.ts';
import type { JSONEntity, JSONField, JSONRelationship } from '../core/types/json-config.js';

const { BUILT_IN_ENTITY } = relationshipOptions;
const { FILTER, NO_FLUENT_METHOD, READ_ONLY, EMBEDDED } = unaryOptions;
const { ANGULAR_SUFFIX, CLIENT_ROOT_FOLDER, DTO, MICROSERVICE, PAGINATION, SEARCH, SERVICE } = binaryOptions.Options;

export default {
  convertEntitiesToJDL,
};

let entities: Map<string, JSONEntity>;
let jdlObject: JDLObject;

/**
 * Convert the passed entities (parsed from JSON files) to a JDL object.
 * @param params - an object containing the entities and relevant options.
 * @param params.entities - a Map having for keys the entity names and values the JSON entity files.
 * @return the parsed entities in the JDL form.
 */
export function convertEntitiesToJDL(entities: Map<string, JSONEntity>): JDLObject {
  if (!entities) {
    throw new Error('Entities have to be passed to be converted.');
  }
  init(entities);
  addEntities();
  addRelationshipsToJDL();
  return jdlObject;
}

function init(ents: Map<string, JSONEntity>): void {
  entities = ents;
  jdlObject = new JDLObject();
}

function addEntities(): void {
  entities.forEach((entity, entityName) => {
    addEntity(entity, entityName);
  });
}

function addEntity(entity: JSONEntity, entityName: string): void {
  jdlObject.addEntity(convertJSONToJDLEntity(entity, entityName));
  addEnumsToJDL(entity);
  addEntityOptionsToJDL(entity, entityName);
}

function convertJSONToJDLEntity(entity: JSONEntity, entityName: string): JDLEntity {
  const jdlEntity = new JDLEntity({
    name: entityName,
    tableName: entity.entityTableName,
    comment: entity.documentation,
    annotations: entity.annotations,
  });
  addFields(jdlEntity, entity);
  return jdlEntity;
}

function addFields(jdlEntity: JDLEntity, entity: JSONEntity): void {
  entity?.fields?.forEach(field => {
    jdlEntity.addField(convertJSONToJDLField(field));
  });
}

function convertJSONToJDLField(field: JSONField): JDLField {
  const jdlField = new JDLField({
    name: lowerFirst(field.fieldName),
    type: field.fieldType,
    comment: field.documentation,
  });
  addValidations(jdlField, field);
  return jdlField;
}

function addValidations(jdlField: JDLField, field: JSONField): void {
  if (field.fieldValidateRules) {
    field.fieldValidateRules.forEach((rule: string) => {
      jdlField.addValidation(convertJSONToJDLValidation(rule, field));
    });
  }
}

function convertJSONToJDLValidation(rule: string, field: JSONField): JDLValidation {
  return new JDLValidation({
    name: rule,
    value: field[`fieldValidateRules${upperFirst(rule)}`],
  });
}

function addEnumsToJDL(entity: JSONEntity): void {
  entity?.fields?.forEach((field: JSONField) => {
    if (field.fieldValues !== undefined) {
      jdlObject.addEnum(
        new JDLEnum({
          name: field.fieldType,
          values: getEnumValuesFromString(field.fieldValues),
          comment: field.fieldTypeDocumentation,
        }),
      );
    }
  });
}

function getEnumValuesFromString(valuesAsString: string): any[] {
  return valuesAsString.split(',').map(fieldValue => {
    // if fieldValue looks like ENUM_VALUE (something)
    if (fieldValue.includes('(')) {
      const [key, value] = fieldValue
        .replace(/^(\w+)\s\((\w+)\)$/, (match, matchedKey, matchedValue) => `${matchedKey},${matchedValue}`)
        .split(',');
      return {
        key,
        value,
      };
    }
    return { key: fieldValue };
  });
}

/*
 * Adds relationships for entities to JDL.
 * The jdl passed must contain the jdl entities concerned by the relationships
 */
function addRelationshipsToJDL(): void {
  entities.forEach((entity: JSONEntity, entityName: string) => {
    dealWithRelationships(entity.relationships, entityName);
  });
}

function dealWithRelationships(relationships: JSONRelationship[] | undefined, entityName: string) {
  if (!relationships) {
    return;
  }
  relationships.forEach(relationship => {
    if (relationship.relationshipSide === 'right') {
      // Right side will be merged into the left side.
      return;
    }
    const jdlRelationship = getRelationship(relationship, entityName);
    if (jdlRelationship) {
      jdlObject.addRelationship(jdlRelationship);
    }
  });
}

function getRelationship(relationship: JSONRelationship, entityName: string) {
  const type = asJdlRelationshipType(relationship.relationshipType);
  const options = getRelationshipOptions(relationship);

  const sourceEntitySideAttributes = getSourceEntitySideAttributes(entityName, relationship);
  const destinationEntityName = upperFirst(relationship.otherEntityName);
  const destinationJDLEntity = jdlObject.getEntity(destinationEntityName);
  const destinationEntity = entities.get(destinationEntityName);

  let relationshipConfiguration: JDLRelationshipModel = {
    side: relationship.relationshipSide,
    from: entityName,
    to: destinationJDLEntity?.name ?? destinationEntityName,
    type,
    options,
    injectedFieldInFrom: sourceEntitySideAttributes.injectedFieldInSourceEntity,
    isInjectedFieldInFromRequired: sourceEntitySideAttributes.injectedFieldInSourceIsRequired,
    commentInFrom: sourceEntitySideAttributes.commentForSourceEntity,
    isInjectedFieldInToRequired: false,
    injectedFieldInTo: null,
    commentInTo: null,
  };

  relationshipConfiguration = {
    ...relationshipConfiguration,
    ...sourceEntitySideAttributes,
  };

  if (!destinationJDLEntity || !destinationEntity) {
    if (relationshipConfiguration.options.global[BUILT_IN_ENTITY]) {
      return new JDLRelationship(relationshipConfiguration);
    }
    return undefined;
  }
  const isEntityTheDestinationSideEntity = (otherEntityName: string, otherEntityRelationshipName: string) =>
    otherEntityName === entityName && otherEntityRelationshipName === relationship.relationshipName;
  const destinationSideAttributes = getDestinationEntitySideAttributes(isEntityTheDestinationSideEntity, destinationEntity.relationships);
  relationshipConfiguration = {
    ...relationshipConfiguration,
    injectedFieldInTo: destinationSideAttributes.injectedFieldInDestinationEntity,
    isInjectedFieldInToRequired: destinationSideAttributes.injectedFieldInDestinationIsRequired ?? false,
    commentInTo: destinationSideAttributes.commentForDestinationEntity,
  };
  return new JDLRelationship(relationshipConfiguration);
}

function getSourceEntitySideAttributes(entityName: string, relationship: JSONRelationship): JDLSourceEntitySide {
  return {
    sourceEntity: entityName,
    injectedFieldInSourceEntity: getInjectedFieldInSourceEntity(relationship),
    injectedFieldInSourceIsRequired: relationship.relationshipValidateRules,
    commentForSourceEntity: relationship.documentation,
  };
}

function getDestinationEntitySideAttributes(
  isEntityTheDestinationSideEntity: (otherEntityName: string, otherEntityRelationshipName: string) => boolean,
  destinationEntityRelationships?: JSONRelationship[],
) {
  const foundDestinationSideEntity = destinationEntityRelationships?.find(destinationEntityFromRelationship => {
    return isEntityTheDestinationSideEntity(
      upperFirst(destinationEntityFromRelationship.otherEntityName),
      destinationEntityFromRelationship.otherEntityRelationshipName!,
    );
  });
  if (!foundDestinationSideEntity) {
    return {};
  }
  // Bidirectional relationship
  let injectedFieldInDestinationEntity = foundDestinationSideEntity.relationshipName;
  if (!!foundDestinationSideEntity.otherEntityField && foundDestinationSideEntity.otherEntityField !== 'id') {
    injectedFieldInDestinationEntity += `(${foundDestinationSideEntity.otherEntityField})`;
  }
  const injectedFieldInDestinationIsRequired = !!foundDestinationSideEntity.relationshipValidateRules;
  const commentForDestinationEntity = foundDestinationSideEntity.documentation;
  return {
    injectedFieldInDestinationEntity,
    injectedFieldInDestinationIsRequired,
    commentForDestinationEntity,
  };
}

function getRelationshipOptions(relationship: JSONRelationship): JDLRelationshipOptions {
  const options: JDLRelationshipOptions = {
    global: {},
    source: relationship.options ?? {},
    destination: {},
  };
  if (relationship.relationshipWithBuiltInEntity) {
    options.global[BUILT_IN_ENTITY] = true;
  }
  return options;
}

function getInjectedFieldInSourceEntity(relationship: JSONRelationship): string {
  return (
    relationship.relationshipName +
    (relationship.otherEntityField && relationship.otherEntityField !== 'id' ? `(${relationship.otherEntityField})` : '')
  );
}

function addEntityOptionsToJDL(entity: JSONEntity, entityName: string): void {
  if (entity.fluentMethods === false) {
    addUnaryOptionToJDL(NO_FLUENT_METHOD, entityName);
  }
  [DTO, PAGINATION, SERVICE].forEach(option => {
    if (entity[option] && entity[option] !== 'no') {
      addBinaryOptionToJDL(option, entity[option], entityName);
    }
  });
  if (entity.searchEngine) {
    addBinaryOptionToJDL(SEARCH, entity.searchEngine, entityName);
  }
  // angularSuffix in BinaryOptions, angularJSSuffix in Json
  if (entity.angularJSSuffix) {
    addBinaryOptionToJDL(ANGULAR_SUFFIX, entity.angularJSSuffix, entityName);
  }
  // microservice in BinaryOptions, microserviceName in Json
  if (entity.microserviceName !== undefined) {
    addBinaryOptionToJDL(MICROSERVICE, entity.microserviceName, entityName);
  }
  if (entity.jpaMetamodelFiltering === true) {
    addUnaryOptionToJDL(FILTER, entityName);
  }
  if (entity.readOnly === true) {
    addUnaryOptionToJDL(READ_ONLY, entityName);
  }
  if (entity.embedded === true) {
    addUnaryOptionToJDL(EMBEDDED, entityName);
  }
  if (entity.clientRootFolder) {
    addBinaryOptionToJDL(CLIENT_ROOT_FOLDER, entity.clientRootFolder, entityName);
  }
}

function addUnaryOptionToJDL(unaryOption: string, entityName: string): void {
  jdlObject.addOption(
    new JDLUnaryOption({
      name: unaryOption,
      entityNames: new Set([entityName]),
    }),
  );
}

function addBinaryOptionToJDL(binaryOption: string, value: string, entityName: string): void {
  jdlObject.addOption(
    new JDLBinaryOption({
      name: binaryOption,
      value,
      entityNames: new Set([entityName]),
    }),
  );
}
