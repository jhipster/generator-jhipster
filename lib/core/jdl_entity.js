/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const FieldValidator = require('../exceptions/field_validator');
const merge = require('../utils/object_utils').merge;
const { createFromEntityName } = require('../core/jhipster/entity_table_name_creator');

class JDLEntity {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (!merged.name) {
      throw new Error('The entity name is mandatory to create an entity.');
    }
    this.name = merged.name;
    this.tableName = merged.tableName || merged.name;
    this.fields = merged.fields;
    this.comment = merged.comment;
    this.options = merged.options;
    this.fieldValidator = new FieldValidator();
  }

  addField(field) {
    try {
      this.fieldValidator.validate(field);
    } catch (error) {
      throw new Error(`Can't add invalid field. ${error}`);
    }
    this.fields[field.name] = field;
  }

  forEachField(functionToApply) {
    if (!functionToApply) {
      throw new Error('A function must be passed to iterate over fields');
    }
    Object.values(this.fields).forEach(functionToApply);
  }

  toString() {
    let stringifiedEntity = '';
    if (this.comment) {
      stringifiedEntity += `/**\n${this.comment
        .split('\n')
        .map(line => ` * ${line}\n`)
        .join('')} */\n`;
    }
    stringifiedEntity += `entity ${this.name}`;
    if (this.tableName && createFromEntityName(this.name) !== createFromEntityName(this.tableName)) {
      stringifiedEntity += ` (${this.tableName})`;
    }
    if (Object.keys(this.fields).length !== 0) {
      stringifiedEntity += ` {\n${formatFieldObjects(this.fields)}\n}`;
    }
    return stringifiedEntity;
  }
}

module.exports = JDLEntity;

function defaults() {
  return {
    fields: {},
    options: []
  };
}

function formatFieldObjects(jdlFieldObjects) {
  let string = '';
  Object.keys(jdlFieldObjects).forEach(jdlField => {
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
