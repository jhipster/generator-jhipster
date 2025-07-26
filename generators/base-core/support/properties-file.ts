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
import dotProperties from 'dot-properties';
import sortKeys from 'sort-keys';
import type { EditFileCallback } from '../api.js';

export type PropertiesFileKeyUpdate = {
  key: string;
  value: string | ((oldValue?: string) => string);
  valueSep?: string;
  /** Only supported if sortFile is set to false, and at key creation */
  comment?: string;
};

export type PropertiesFileLines = (string | [string, string])[];
export type PropertiesFileValueCallback = (newValue: PropertiesFileKeyUpdate['value'], oldValue?: string, sep?: string) => string;

const getNewValue: PropertiesFileValueCallback = (newValue, oldValue?, sep?): string => {
  if (typeof newValue === 'function') {
    return newValue(oldValue);
  }
  if (sep && oldValue) {
    const factories = (oldValue.split(sep) ?? []).map(val => val.trim());
    return factories.includes(newValue) ? oldValue : `${oldValue}${sep}${newValue}`;
  }
  return newValue;
};

/**
 * Edit a property file, adding or updating a key.
 */
export const editPropertiesFileCallback = (
  properties:
    | PropertiesFileKeyUpdate[]
    | ((lines: PropertiesFileLines, newValueCallback: PropertiesFileValueCallback) => PropertiesFileLines),
  options: { sortFile?: boolean } = {},
): EditFileCallback => {
  return (content: string) => {
    const { sortFile = false } = options;
    if (sortFile) {
      if (typeof properties === 'function') {
        throw new Error('Cannot use a function to edit properties file with sortFile enabled');
      }
      const obj = dotProperties.parse(content ?? '');
      for (const { key, value, valueSep } of properties) {
        if (typeof value === 'function' || valueSep) {
          obj[key] = getNewValue(value, obj[key] as string, valueSep);
        } else {
          obj[key] = value;
        }
      }
      return dotProperties.stringify(sortKeys(obj), { lineWidth: 120 });
    }
    let lines = dotProperties.parseLines(content ?? '') as PropertiesFileLines;
    if (typeof properties === 'function') {
      lines = properties(lines, getNewValue);
    } else {
      for (const { key, value, valueSep, comment } of properties) {
        const existingLine = lines.find(line => Array.isArray(line) && line[0] === key) as string[] | undefined;
        if (existingLine) {
          if (typeof value === 'function' || valueSep) {
            existingLine[1] = getNewValue(value, existingLine[1] as string, valueSep);
          } else {
            existingLine[1] = value;
          }
        } else {
          if (comment) {
            lines.push(comment);
          }
          lines.push([key, typeof value === 'function' ? value() : value]);
        }
      }
    }
    return dotProperties.stringify(lines, { lineWidth: 120 });
  };
};
