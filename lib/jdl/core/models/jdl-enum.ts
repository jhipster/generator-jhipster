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

import { merge } from '../utils/object-utils.js';
import type { ParsedJDLEnumValue } from '../types/parsed.js';
import JDLEnumValue from './jdl-enum-value.js';

export default class JDLEnum {
  comment?: string;
  name: string;
  values: Map<string, JDLEnumValue>;

  constructor(args: Partial<Omit<JDLEnum, 'values'> & { values: ParsedJDLEnumValue[] }>) {
    const merged: Partial<Omit<JDLEnum, 'values'> & { values: ParsedJDLEnumValue[] }> = merge(defaults(), args);
    if (!merged.name) {
      throw new Error("The enum's name must be passed to create an enum.");
    }
    this.comment = merged.comment;
    this.name = merged.name;
    this.values = new Map(
      merged.values!.map((entry: ParsedJDLEnumValue) => [entry.key, new JDLEnumValue(entry.key, entry.value, entry.comment)]),
    );
  }

  getValuesAsString(): string {
    return stringifyValues(this.values).join(',');
  }

  getValueJavadocs(): Record<string, string> {
    const documentations: Record<string, string> = {};
    this.values.forEach(jdlEnumValue => {
      if (jdlEnumValue.comment) {
        documentations[jdlEnumValue.name] = jdlEnumValue.comment;
      }
    });
    return documentations;
  }

  toString(): string {
    let comment = '';
    if (this.comment) {
      comment += `/**\n * ${this.comment}\n */\n`;
    }
    const values = stringifyValues(this.values);
    return `${comment}enum ${this.name} {\n  ${values.join(',\n  ')}\n}`;
  }
}

function defaults(): { values: any[] } {
  return {
    values: [],
  };
}

function stringifyValues(jdlEnumValues: Map<string, JDLEnumValue>): string[] {
  const values: string[] = [];
  jdlEnumValues.forEach(jdlEnumValue => {
    values.push(jdlEnumValue.toString());
  });
  return values;
}
