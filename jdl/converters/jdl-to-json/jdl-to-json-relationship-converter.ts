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

import _ from 'lodash';
import { relationshipTypes, relationshipOptions, validations } from '../../jhipster/index.mjs';
import { camelCase, lowerFirst } from '../../utils/string-utils.js';
import JDLRelationship from '../../models/jdl-relationship.js';

const {
  Validations: { REQUIRED },
} = validations;
const { JPA_DERIVED_IDENTIFIER } = relationshipOptions;
const { MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY, ONE_TO_ONE } = relationshipTypes;

const USER = 'user';
const AUTHORITY = 'authority';
const builtInEntities = new Set([USER, AUTHORITY]);

let convertedRelationships;

export default { convert };

/**
 * Converts passed JDL relationships to JSON content.
 * @param jdlRelationships - the relationships to convert
 * @param entityNames - all the entities' names
 * @param {Object} conversionOptions - the conversion options
 * @param {Boolean} [conversionOptions.unidirectionalRelationships] - Whether to generate unidirectional relationships
 * @return {Map<String, Array<Object>>} a map having for keys entity names and for values arrays of JSON relationships.
 */
export function convert(jdlRelationships: JDLRelationship[] = [], entityNames: string[] = [], conversionOptions: any = {}) {
  if (jdlRelationships.length === 0 || entityNames.length === 0) {
    return new Map();
  }
  convertedRelationships = new Map(entityNames.map(entityName => [entityName, []]));
  const relatedRelationships = getRelatedRelationships(jdlRelationships, entityNames);
  relatedRelationships.forEach((relatedRelationship, currentEntityName) => {
    setRelationshipsFromEntity(relatedRelationship, currentEntityName, conversionOptions);
    setRelationshipsToEntity(relatedRelationship, currentEntityName, conversionOptions);
  });
  return convertedRelationships;
}

function getRelatedRelationships(relationships, entityNames) {
  const relatedRelationships = new Map();
  entityNames.forEach(entityName => {
    const relationshipsRelatedToEntity: {
      from: any[];
      to: any[];
    } = {
      from: [],
      to: [],
    };
    relationships.forEach(jdlRelationship => {
      if (jdlRelationship.from === entityName) {
        relationshipsRelatedToEntity.from.push(jdlRelationship);
      }
      if (
        jdlRelationship.to === entityName &&
        (jdlRelationship.injectedFieldInTo || Object.keys(jdlRelationship.options.destination).length !== 0)
      ) {
        relationshipsRelatedToEntity.to.push(jdlRelationship);
      }
    });
    relatedRelationships.set(entityName, relationshipsRelatedToEntity);
  });
  return relatedRelationships;
}

function setRelationshipsFromEntity(relatedRelationships, entityName, conversionOptions) {
  const { unidirectionalRelationships } = conversionOptions;
  relatedRelationships.from.forEach(relationshipToConvert => {
    const otherSplitField: any = extractField(relationshipToConvert.injectedFieldInTo);
    const convertedRelationship: any = {
      relationshipType: _.kebabCase(relationshipToConvert.type),
      otherEntityName: camelCase(relationshipToConvert.to),
    };
    if (otherSplitField.relationshipName) {
      convertedRelationship.otherEntityRelationshipName = lowerFirst(otherSplitField.relationshipName);
    }
    if (unidirectionalRelationships) {
      convertedRelationship.unidirectional = !otherSplitField.relationshipName;
    }
    if (relationshipToConvert.isInjectedFieldInFromRequired) {
      convertedRelationship.relationshipValidateRules = REQUIRED;
    }
    if (relationshipToConvert.commentInFrom) {
      convertedRelationship.javadoc = relationshipToConvert.commentInFrom;
    }
    const splitField: any = extractField(relationshipToConvert.injectedFieldInFrom);
    convertedRelationship.relationshipName = camelCase(splitField.relationshipName || relationshipToConvert.to);
    if (splitField.otherEntityField) {
      convertedRelationship.otherEntityField = lowerFirst(splitField.otherEntityField);
    }
    if (relationshipToConvert.type === ONE_TO_ONE) {
      convertedRelationship.ownerSide = true;
    } else if (relationshipToConvert.type === MANY_TO_MANY) {
      if (!relationshipToConvert.injectedFieldInTo) {
        if (!conversionOptions.unidirectionalRelationships && !builtInEntities.has(relationshipToConvert.to.toLowerCase())) {
          convertedRelationship.otherEntityRelationshipName = lowerFirst(relationshipToConvert.from);
          const convertedOtherEntityRelationships = convertedRelationships.get(relationshipToConvert.to);
          const otherSideRelationship: any = {
            relationshipName: camelCase(relationshipToConvert.from),
            otherEntityName: camelCase(relationshipToConvert.from),
            relationshipType: _.kebabCase(MANY_TO_MANY),
            otherEntityRelationshipName: lowerFirst(relationshipToConvert.to),
            ownerSide: false,
          };
          if (otherSplitField.otherEntityField) {
            otherSideRelationship.otherEntityField = lowerFirst(otherSplitField.otherEntityField);
          }
          convertedOtherEntityRelationships.push(otherSideRelationship);
        }
      }
      convertedRelationship.ownerSide = true;
    }
    setOptionsForRelationshipSourceSide(relationshipToConvert, convertedRelationship);
    const convertedEntityRelationships = convertedRelationships.get(entityName);
    convertedEntityRelationships.push(convertedRelationship);
  });
}

