/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const _ = require('lodash');
const { MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY, ONE_TO_ONE } = require('../../core/jhipster/relationship_types');
const { REQUIRED } = require('../../core/jhipster/validations');
const { JPA_DERIVED_IDENTIFIER } = require('../../core/jhipster/relationship_options');
const { camelCase, lowerFirst } = require('../../utils/string_utils');

const USER = 'user';
const AUTHORITY = 'authority';
const builtInEntities = new Set([USER, AUTHORITY]);

let convertedRelationships;

module.exports = {
  convert
};

/**
 * Converts passed JDL relationships to JSON content.
 * @param {Array<JDLRelationship>} jdlRelationships - the relationships to convert.
 * @param {Array<String>} entityNames - all the entities' names.
 * @return {Map<String, Array<Object>>} a map having for keys entity names and for values arrays of JSON relationships.
 */
function convert(jdlRelationships = [], entityNames = []) {
  if (jdlRelationships.length === 0 || entityNames.length === 0) {
    return new Map();
  }
  convertedRelationships = new Map(entityNames.map(entityName => [entityName, []]));
  const relatedRelationships = getRelatedRelationships(jdlRelationships, entityNames);
  relatedRelationships.forEach((relatedRelationship, currentEntityName) => {
    setRelationshipsFromEntity(relatedRelationship, currentEntityName);
    setRelationshipsToEntity(relatedRelationship, currentEntityName);
  });
  return convertedRelationships;
}

function getRelatedRelationships(relationships, entityNames) {
  const relatedRelationships = new Map();
  entityNames.forEach(entityName => {
    const relationshipsRelatedToEntity = {
      from: [],
      to: []
    };
    relationships.forEach(jdlRelationship => {
      if (jdlRelationship.from === entityName) {
        relationshipsRelatedToEntity.from.push(jdlRelationship);
      }
      if (jdlRelationship.to === entityName && jdlRelationship.injectedFieldInTo) {
        relationshipsRelatedToEntity.to.push(jdlRelationship);
      }
    });
    relatedRelationships.set(entityName, relationshipsRelatedToEntity);
  });
  return relatedRelationships;
}

function setRelationshipsFromEntity(relatedRelationships, entityName) {
  relatedRelationships.from.forEach(relationshipToConvert => {
    const otherSplitField = extractField(relationshipToConvert.injectedFieldInTo);
    const convertedRelationship = {
      relationshipType: _.kebabCase(relationshipToConvert.type),
      otherEntityName: camelCase(relationshipToConvert.to),
      otherEntityRelationshipName: lowerFirst(otherSplitField.relationshipName) || camelCase(relationshipToConvert.from)
    };
    if (relationshipToConvert.isInjectedFieldInFromRequired) {
      convertedRelationship.relationshipValidateRules = REQUIRED;
    }
    if (relationshipToConvert.commentInFrom) {
      convertedRelationship.javadoc = relationshipToConvert.commentInFrom;
    }
    const splitField = extractField(relationshipToConvert.injectedFieldInFrom);
    if (relationshipToConvert.type === ONE_TO_ONE) {
      convertedRelationship.relationshipName = camelCase(splitField.relationshipName || relationshipToConvert.to);
      convertedRelationship.otherEntityField = lowerFirst(splitField.otherEntityField);
      convertedRelationship.ownerSide = true;
    } else if (relationshipToConvert.type === ONE_TO_MANY) {
      convertedRelationship.relationshipName = camelCase(splitField.relationshipName || relationshipToConvert.to);
    } else if (relationshipToConvert.type === MANY_TO_ONE && relationshipToConvert.injectedFieldInFrom) {
      convertedRelationship.relationshipName = camelCase(splitField.relationshipName);
      convertedRelationship.otherEntityField = lowerFirst(splitField.otherEntityField);
    } else if (relationshipToConvert.type === MANY_TO_MANY) {
      convertedRelationship.relationshipName = camelCase(splitField.relationshipName || relationshipToConvert.to);
      convertedRelationship.otherEntityField = lowerFirst(splitField.otherEntityField);
      if (!relationshipToConvert.injectedFieldInTo) {
        convertedRelationship.otherEntityRelationshipName = lowerFirst(relationshipToConvert.from);
        relationshipToConvert.type = MANY_TO_MANY;
        if (!builtInEntities.has(relationshipToConvert.to.toLowerCase())) {
          const convertedOtherEntityRelationships = convertedRelationships.get(relationshipToConvert.to);
          const otherSideRelationship = {
            relationshipName: camelCase(relationshipToConvert.from),
            otherEntityName: camelCase(relationshipToConvert.from),
            relationshipType: _.kebabCase(MANY_TO_MANY),
            otherEntityField: lowerFirst(otherSplitField.otherEntityField),
            otherEntityRelationshipName: lowerFirst(relationshipToConvert.to),
            ownerSide: false
          };
          convertedOtherEntityRelationships.push(otherSideRelationship);
        }
      }
      convertedRelationship.ownerSide = true;
    }
    setOptionsForRelationship(relationshipToConvert, convertedRelationship);
    const convertedEntityRelationships = convertedRelationships.get(entityName);
    convertedEntityRelationships.push(convertedRelationship);
  });
}

