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
import { lowerFirst } from 'lodash-es';

import { databaseTypes, entityOptions, validations } from '../../../lib/jhipster/index.ts';
import { mutateData } from '../../../lib/utils/index.ts';
import type CoreGenerator from '../../base-core/generator.ts';
import type { Entity as BaseApplicationEntity, Relationship as BaseApplicationRelationship, RelationshipWithEntity } from '../types.ts';

import { stringifyApplicationData } from './debug.ts';

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
  // Look for fields at the other other side of the relationship
  const { otherRelationship, relationshipOneToMany, relationshipName, otherEntity } = relationship;
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
        if (otherEntity.primaryKey.composite) {
          return null;
        }
        const { otherEntityField } = relationship;
        const fields = otherEntity.primaryKey.derived ? otherEntity.primaryKey.derivedFields! : otherEntity.primaryKey.fields;
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

  return relationship;
}
