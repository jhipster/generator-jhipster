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

/**
 * A value of a field written as Java code, from the value a json-serializable sample gives: undefined for a type it does
 * not write, like a blob.
 *
 * @example
 * javaValue(field, '2026-01-01'); // LocalDate.parse("2026-01-01") for a LocalDate field
 */
export const javaValue = (field: JavaField, value: string | number | boolean): string | undefined => {
  if (field.fieldIsEnum) {
    return `${field.fieldType}.${value}`;
  }
  if (field.fieldTypeString || field.blobContentTypeText) {
    return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  if (field.fieldTypeInteger || field.fieldTypeBoolean) {
    return `${value}`;
  }
  if (field.fieldTypeLong) {
    return `${value}L`;
  }
  if (field.fieldTypeFloat) {
    return `${value}F`;
  }
  if (field.fieldTypeDouble) {
    return `${value}D`;
  }
  if (field.fieldTypeBigDecimal) {
    return `new BigDecimal("${value}")`;
  }
  if (field.fieldTypeUUID) {
    return `UUID.fromString("${value}")`;
  }
  if (field.fieldTypeLocalDate) {
    return `LocalDate.parse("${value}")`;
  }
  if (field.fieldTypeInstant) {
    return `Instant.parse("${value}")`;
  }
  if (field.fieldTypeZonedDateTime) {
    return `ZonedDateTime.ofInstant(Instant.parse("${value}"), ZoneOffset.UTC)`;
  }
  if (field.fieldTypeLocalTime) {
    return `LocalTime.parse("${value}")`;
  }
  if (field.fieldTypeDuration) {
    return `Duration.parse("${value}")`;
  }
  return undefined;
};

/**
 * A value smaller than a value of a field, written as Java code from the code of that value, like the constant that
 * holds it: undefined for a type without an order, like a text.
 *
 * @example
 * javaSmallerValue(field, 'DEFAULT_DAY'); // DEFAULT_DAY.minusDays(1) for a LocalDate field
 */
export const javaSmallerValue = (field: JavaField, value: string): string | undefined => {
  if (field.fieldTypeInteger) {
    return `${value} - 1`;
  }
  if (field.fieldTypeLong) {
    return `${value} - 1L`;
  }
  if (field.fieldTypeFloat) {
    return `${value} - 1F`;
  }
  if (field.fieldTypeDouble) {
    return `${value} - 1D`;
  }
  if (field.fieldTypeBigDecimal) {
    return `${value}.subtract(BigDecimal.ONE)`;
  }
  if (field.fieldTypeLocalDate) {
    return `${value}.minusDays(1)`;
  }
  if (field.fieldTypeInstant || field.fieldTypeZonedDateTime) {
    return `${value}.minusSeconds(1)`;
  }
  if (field.fieldTypeDuration) {
    return `${value}.minusMinutes(1)`;
  }
  return undefined;
};
