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

export type EnumValue = { name: string; value?: string };

/** Legacy raw comma-separated entries, or structured entries for arbitrary custom values. */
export type EnumValues = string | EnumValue[];

type ParseEnumValuesOptions = {
  /** Built-in client constants also use language tags such as pt-br. */
  clientConstants?: boolean;
};

export const ENUM_VALUE_NAME_PATTERN = /^[A-Z]\w*$/;
const clientConstantNamePattern = /^[A-Za-z][\w-]*$/;

/**
 * Read entity JSON enum values without treating legacy quotes or backslashes as escapes.
 * An absent custom value is different from an explicitly empty custom value.
 */
export function parseEnumValues(fieldValues: unknown, { clientConstants = false }: ParseEnumValuesOptions = {}): EnumValue[] {
  const invalidEntry = (entry: unknown): never => {
    throw new Error(`Invalid enum entry in entity JSON: ${JSON.stringify(entry)}.`);
  };
  let values: unknown[];
  if (typeof fieldValues === 'string') {
    values = fieldValues.split(',').map(entry => {
      const trimmed = entry.trim();
      const match = /^([\w-]+)(?:[ \t]*\(([^,)\r\n\u2028\u2029]*)\))?$/.exec(trimmed);
      if (match?.[0] !== trimmed) {
        return invalidEntry(entry);
      }
      return match[2] === undefined ? { name: match[1] } : { name: match[1], value: match[2] };
    });
  } else if (Array.isArray(fieldValues)) {
    values = fieldValues;
  } else {
    return invalidEntry(fieldValues);
  }

  if (values.length === 0) {
    return invalidEntry(fieldValues);
  }
  const names = new Set<string>();
  return values.map(entry => {
    if (
      !entry ||
      typeof entry !== 'object' ||
      Array.isArray(entry) ||
      !('name' in entry) ||
      typeof entry.name !== 'string' ||
      entry.name.match(clientConstants ? clientConstantNamePattern : ENUM_VALUE_NAME_PATTERN)?.[0] !== entry.name ||
      ('value' in entry && typeof entry.value !== 'string') ||
      Object.keys(entry).some(key => key !== 'name' && key !== 'value')
    ) {
      return invalidEntry(entry);
    }
    if (names.has(entry.name)) {
      throw new Error(`Duplicate enum value name ${JSON.stringify(entry.name)}.`);
    }
    names.add(entry.name);
    return 'value' in entry && typeof entry.value === 'string' ? { name: entry.name, value: entry.value } : { name: entry.name };
  });
}

/** Keep existing entity JSON strings where they can represent the values without ambiguity. */
export function serializeEnumValues(values: EnumValue[]): EnumValues {
  if (values.length === 0) {
    return '';
  }
  const entries = parseEnumValues(values);
  if (entries.some(({ value }) => value !== undefined && (value === '' || /[",()\r\n\u2028\u2029]/.test(value)))) {
    return entries;
  }
  return entries.map(({ name, value }) => `${name}${value === undefined ? '' : ` (${value})`}`).join(',');
}
