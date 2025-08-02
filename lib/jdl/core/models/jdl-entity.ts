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

import { upperFirst } from 'lodash-es';
import { merge } from '../utils/object-utils.js';
import type JDLField from './jdl-field.js';

export default class JDLEntity {
  name: string;
  tableName: string | undefined;
  fields: Record<string, JDLField>;
  comment: string | undefined;
  annotations: Record<string, boolean | string | number | undefined>;

  constructor(args: Partial<JDLEntity>) {
    const merged: Partial<JDLEntity> = merge(defaults(), args);
    if (!merged.name) {
      throw new Error('The entity name is mandatory to create an entity.');
    }
    this.name = merged.name;
    this.tableName = merged.tableName;
    this.fields = merged.fields ?? {};
    this.comment = merged.comment;
    this.annotations = merged.annotations ?? {};
  }

  /**
   * Adds the fields to the entity.
   * @param fields - the fields to add
   */
  addFields(fields: JDLField[] = []) {
    fields.forEach(field => this.addField(field));
  }

  addField(field: JDLField) {
    if (!field) {
      throw new Error("Can't add nil field to the JDL entity.");
    }
    this.fields[field.name] = field;
  }

  forEachField(functionToApply: (field: JDLField, index: number, array: JDLField[]) => void) {
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
    Object.entries(this.annotations).forEach(([key, value]) => {
      key = upperFirst(key);
      if (value === true) {
        stringifiedEntity += `@${key}\n`;
      } else if (typeof value === 'string') {
        stringifiedEntity += `@${key}("${value}")\n`;
      } else {
        stringifiedEntity += `@${key}(${value})\n`;
      }
    });
    stringifiedEntity += `entity ${this.name}`;
    if (this.tableName) {
      stringifiedEntity += ` (${this.tableName})`;
    }
    if (Object.keys(this.fields).length !== 0) {
      stringifiedEntity += ` {\n${formatFieldObjects(this.fields)}\n}`;
    }
    return stringifiedEntity;
  }
}

function defaults(): Pick<JDLEntity, 'fields' | 'annotations'> {
  return {
    fields: {},
    annotations: {},
  };
}

function formatFieldObjects(jdlFieldObjects: Record<string, JDLField>): string {
  let string = '';
  Object.keys(jdlFieldObjects).forEach(jdlField => {
    string += `${formatFieldObject(jdlFieldObjects[jdlField])}`;
  });
  string = `${string.slice(0, string.length - 1)}`;
  return string;
}

function formatFieldObject(jdlFieldObject: JDLField): string {
  let string = '';
  const lines = jdlFieldObject.toString().split('\n');
  for (const line of lines) {
    string += `  ${line}\n`;
  }
  string = `${string.slice(0, string.length - 1)}\n`;
  return string;
}
