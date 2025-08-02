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

import { kebabCase, lowerFirst } from 'lodash-es';
import { relationshipOptions, validations } from '../../core/built-in-options/index.ts';
import { customCamelCase } from '../../../utils/string-utils.ts';
import type JDLRelationship from '../../core/models/jdl-relationship.js';
import type { JSONRelationship } from '../../core/types/json-config.js';
import type { RelationshipType } from '../../core/basic-types/relationships.js';

const {
  Validations: { REQUIRED },
} = validations;
const { BUILT_IN_ENTITY } = relationshipOptions;

let convertedRelationships: Map<string, any[]>;

export default { convert };

/**
 * Converts passed JDL relationships to JSON content.
 * @param jdlRelationships - the relationships to convert
 * @param entityNames - all the entities' names
 * @return {Map<String, Array<Object>>} a map having for keys entity names and for values arrays of JSON relationships.
 */
export function convert(jdlRelationships: JDLRelationship[] = [], entityNames: string[] = []) {
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

type RelationshipsRelatedToEntity = {
  from: JDLRelationship[];
  to: JDLRelationship[];
};

function getRelatedRelationships(relationships: JDLRelationship[], entityNames: string[]): Map<string, RelationshipsRelatedToEntity> {
  const relatedRelationships = new Map();
  entityNames.forEach(entityName => {
    const relationshipsRelatedToEntity: RelationshipsRelatedToEntity = {
      from: [],
      to: [],
    };
    relationships.forEach(jdlRelationship => {
      if (jdlRelationship.from === entityName) {
        relationshipsRelatedToEntity.from.push(jdlRelationship);
      }
      if (
        jdlRelationship.to === entityName &&
        (jdlRelationship.injectedFieldInTo || Object.keys(jdlRelationship.options.source).length !== 0)
      ) {
        relationshipsRelatedToEntity.to.push(jdlRelationship);
      }
    });
    relatedRelationships.set(entityName, relationshipsRelatedToEntity);
  });
  return relatedRelationships;
}

function setRelationshipsFromEntity(relatedRelationships: RelationshipsRelatedToEntity, entityName: string): void {
  relatedRelationships.from.forEach(relationshipToConvert => {
    const otherSplitField: any = extractField(relationshipToConvert.injectedFieldInTo);
    const convertedRelationship: Partial<JSONRelationship> = {
      relationshipSide: 'left',
      relationshipType: kebabCase(relationshipToConvert.type) as RelationshipType,
      otherEntityName: customCamelCase(relationshipToConvert.to),
    };
    if (otherSplitField.relationshipName) {
      convertedRelationship.otherEntityRelationshipName = lowerFirst(otherSplitField.relationshipName);
    }
    if (relationshipToConvert.isInjectedFieldInFromRequired) {
      convertedRelationship.relationshipValidateRules = REQUIRED;
    }
    if (relationshipToConvert.commentInFrom) {
      convertedRelationship.documentation = relationshipToConvert.commentInFrom;
    }
    const splitField: any = extractField(relationshipToConvert.injectedFieldInFrom);
    convertedRelationship.relationshipName = customCamelCase(splitField.relationshipName || relationshipToConvert.to);
    if (splitField.otherEntityField) {
      convertedRelationship.otherEntityField = lowerFirst(splitField.otherEntityField);
    }
    setOptionsForRelationshipSourceSide(relationshipToConvert, convertedRelationship);
    const convertedEntityRelationships = convertedRelationships.get(entityName)!;
    convertedEntityRelationships.push(convertedRelationship);
  });
}

export const otherRelationshipType = (relationshipType: string) => relationshipType.split('-').reverse().join('-');

function setRelationshipsToEntity(relatedRelationships: RelationshipsRelatedToEntity, entityName: string): void {
  relatedRelationships.to.forEach(relationshipToConvert => {
    const otherSplitField = extractField(relationshipToConvert.injectedFieldInFrom);
    const convertedRelationship: any = {
      relationshipSide: 'right',
      relationshipType: otherRelationshipType(kebabCase(relationshipToConvert.type)),
      otherEntityName: customCamelCase(relationshipToConvert.from),
    };
    if (otherSplitField.relationshipName) {
      convertedRelationship.otherEntityRelationshipName =
        lowerFirst(otherSplitField.relationshipName) || customCamelCase(relationshipToConvert.to);
    }
    if (relationshipToConvert.isInjectedFieldInToRequired) {
      convertedRelationship.relationshipValidateRules = REQUIRED;
    }
    if (relationshipToConvert.commentInTo) {
      convertedRelationship.documentation = relationshipToConvert.commentInTo;
    }
    const splitField: any = extractField(relationshipToConvert.injectedFieldInTo);
    convertedRelationship.relationshipName = customCamelCase(splitField.relationshipName || relationshipToConvert.from);
    if (splitField.otherEntityField) {
      convertedRelationship.otherEntityField = lowerFirst(splitField.otherEntityField);
    }
    relationshipToConvert.injectedFieldInTo = relationshipToConvert.injectedFieldInTo ?? lowerFirst(relationshipToConvert.from);

    setOptionsForRelationshipDestinationSide(relationshipToConvert, convertedRelationship);
    const convertedEntityRelationships = convertedRelationships.get(entityName)!;
    convertedEntityRelationships.push(convertedRelationship);
  });
}

function setOptionsForRelationshipSourceSide(
  relationshipToConvert: JDLRelationship,
  convertedRelationship: Partial<JSONRelationship>,
): void {
  convertedRelationship.options = convertedRelationship.options || {};
  relationshipToConvert.forEachGlobalOption((optionName, optionValue) => {
    if (optionName === BUILT_IN_ENTITY) {
      convertedRelationship.relationshipWithBuiltInEntity = optionValue;
    } else {
      convertedRelationship.options![optionName] = optionValue;
    }
  });
  relationshipToConvert.forEachDestinationOption((optionName, optionValue) => {
    convertedRelationship.options![optionName] = optionValue;
  });
  if (Object.keys(convertedRelationship.options).length === 0) {
    delete convertedRelationship.options;
  }
}

function setOptionsForRelationshipDestinationSide(relationshipToConvert: JDLRelationship, convertedRelationship: JSONRelationship): void {
  convertedRelationship.options = convertedRelationship.options || {};
  relationshipToConvert.forEachGlobalOption((optionName, optionValue) => {
    convertedRelationship.options![optionName] = optionValue;
  });
  relationshipToConvert.forEachSourceOption((optionName, optionValue) => {
    convertedRelationship.options![optionName] = optionValue;
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
function extractField(field?: string | null) {
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
