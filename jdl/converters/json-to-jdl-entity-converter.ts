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

import JDLObject from '../models/jdl-object.js';
import { JDLEntity, JDLEnum } from '../models/index.mjs';
import JDLField from '../models/jdl-field.js';
import JDLValidation from '../models/jdl-validation.js';
import JDLRelationship, { JDLRelationshipModel, JDLRelationshipOptions, JDL_RELATIONSHIP_ONE_TO_MANY } from '../models/jdl-relationship.js';
import JDLUnaryOption from '../models/jdl-unary-option.js';
import JDLBinaryOption from '../models/jdl-binary-option.js';

import { lowerFirst, upperFirst } from '../utils/string-utils.js';

import { fieldTypes, unaryOptions, binaryOptions, relationshipOptions } from '../jhipster/index.mjs';
import { Entity, Field, Relationship } from './types.js';
import { asJdlRelationshipType } from './parsed-jdl-to-jdl-object/relationship-converter.js';

const { BlobTypes, CommonDBTypes, RelationalOnlyDBTypes } = fieldTypes;
const { BUILT_IN_ENTITY } = relationshipOptions;
const { FILTER, NO_FLUENT_METHOD, READ_ONLY, EMBEDDED } = unaryOptions;
const { ANGULAR_SUFFIX, CLIENT_ROOT_FOLDER, DTO, MICROSERVICE, PAGINATION, SEARCH, SERVICE } = binaryOptions.Options;

const { ANY, IMAGE, TEXT } = BlobTypes;
const { BYTES } = RelationalOnlyDBTypes;

export default {
  convertEntitiesToJDL,
};

let entities: Map<string, Entity>;
let jdlObject: JDLObject;

/**
 * Convert the passed entities (parsed from JSON files) to a JDL object.
 * @param params - an object containing the entities and relevant options.
 * @param params.entities - a Map having for keys the entity names and values the JSON entity files.
 * @return the parsed entities in the JDL form.
 */
export function convertEntitiesToJDL(params: { entities: Map<string, Entity> }): JDLObject {
  if (!params.entities) {
    throw new Error('Entities have to be passed to be converted.');
  }
  init(params);
  addEntities();
  addRelationshipsToJDL();
  return jdlObject;
}

function init(params) {
  entities = params.entities;
  jdlObject = new JDLObject();
}

function addEntities() {
  entities.forEach((entity, entityName) => {
    addEntity(entity, entityName);
  });
}

function addEntity(entity: Entity, entityName: string) {
  jdlObject.addEntity(convertJSONToJDLEntity(entity, entityName));
  addEnumsToJDL(entity);
  addEntityOptionsToJDL(entity, entityName);
}

function convertJSONToJDLEntity(entity: Entity, entityName: string): JDLEntity {
  const jdlEntity = new JDLEntity({
    name: entityName,
    tableName: entity.entityTableName,
    comment: entity.javadoc,
  });
  addFields(jdlEntity, entity);
  return jdlEntity;
}

function addFields(jdlEntity: JDLEntity, entity: Entity) {
  entity?.fields?.forEach(field => {
    jdlEntity.addField(convertJSONToJDLField(field));
  });
}

function convertJSONToJDLField(field: Field) {
  const jdlField = new JDLField({
    name: lowerFirst(field.fieldName),
    type: field.fieldType,
    comment: field.javadoc,
  });
  if (jdlField.type === BYTES) {
    jdlField.type = getTypeForBlob(field.fieldTypeBlobContent);
  }
  if (field.fieldValidateRules) {
    addValidations(jdlField, field);
  }
  return jdlField;
}

function getTypeForBlob(blobContentType) {
  if ([ANY, IMAGE, TEXT].includes(blobContentType)) {
    return CommonDBTypes[`${blobContentType.toUpperCase()}_BLOB`];
  }
  throw new Error(`Unrecognised blob type: '${blobContentType}'`);
}

function addValidations(jdlField, field) {
  field.fieldValidateRules.forEach(rule => {
    jdlField.addValidation(convertJSONToJDLValidation(rule, field));
  });
}

function convertJSONToJDLValidation(rule, field: Field) {
  return new JDLValidation({
    name: rule,
    value: field[`fieldValidateRules${upperFirst(rule)}`],
  });
}

function addEnumsToJDL(entity: Entity) {
  entity?.fields?.forEach(field => {
    if (field.fieldValues !== undefined) {
      jdlObject.addEnum(
        new JDLEnum({
          name: field.fieldType,
          values: getEnumValuesFromString(field.fieldValues),
          comment: field.fieldTypeJavadoc,
        })
      );
    }
  });
}

