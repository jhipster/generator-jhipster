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
import { lowerFirst, startCase, upperFirst } from 'lodash-es';
import pluralize from 'pluralize';

import { databaseTypes, entityOptions, validations } from '../../../lib/jhipster/index.js';
import { mutateData } from '../../../lib/utils/index.js';
import type CoreGenerator from '../../base-core/generator.js';
import type { Entity as BaseApplicationEntity, Relationship as BaseApplicationRelationship, RelationshipWithEntity } from '../types.js';
import { prepareProperty } from './prepare-property.js';
import { stringifyApplicationData } from './debug.js';

const { NEO4J, NO: DATABASE_NO } = databaseTypes;
const { MapperTypes } = entityOptions;
const {
  Validations: { REQUIRED },
} = validations;

const { MAPSTRUCT } = MapperTypes;

export default function prepareRelationship(
  this: CoreGenerator,
  entityWithConfig: BaseApplicationEntity,
  relationship: RelationshipWithEntity<BaseApplicationRelationship, BaseApplicationEntity>,
  ignoreMissingRequiredRelationship = false,
) {
  const entityName = entityWithConfig.name;
  const { relationshipSide, relationshipType, relationshipName } = relationship;

  if (!relationship.otherEntity) {
    throw new Error(
      `Error at entity ${entityName}: could not find the entity of the relationship ${stringifyApplicationData(relationship)}`,
    );
  }
  const otherEntity = relationship.otherEntity;
  if (!relationship.otherEntityField && otherEntity.primaryKey) {
    relationship.otherEntityField = otherEntity.primaryKey.name;
  }

  // Prepare basic relationship data
  Object.assign(relationship, {
    relationshipLeftSide: relationshipSide === 'left',
    relationshipRightSide: relationshipSide === 'right',
    collection: relationshipType === 'one-to-many' || relationshipType === 'many-to-many',
    relationshipOneToOne: relationshipType === 'one-to-one',
    relationshipOneToMany: relationshipType === 'one-to-many',
    relationshipManyToOne: relationshipType === 'many-to-one',
    relationshipManyToMany: relationshipType === 'many-to-many',
    otherEntityUser: relationship.otherEntityName.toLowerCase() === 'user',
  });

  const { collection, relationshipLeftSide, relationshipManyToOne, relationshipOneToMany } = relationship;

  // Prepare property name
  mutateData(relationship, {
    __override__: false,
    relationshipFieldName: lowerFirst(relationshipName),
    relationshipFieldNamePlural: ({ relationshipFieldName }) => pluralize(relationshipFieldName),
    relationshipNamePlural: pluralize(relationshipName),
    relationshipNameCapitalized: upperFirst(relationshipName),
    relationshipNameHumanized: startCase(relationshipName),

    propertyName: ({ relationshipFieldName, relationshipFieldNamePlural }) =>
      collection ? relationshipFieldNamePlural! : relationshipFieldName!,

    // let ownerSide true when type is 'many-to-one' for convenience.
    // means that this side should control the reference.
    ownerSide: relationship.otherEntity.embedded || relationshipManyToOne || (relationshipLeftSide && !relationshipOneToMany),
    persistableRelationship: ({ ownerSide }) => ownerSide!,
  });

  prepareProperty(relationship);

  // Look for fields at the other other side of the relationship
  const otherRelationship = relationship.otherRelationship;
  if (
    !otherRelationship &&
    !ignoreMissingRequiredRelationship &&
    !relationship.otherEntity.embedded &&
    !relationship.relationshipIgnoreBackReference &&
    entityWithConfig.databaseType !== NEO4J &&
    entityWithConfig.databaseType !== DATABASE_NO &&
    (relationshipOneToMany || !relationship.ownerSide)
  ) {
    if (otherEntity.builtInUser) {
      throw new Error(`Error at entity ${entityName}: relationships with built-in User cannot have back reference`);
    }
    throw new Error(
      `Error at entity ${entityName}: could not find the other side of the relationship ${stringifyApplicationData(relationship)}`,
    );
  } else {
    this.debug(`Entity ${entityName}: Could not find the other side of the relationship ${stringifyApplicationData(relationship)}`);
  }

  if (relationship.otherEntityField) {
    relationship.relatedField = otherEntity.fields.find(field => field.fieldName === relationship.otherEntityField)!;

    if (relationship.relatedField) {
      relationship.relatedField.relatedByOtherEntity = true;
    }
  }
  if (!relationship.relatedField && !otherEntity.embedded) {
    Object.defineProperty(relationship, 'relatedField', {
      get() {
        if (!otherEntity.primaryKey) {
          throw new Error(
            `Error at entity ${entityName}: could not find the related field for the relationship ${relationship.relationshipName}`,
          );
        }
        const { otherEntityField } = relationship;
        const fields = otherEntity.primaryKey.derived ? otherEntity.primaryKey.derivedFields : otherEntity.primaryKey.fields;
        if (otherEntityField) {
          const relatedField = fields.find(field => field.fieldName === otherEntityField);
          if (!relatedField) {
            throw new Error(
              `Error at entity ${entityName}: could not find the related field ${otherEntityField} for the relationship ${relationshipName}`,
            );
          }
          return relatedField;
        }
        return fields[0];
      },
    });
  }

  if (relationship.otherEntityRelationshipName !== undefined || relationship.otherRelationship) {
    mutateData(relationship, {
      otherEntityRelationshipName: ({ otherRelationship, otherEntityRelationshipName }) =>
        lowerFirst(otherRelationship?.relationshipName ?? otherEntityRelationshipName),
    });
  }

  if (entityWithConfig.dto === MAPSTRUCT) {
    if (otherEntity.dto !== MAPSTRUCT && !otherEntity.builtInUser) {
      this.log.warn(
        `Entity ${entityName}: this entity has the DTO option, and it has a relationship with entity "${otherEntity.name}" that doesn't have the DTO option. This will result in an error.`,
      );
    }
  }

  if (relationship.relationshipValidateRules?.includes(REQUIRED)) {
    if (entityName.toLowerCase() === relationship.otherEntityName.toLowerCase()) {
      this.log.warn(`Error at entity ${entityName}: required relationships to the same entity are not supported.`);
    } else {
      relationship.relationshipValidate = relationship.relationshipRequired = true;
    }
  }

  (relationship as any).reference = relationshipToReference(entityWithConfig, relationship);

  return relationship;
}

function relationshipToReference(entity, relationship, pathPrefix = []) {
  const collection = relationship.collection;
  const name = collection ? relationship.relationshipNamePlural : relationship.relationshipName;
  const reference = {
    id: relationship.id,
    entity,
    relationship,
    owned: relationship.ownerSide,
    collection,
    doc: relationship.documentation,
    get propertyJavadoc() {
      return relationship.relationshipJavadoc;
    },
    get propertyApiDescription() {
      return relationship.relationshipApiDescription;
    },
    name,
    nameCapitalized: collection ? relationship.relationshipNameCapitalizedPlural : relationship.relationshipNameCapitalized,
    get type() {
      return relationship.otherEntity.primaryKey ? relationship.otherEntity.primaryKey.type : undefined;
    },
    path: [...pathPrefix, name],
  };
  return reference;
}
