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

import fieldTypes from '../../../jhipster/field-types.ts';
import { relationshipOptions } from '../../core/built-in-options/index.ts';
import type JDLField from '../../core/models/jdl-field.ts';
import type JDLObject from '../../core/models/jdl-object.ts';
import type JDLRelationship from '../../core/models/jdl-relationship.ts';

import EntityValidator from './entity-validator.ts';
import EnumValidator from './enum-validator.ts';
import FieldValidator from './field-validator.ts';
import RelationshipValidator from './relationship-validator.ts';
import ValidationValidator from './validation-validator.ts';

const { BUILT_IN_ENTITY } = relationshipOptions;

/**
 * Constructor taking the jdl object to check against application settings.
 */
export default function createValidator(jdlObject: JDLObject) {
  if (!jdlObject) {
    throw new Error('A JDL object must be passed to check for business errors.');
  }

  return {
    checkForErrors: () => {
      checkForEntityErrors();
      checkForRelationshipErrors();
      checkForEnumErrors();
    },
  };

  function checkForEntityErrors(): void {
    if (jdlObject.getEntityQuantity() === 0) {
      return;
    }
    const validator = new EntityValidator();
    jdlObject.forEachEntity(jdlEntity => {
      validator.validate(jdlEntity);
      checkForFieldErrors(jdlEntity.fields);
    });
  }

  function checkForFieldErrors(jdlFields: Record<string, JDLField>) {
    const validator = new FieldValidator();

    Object.keys(jdlFields).forEach(fieldName => {
      const jdlField = jdlFields[fieldName];
      validator.validate(jdlField);
      const isAnEnum = jdlObject.hasEnum(jdlField.type);
      checkForValidationErrors(jdlField, isAnEnum);
    });
  }

  function checkForValidationErrors(jdlField: JDLField, isAnEnum: boolean): void {
    const validator = new ValidationValidator();
    jdlField.forEachValidation(jdlValidation => {
      validator.validate(jdlValidation);
      if (!fieldTypes.hasValidation(jdlField.type, jdlValidation.name, isAnEnum)) {
        throw new Error(`The validation '${jdlValidation.name}' isn't supported for the type '${jdlField.type}'.`);
      }
    });
  }

  function checkForRelationshipErrors(): void {
    if (jdlObject.getRelationshipQuantity() === 0) {
      return;
    }
    const validator = new RelationshipValidator();
    jdlObject.forEachRelationship(jdlRelationship => {
      validator.validate(jdlRelationship);
      checkForAbsentEntities({
        jdlRelationship,
        doesEntityExist: entityName => !!jdlObject.getEntity(entityName),
      });
    });
  }

  function checkForEnumErrors(): void {
    if (jdlObject.getEnumQuantity() === 0) {
      return;
    }
    const validator = new EnumValidator();
    jdlObject.forEachEnum(jdlEnum => {
      validator.validate(jdlEnum);
    });
  }
}

function checkForAbsentEntities({
  jdlRelationship,
  doesEntityExist,
}: {
  jdlRelationship: JDLRelationship;
  doesEntityExist: (entityName: string) => boolean;
}) {
  const absentEntities: any[] = [];
  if (!doesEntityExist(jdlRelationship.from)) {
    absentEntities.push(jdlRelationship.from);
  }
  if (!doesEntityExist(jdlRelationship.to) && !jdlRelationship.options.global[BUILT_IN_ENTITY]) {
    absentEntities.push(jdlRelationship.to);
  }
  if (absentEntities.length !== 0) {
    throw new Error(
      `In the relationship between ${jdlRelationship.from} and ${jdlRelationship.to}, ` +
        `${absentEntities.join(' and ')} ${absentEntities.length === 1 ? 'is' : 'are'} not declared. If '${
          jdlRelationship.to
        }' is a built-in entity declare like '${jdlRelationship.from} to ${jdlRelationship.to} with builtInEntity'.`,
    );
  }
}
