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
import type { Field as JavaField } from '../types.ts';

type JavaValueField = Pick<JavaField, 'fieldIsEnum' | 'javaFieldType'>;
type JavaCode = (value: string | number | boolean) => string;

/** The values of a Java type written as Java code, from the value a json-serializable sample gives. */
const javaValues: Partial<Record<string, JavaCode>> = {
  String: value => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
  Integer: value => `${value}`,
  Boolean: value => `${value}`,
  Long: value => `${value}L`,
  Float: value => `${value}F`,
  Double: value => `${value}D`,
  BigDecimal: value => `new BigDecimal("${value}")`,
  UUID: value => `UUID.fromString("${value}")`,
  LocalDate: value => `LocalDate.parse("${value}")`,
  Instant: value => `Instant.parse("${value}")`,
  ZonedDateTime: value => `ZonedDateTime.ofInstant(Instant.parse("${value}"), ZoneOffset.UTC)`,
  LocalTime: value => `LocalTime.parse("${value}")`,
  Duration: value => `Duration.parse("${value}")`,
};

/**
 * A value of a field written as Java code, from the value a json-serializable sample gives: undefined for a type it does
 * not write, like a blob.
 *
 * @example
 * javaValue(field, '2026-01-01'); // LocalDate.parse("2026-01-01") for a LocalDate field
 */
export const javaValue = ({ fieldIsEnum, javaFieldType }: JavaValueField, value: string | number | boolean): string | undefined =>
  fieldIsEnum ? `${javaFieldType}.${value}` : javaValues[javaFieldType]?.(value);