function getEnumValuesFromString(valuesAsString) {
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
function addRelationshipsToJDL() {
  entities.forEach((entity, entityName) => {
    dealWithRelationships(entity.relationships, entityName);
  });
}

function dealWithRelationships(relationships: Relationship[] | undefined, entityName: string) {
  if (!relationships) {
    return;
  }
  relationships.forEach(relationship => {
    const jdlRelationship = getRelationship(relationship, entityName);
    if (jdlRelationship) {
      jdlObject.addRelationship(jdlRelationship);
    }
  });
}

function getRelationship(relationship: Relationship, entityName: string) {
  const type = asJdlRelationshipType(relationship.relationshipType);
  const options = getRelationshipOptions(relationship);

  const sourceEntitySideAttributes = getSourceEntitySideAttributes(entityName, relationship);
  const destinationEntityName = upperFirst(relationship.otherEntityName);
  const destinationJDLEntity = jdlObject.getEntity(destinationEntityName);
  const destinationEntity = entities.get(destinationEntityName);

  let relationshipConfiguration: JDLRelationshipModel = {
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
  const isEntityTheDestinationSideEntity = (otherEntityName, otherEntityRelationshipName) =>
    otherEntityName === entityName && otherEntityRelationshipName === relationship.relationshipName;
  const destinationSideAttributes = getDestinationEntitySideAttributes(isEntityTheDestinationSideEntity, destinationEntity.relationships);
  relationshipConfiguration = {
    ...relationshipConfiguration,
    injectedFieldInTo: destinationSideAttributes.injectedFieldInDestinationEntity,
    isInjectedFieldInToRequired: destinationSideAttributes.injectedFieldInDestinationIsRequired ?? false,
    commentInTo: destinationSideAttributes.commentForDestinationEntity,
  };
  if (relationship.relationshipType === 'many-to-one') {
    if (destinationSideAttributes.injectedFieldInDestinationEntity) {
      // This is a bidirectional relationship so consider it as a OneToMany
      return new JDLRelationship({
        type: JDL_RELATIONSHIP_ONE_TO_MANY,
        from: relationshipConfiguration.to,
        to: relationshipConfiguration.from,
        commentInFrom: relationshipConfiguration.commentInTo,
        commentInTo: relationshipConfiguration.commentInFrom,
        injectedFieldInFrom: relationshipConfiguration.injectedFieldInTo,
        injectedFieldInTo: relationshipConfiguration.injectedFieldInFrom,
        isInjectedFieldInFromRequired: relationshipConfiguration.isInjectedFieldInToRequired,
        isInjectedFieldInToRequired: relationshipConfiguration.isInjectedFieldInFromRequired,
        options: {
          global: relationshipConfiguration.options.global,
          destination: relationshipConfiguration.options.source,
          source: relationshipConfiguration.options.destination,
        },
      });
    }
  }
  // Only one side of the relationship with every information is added to the jdl
  if (!relationship.ownerSide && relationship.relationshipType !== 'many-to-one') {
    return undefined;
  }
  return new JDLRelationship(relationshipConfiguration);
}

function getSourceEntitySideAttributes(entityName: string, relationship: Relationship) {
  return {
    sourceEntity: entityName,
    injectedFieldInSourceEntity: getInjectedFieldInSourceEntity(relationship),
    injectedFieldInSourceIsRequired: relationship.relationshipValidateRules,
    commentForSourceEntity: relationship.javadoc,
  };
}

function getDestinationEntitySideAttributes(isEntityTheDestinationSideEntity, destinationEntityRelationships?) {
  const foundDestinationSideEntity = destinationEntityRelationships?.find(destinationEntityFromRelationship => {
    return isEntityTheDestinationSideEntity(
      upperFirst(destinationEntityFromRelationship.otherEntityName),
      destinationEntityFromRelationship.otherEntityRelationshipName
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
  const commentForDestinationEntity = foundDestinationSideEntity.javadoc;
  return {
    injectedFieldInDestinationEntity,
    injectedFieldInDestinationIsRequired,
    commentForDestinationEntity,
  };
}

function getRelationshipOptions(relationship: Relationship): JDLRelationshipOptions {
  const options = {
    global: {},
    source: relationship.options ?? {},
    destination: {},
  };
  if (relationship.relationshipWithBuiltInEntity) {
    options.global[BUILT_IN_ENTITY] = true;
  }
  return options;
}

function getInjectedFieldInSourceEntity(relationship: Relationship) {
  return (
    relationship.relationshipName +
    (relationship.otherEntityField && relationship.otherEntityField !== 'id' ? `(${relationship.otherEntityField})` : '')
  );
}

function addEntityOptionsToJDL(entity: Entity, entityName: string) {
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

function addUnaryOptionToJDL(unaryOption, entityName: string) {
  jdlObject.addOption(
    new JDLUnaryOption({
      name: unaryOption,
      entityNames: [entityName],
    })
  );
}

function addBinaryOptionToJDL(binaryOption, value, entityName: string) {
  jdlObject.addOption(
    new JDLBinaryOption({
      name: binaryOption,
      value,
      entityNames: [entityName],
    })
  );
}
