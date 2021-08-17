/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const merge = require('../utils/object-utils').merge;
const { getTableNameFromEntityName } = require('../jhipster/entity-table-name-creator');

module.exports = class JDLEntity {
  constructor(args) {
    const merged = merge(defaults(), args);
    if (!merged.name) {
      throw new Error('The entity name is mandatory to create an entity.');
    }
    this.name = merged.name;
    this.tableName = merged.tableName || merged.name;
    this.fields = merged.fields;
    this.comment = merged.comment;
  }

  /**
   * Adds the fields to the entity.
   * @param {Iterable} fields - the fields to add
   */
  addFields(fields = []) {
    fields.forEach(field => this.addField(field));
  }

  addField(field) {
    if (!field) {
      throw new Error("Can't add nil field to the JDL entity.");
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
    if (this.tableName && getTableNameFromEntityName(this.name) !== getTableNameFromEntityName(this.tableName)) {
      stringifiedEntity += ` (${this.tableName})`;
    }
    if (Object.keys(this.fields).length !== 0) {
      stringifiedEntity += ` {\n${formatFieldObjects(this.fields)}\n}`;
    }
    return stringifiedEntity;
  }
};

function defaults() {
  return {
    fields: {},
    options: [],
  };
}

function formatFieldObjects(jdlFieldObjects) {
  let string = '';
  Object.keys(jdlFieldObjects).forEach(jdlField => {
    string += `${formatFieldObject(jdlFieldObjects[jdlField])}`;
  });
  string = `${string.slice(0, string.length - 1)}`;
  return string;
}

function formatFieldObject(jdlFieldObject) {
  let string = '';
  const lines = jdlFieldObject.toString().split('\n');
  for (let j = 0; j < lines.length; j++) {
    string += `  ${lines[j]}\n`;
  }
  string = `${string.slice(0, string.length - 1)}\n`;
  return string;
}
