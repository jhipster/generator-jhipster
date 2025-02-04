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
import { capitalize } from 'lodash-es';

import { validations } from '../../core/built-in-options/index.js';
import { formatComment } from '../../core/utils/format-utils.js';
import { camelCase } from '../../core/utils/string-utils.js';
import type JDLObject from '../../core/models/jdl-object.js';
import type { JSONField } from '../../core/types/json-config.js';
import type { JDLEntity } from '../../core/models/index.js';
import type JDLField from '../../core/models/jdl-field.js';
import type { FieldType } from '../../../application/field-types.js';

const {
  Validations: { UNIQUE, REQUIRED },
} = validations;

export default { convert };

/**
 * Converts entity fields to JSON content.
 * @param jdlObject - the JDL object containing entities, fields and enums.
 * @return a map having for keys an entity's name and for values its JSON fields.
 */
export function convert(jdlObject: JDLObject): Map<string, JSONField[]> {
  if (!jdlObject) {
    throw new Error('A JDL Object must be passed to convert JDL fields to JSON.');
  }
  const convertedFields = new Map<string, JSONField[]>();
  jdlObject.forEachEntity(jdlEntity => {
    const convertedEntityFields = getConvertedFieldsForEntity(jdlEntity, jdlObject);
    convertedFields.set(jdlEntity.name, convertedEntityFields);
  });
  return convertedFields;
}

function getConvertedFieldsForEntity(jdlEntity: JDLEntity, jdlObject: JDLObject): JSONField[] {
  const convertedEntityFields: JSONField[] = [];
  jdlEntity.forEachField((jdlField: JDLField) => {
    let fieldData: JSONField = {
      fieldName: camelCase(jdlField.name),
      fieldType: jdlField.type as FieldType,
    };
    const comment = formatComment(jdlField.comment);
    if (comment) {
      fieldData.documentation = comment;
    }
    if (jdlObject.hasEnum(jdlField.type)) {
      fieldData.fieldValues = jdlObject.getEnum(fieldData.fieldType)?.getValuesAsString();
      const fieldTypeComment = jdlObject.getEnum(fieldData.fieldType)?.comment;
      if (fieldTypeComment) {
        fieldData.fieldTypeDocumentation = fieldTypeComment;
      }
      const fieldValuesJavadocs = jdlObject.getEnum(fieldData.fieldType)?.getValueJavadocs();
      if (fieldValuesJavadocs && Object.keys(fieldValuesJavadocs).length > 0) {
        fieldData.fieldValuesJavadocs = fieldValuesJavadocs;
      }
    }
    if (jdlField.validationQuantity() !== 0) {
      const fieldValidations = getFieldValidations(jdlField);
      fieldData = {
        ...fieldData,
        ...fieldValidations,
      };
    }
    if (jdlField.optionQuantity() !== 0) {
      const fieldOptions = getOptionsForField(jdlField);
      fieldData = {
        ...fieldData,
        ...fieldOptions,
      };
    }
    convertedEntityFields.push(fieldData);
  });
  return convertedEntityFields;
}

function getFieldValidations(jdlField: JDLField) {
  const fieldValidations: any = {
    fieldValidateRules: [],
  };
  jdlField.forEachValidation(validation => {
    fieldValidations.fieldValidateRules.push(validation.name);
    if (validation.name !== REQUIRED && validation.name !== UNIQUE) {
      fieldValidations[`fieldValidateRules${capitalize(validation.name)}`] = validation.value;
    }
  });
  return fieldValidations;
}

function getOptionsForField(jdlField: JDLField) {
  const fieldOptions = {
    options: {},
  };
  fieldOptions.options = {};
  jdlField.forEachOption(([key, value]) => {
    fieldOptions.options[key] = value;
  });
  return fieldOptions;
}