function setRelationshipsToEntity(relatedRelationships, entityName, conversionOptions) {
  relatedRelationships.to.forEach(relationshipToConvert => {
    const relationshipType = relationshipToConvert.type === ONE_TO_MANY ? MANY_TO_ONE : relationshipToConvert.type;
    const otherSplitField = extractField(relationshipToConvert.injectedFieldInFrom);
    const convertedRelationship: any = {
      relationshipType: _.kebabCase(relationshipType),
      otherEntityName: camelCase(relationshipToConvert.from),
    };
    if (!conversionOptions.unidirectionalRelationships || otherSplitField.relationshipName) {
      convertedRelationship.otherEntityRelationshipName =
        lowerFirst(otherSplitField.relationshipName) || camelCase(relationshipToConvert.to);
    }
    if (relationshipToConvert.isInjectedFieldInToRequired) {
      convertedRelationship.relationshipValidateRules = REQUIRED;
    }
    if (relationshipToConvert.commentInTo) {
      convertedRelationship.javadoc = relationshipToConvert.commentInTo;
    }
    const splitField: any = extractField(relationshipToConvert.injectedFieldInTo);
    convertedRelationship.relationshipName = camelCase(splitField.relationshipName || relationshipToConvert.from);
    if (splitField.otherEntityField) {
      convertedRelationship.otherEntityField = lowerFirst(splitField.otherEntityField);
    }
    if (relationshipToConvert.type === ONE_TO_ONE || relationshipToConvert.type === MANY_TO_MANY) {
      convertedRelationship.ownerSide = false;
    } else if (relationshipToConvert.type === ONE_TO_MANY) {
      relationshipToConvert.injectedFieldInTo = relationshipToConvert.injectedFieldInTo || lowerFirst(relationshipToConvert.from);
    } else if (relationshipToConvert.type === MANY_TO_ONE) {
      convertedRelationship.relationshipType = 'one-to-many';
    }
    setOptionsForRelationshipDestinationSide(relationshipToConvert, convertedRelationship);
    const convertedEntityRelationships = convertedRelationships.get(entityName);
    convertedEntityRelationships.push(convertedRelationship);
  });
}

function setOptionsForRelationshipSourceSide(relationshipToConvert, convertedRelationship) {
  convertedRelationship.options = convertedRelationship.options || {};
  relationshipToConvert.forEachGlobalOption((optionName, optionValue) => {
    if (optionName === JPA_DERIVED_IDENTIFIER) {
      if (convertedRelationship.ownerSide) {
        convertedRelationship.useJPADerivedIdentifier = optionValue;
      }
    } else {
      convertedRelationship.options[optionName] = optionValue;
    }
  });
  relationshipToConvert.forEachDestinationOption((optionName, optionValue) => {
    convertedRelationship.options[optionName] = optionValue;
  });
  if (Object.keys(convertedRelationship.options).length === 0) {
    delete convertedRelationship.options;
  }
}

function setOptionsForRelationshipDestinationSide(relationshipToConvert, convertedRelationship) {
  convertedRelationship.options = convertedRelationship.options || {};
  relationshipToConvert.forEachGlobalOption((optionName, optionValue) => {
    if (optionName === JPA_DERIVED_IDENTIFIER) {
      if (convertedRelationship.ownerSide) {
        convertedRelationship.useJPADerivedIdentifier = optionValue;
      }
    } else {
      convertedRelationship.options[optionName] = optionValue;
    }
  });
  relationshipToConvert.forEachSourceOption((optionName, optionValue) => {
    convertedRelationship.options[optionName] = optionValue;
  });
  if (Object.keys(convertedRelationship.options).length === 0) {
    delete convertedRelationship.options;
  }
}

/**
 * Parses the string "<relationshipName>(<otherEntityField>)"
 * @param{String} field
 * @return{Object} where 'relationshipName' is the relationship name and
 *                'otherEntityField' is the other entity field name
 */
function extractField(field) {
  const splitField: any = {
    relationshipName: '',
  };
  if (field) {
    const chunks = field.replace('(', '/').replace(')', '').split('/');
    splitField.relationshipName = chunks[0];
    if (chunks.length > 1) {
      splitField.otherEntityField = chunks[1];
    }
  }
  return splitField;
}
