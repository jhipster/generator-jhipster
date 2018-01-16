/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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

const merge = require('../utils/object_utils').merge;
const isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty;
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;
const ErrorCases = require('../exceptions/error_cases').ErrorCases;
const JDLField = require('./jdl_field');
const ReservedKeyWord = require('../core/jhipster/reserved_keywords');

const isReservedClassName = ReservedKeyWord.isReservedClassName;

class JDLEntity {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (isNilOrEmpty(merged.name)) {
      throw new BuildException(
        exceptions.NullPointer,
        'The name is mandatory to create an entity.');
    }
    if (isReservedClassName(merged.name)) {
      throw new BuildException(
        exceptions.IllegalName,
        `The name cannot be a reserved keyword, got: ${merged.name}.`
      );
    }
    this.name = merged.name;
    this.tableName = merged.tableName || merged.name;
    this.fields = merged.fields;
    this.comment = merged.comment;
  }

  addField(field) {
    const errors = JDLField.checkValidity(field);
    if (errors.length !== 0) {
      let fieldName = '';
      if (field) {
        fieldName = field.name;
      }
      throw new BuildException(
        exceptions.InvalidObject,
        `The passed field '${'' || fieldName}' must be valid for entity '${this.name}'.\nErrors: ${errors.join(', ')}`);
    }
    this.fields[field.name] = field;
  }

  static checkValidity(entity) {
    const errors = [];
    if (!entity) {
      errors.push(ErrorCases.entities.NoEntity);
      return errors;
    }
    if (isNilOrEmpty(entity.name)) {
      errors.push(ErrorCases.entities.NoName);
    } else if (isReservedClassName(entity.name)) {
      errors.push(ErrorCases.entities.ReservedWordAsName);
    }
    if (isNilOrEmpty(entity.tableName)) {
      errors.push(ErrorCases.entities.NoTableName);
    }
    if (!('fields' in entity)) {
      errors.push(ErrorCases.entities.NoFields);
    }
    if (entity.fields) {
      for (let i = 0; i < entity.fields.length; i++) {
        const fieldsErrors = JDLField.checkValidity(entity.fields[i]);
        if (fieldsErrors.length !== 0) {
          errors.push(`For field #${i + 1}: ${fieldsErrors}`);
        }
      }
    }
    return errors;
  }

  static isValid(entity) {
    const errors = this.checkValidity(entity);
    return errors.length === 0;
  }

  toString() {
    let string = '';
    if (this.comment) {
      string += `/**\n${this.comment.split('\n').map(line => ` * ${line}\n`).join('')} */\n`;
    }
    string += `entity ${this.name} (${this.tableName})`;
    if (Object.keys(this.fields).length !== 0) {
      string += ` {\n${formatFieldObjects(this.fields)}\n}`;
    }
    return string;
  }
}

module.exports = JDLEntity;

function defaults() {
  return {
    fields: {}
  };
}

function formatFieldObjects(jdlFieldObjects) {
  let string = '';
  Object.keys(jdlFieldObjects).forEach((jdlField) => {
    string += `${formatFieldObject(jdlFieldObjects[jdlField])}`;
  });
  string = `${string.slice(0, string.length - 2)}`;
  return string;
}

function formatFieldObject(jdlFieldObject) {
  let string = '';
  const lines = jdlFieldObject.toString().split('\n');
  for (let j = 0; j < lines.length; j++) {
    string += `  ${lines[j]}\n`;
  }
  string = `${string.slice(0, string.length - 1)},\n`;
  return string;
}
