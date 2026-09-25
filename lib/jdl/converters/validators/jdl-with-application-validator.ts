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

import type JDLApplication from '../../core/models/jdl-application.ts';
import type JDLBinaryOption from '../../core/models/jdl-binary-option.ts';
import type JDLField from '../../core/models/jdl-field.ts';
import type JDLObject from '../../core/models/jdl-object.ts';

import BinaryOptionValidator from './binary-option-validator.ts';
import EntityValidator from './entity-validator.ts';
import EnumValidator from './enum-validator.ts';
import FieldValidator from './field-validator.ts';
import RelationshipValidator from './relationship-validator.ts';
import UnaryOptionValidator from './unary-option-validator.ts';

/**
 * Constructor taking the jdl object to check against application settings.
 */
export default function createValidator(jdlObject: JDLObject) {
  if (!jdlObject) {
    throw new Error('A JDL object must be passed to check for business errors.');
  }

  return {
    checkForErrors: (): void => {
      jdlObject.forEachApplication(jdlApplication => {
        checkForRelationshipErrors();
        checkForEntityErrors(jdlApplication);
        checkForEnumErrors();
        checkForOptionErrors();
      });
    },
  };

  function checkForEntityErrors(jdlApplication: JDLApplication): void {
    if (jdlObject.getEntityQuantity() === 0) {
      return;
    }
    const validator = new EntityValidator();
    jdlObject.forEachEntity(jdlEntity => {
      if (!jdlApplication.hasEntityName(jdlEntity.name)) {
        return;
      }
      validator.validate(jdlEntity);
      checkForFieldErrors(jdlEntity.name, jdlEntity.fields, jdlApplication);
    });
  }

  function checkForFieldErrors(_entityName: string, jdlFields: Record<string, JDLField>, _jdlApplication: JDLApplication): void {
    const validator = new FieldValidator();
    Object.keys(jdlFields).forEach(fieldName => {
      const jdlField = jdlFields[fieldName];
      validator.validate(jdlField);
    });
  }

  function checkForRelationshipErrors(): void {
    if (jdlObject.getRelationshipQuantity() === 0) {
      return;
    }
    const validator = new RelationshipValidator();
    jdlObject.forEachRelationship(jdlRelationship => {
      validator.validate(jdlRelationship);
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

  function checkForOptionErrors(): void {
    if (jdlObject.getOptionQuantity() === 0) {
      return;
    }
    const unaryOptionValidator = new UnaryOptionValidator();
    const binaryOptionValidator = new BinaryOptionValidator();
    jdlObject.getOptions().forEach(option => {
      if (option.getType() === 'UNARY') {
        unaryOptionValidator.validate(option);
      } else {
        binaryOptionValidator.validate(option as JDLBinaryOption);
      }
    });
  }
}