function setRelationshipsToEntity(relatedRelationships, entityName) {
  relatedRelationships.to.forEach(relationshipToConvert => {
    const relationshipType = relationshipToConvert.type === ONE_TO_MANY ? MANY_TO_ONE : relationshipToConvert.type;
    const otherSplitField = extractField(relationshipToConvert.injectedFieldInFrom);
    const convertedRelationship = {
      relationshipType: _.kebabCase(relationshipType),
      otherEntityName: camelCase(relationshipToConvert.from),
      otherEntityRelationshipName: lowerFirst(otherSplitField.relationshipName) || camelCase(relationshipToConvert.to)
    };
    if (relationshipToConvert.isInjectedFieldInToRequired) {
      convertedRelationship.relationshipValidateRules = REQUIRED;
    }
    if (relationshipToConvert.commentInTo) {
      convertedRelationship.javadoc = relationshipToConvert.commentInTo;
    }
    const splitField = extractField(relationshipToConvert.injectedFieldInTo);
    if (relationshipToConvert.type === ONE_TO_ONE) {
      convertedRelationship.relationshipName = camelCase(splitField.relationshipName);
      convertedRelationship.ownerSide = false;
    } else if (relationshipToConvert.type === ONE_TO_MANY) {
      relationshipToConvert.injectedFieldInTo =
        relationshipToConvert.injectedFieldInTo || lowerFirst(relationshipToConvert.from);
      convertedRelationship.relationshipName = camelCase(splitField.relationshipName || relationshipToConvert.from);
      convertedRelationship.otherEntityField = lowerFirst(splitField.otherEntityField);
    } else if (relationshipToConvert.type === MANY_TO_ONE && relationshipToConvert.injectedFieldInTo) {
      convertedRelationship.relationshipName = camelCase(splitField.relationshipName);
      convertedRelationship.relationshipType = 'one-to-many';
    } else if (relationshipToConvert.type === MANY_TO_MANY) {
      convertedRelationship.relationshipName = camelCase(splitField.relationshipName);
      convertedRelationship.otherEntityField = lowerFirst(splitField.otherEntityField);
      convertedRelationship.ownerSide = false;
    }
    setOptionsForRelationship(relationshipToConvert, convertedRelationship);
    const convertedEntityRelationships = convertedRelationships.get(entityName);
    convertedEntityRelationships.push(convertedRelationship);
  });
}

function setOptionsForRelationship(relationshipToConvert, convertedRelationship) {
  relationshipToConvert.forEachOption((optionName, optionValue) => {
    if (optionName === JPA_DERIVED_IDENTIFIER) {
      if (convertedRelationship.ownerSide) {
        convertedRelationship.useJPADerivedIdentifier = optionValue;
      }
    } else {
      if (!convertedRelationship.options) {
        convertedRelationship.options = {};
      }
      convertedRelationship.options[optionName] = optionValue;
    }
  });
}

/**
 * Parses the string "<relationshipName>(<otherEntityField>)"
 * @param{String} field
 * @return{Object} where 'relationshipName' is the relationship name and
 *                'otherEntityField' is the other entity field name
 */
function extractField(field) {
  const splitField = {
    otherEntityField: 'id', // id by default
    relationshipName: ''
  };
  if (field) {
    const chunks = field
      .replace('(', '/')
      .replace(')', '')
      .split('/');
    splitField.relationshipName = chunks[0];
    if (chunks.length > 1) {
      splitField.otherEntityField = chunks[1];
    }
  }
  return splitField;
}
