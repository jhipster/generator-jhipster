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

import type {
  ExportApplicationPropertiesFromCommand,
  ExportEntityConfigFromCommand,
  ExportEntityPropertiesFromCommand,
  ExportFieldTypesFromCommand,
  ExportFieldValidationPropertiesFromCommand,
  ExportFieldValidationsFromCommand,
  ExportGeneratorOptionsFromCommand,
  ExportRelationshipConfigFromCommand,
  ExportRelationshipDerivedPropertiesFromCommand,
  ExportStoragePropertiesFromCommand,
} from './types.ts';

const _testCommand = {
  configs: {
    stringRootType: {
      cli: { type: String },
      scope: 'storage',
    },
    booleanCliType: {
      cli: { type: Boolean },
      scope: 'storage',
    },
    none: {
      scope: 'none',
    },
    choiceType: {
      cli: {
        type: String,
      },
      choices: ['foo', 'no'],
      scope: 'storage',
    },
    unknownType: {
      cli: {
        type: () => {},
      },
      scope: 'storage',
    },
  },
} as const;

type TestCommand = typeof _testCommand;

type StorageProperties = ExportStoragePropertiesFromCommand<TestCommand>;

({
  stringRootType: 'foo',
}) satisfies StorageProperties;

({
  // @ts-expect-error invalid value
  stringRootType: false,
}) satisfies StorageProperties;

({
  booleanCliType: false,
}) satisfies StorageProperties;

({
  // @ts-expect-error invalid value
  booleanCliType: 'false',
}) satisfies StorageProperties;

({
  choiceType: 'foo',
}) satisfies StorageProperties;

({
  // @ts-expect-error invalid value
  choiceType: 'bar',
}) satisfies StorageProperties;

({
  unknownType: true,
}) satisfies StorageProperties;

({
  unknownType: 'string',
}) satisfies StorageProperties;

type ApplicationProperties = ExportApplicationPropertiesFromCommand<TestCommand>;

const _applicationChoiceType = {
  choiceType: 'foo',
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const _applicationChoiceTypeNo = {
  choiceTypeNo: false,
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const _applicationChoiceTypeFoo = {
  choiceTypeFoo: true,
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

const _applicationChoiceTypeAny = {
  choiceTypeAny: true,
  // @ts-expect-error missing fields
} satisfies ApplicationProperties;

({
  ..._applicationChoiceType,
  ..._applicationChoiceTypeNo,
  ..._applicationChoiceTypeFoo,
  ..._applicationChoiceTypeAny,
}) satisfies ApplicationProperties;

type ApplicationOptions = ExportGeneratorOptionsFromCommand<TestCommand>;

({
  stringRootType: 'foo',
  booleanCliType: false,
  choiceType: 'foo',
  none: 'foo',
}) satisfies ApplicationOptions;

({
  // @ts-expect-error unknown field
  foo: 'bar',
}) satisfies ApplicationOptions;

const _dummyCommand = {
  options: {},
  configs: {},
} as const;

// Check if the type allows any property.
// @ts-expect-error unknown field
(() => {})(({} as ExportApplicationPropertiesFromCommand<typeof _dummyCommand>).nonExisting);
// @ts-expect-error unknown field
(() => {})(({} as ExportStoragePropertiesFromCommand<typeof _dummyCommand>).nonExisting);

({}) satisfies ExportApplicationPropertiesFromCommand<typeof _dummyCommand>;

const _simpleConfig = {
  options: {},
  configs: {
    stringOption: {
      cli: { type: String },
      scope: 'storage',
    },
  },
} as const;

({}) satisfies ExportApplicationPropertiesFromCommand<typeof _simpleConfig>;

const _choiceConfig = {
  options: {},
  configs: {
    stringOption: {
      choices: ['foo', 'bar'],
      scope: 'storage',
    },
  },
} as const;

({
  stringOption: 'foo',
  stringOptionFoo: true,
  stringOptionBar: false,
  stringOptionAny: false,
}) satisfies ExportApplicationPropertiesFromCommand<typeof _choiceConfig>;

const _entityCommand = {
  entity: {
    unaryOption: { jdl: { type: 'unary' } },
    binaryOption: { jdl: { type: 'binary' } },
    pagination: { choices: ['pagination', 'infinite-scroll', 'no'], jdl: { type: 'binary' } },
  },
} as const;

type EntityConfig = ExportEntityConfigFromCommand<typeof _entityCommand>;

({ unaryOption: true, binaryOption: 'foo', pagination: 'infinite-scroll' }) satisfies EntityConfig;
({}) satisfies EntityConfig;

({
  // @ts-expect-error invalid value
  unaryOption: 'true',
}) satisfies EntityConfig;

({
  // @ts-expect-error invalid value
  pagination: 'paginate',
}) satisfies EntityConfig;

// @ts-expect-error unknown field
(() => {})(({} as EntityConfig).nonExisting);

({
  pagination: 'pagination',
  paginationPagination: true,
  paginationInfiniteScroll: false,
  paginationNo: false,
  paginationAny: true,
}) satisfies ExportEntityPropertiesFromCommand<typeof _entityCommand>;

({
  paginationPagination: true,
  // @ts-expect-error missing fields
}) satisfies ExportEntityPropertiesFromCommand<typeof _entityCommand>;

({}) satisfies ExportEntityPropertiesFromCommand<typeof _dummyCommand>;

const _fieldCommand = {
  field: {
    types: { String: { validations: ['required', 'minlength'] }, Instant: {} },
    validations: {
      minlength: { jdl: { value: 'integer' } },
      pattern: { jdl: { value: 'regex' } },
      required: {},
    },
  },
} as const;

({ a: 'String', b: 'Instant' }) satisfies Record<string, ExportFieldTypesFromCommand<typeof _fieldCommand>>;
({
  // @ts-expect-error unknown type
  a: 'Number',
}) satisfies Record<string, ExportFieldTypesFromCommand<typeof _fieldCommand>>;
({ a: 'minlength', b: 'required' }) satisfies Record<string, ExportFieldValidationsFromCommand<typeof _fieldCommand>>;

({ fieldValidateRulesMinlength: 5, fieldValidateRulesPattern: '^a$' }) satisfies ExportFieldValidationPropertiesFromCommand<
  typeof _fieldCommand
>;
({}) satisfies ExportFieldValidationPropertiesFromCommand<typeof _fieldCommand>;
({
  // @ts-expect-error a number is expected
  fieldValidateRulesMinlength: '5',
}) satisfies ExportFieldValidationPropertiesFromCommand<typeof _fieldCommand>;
({
  // @ts-expect-error a validation without a value has no property
  fieldValidateRulesRequired: true,
}) satisfies ExportFieldValidationPropertiesFromCommand<typeof _fieldCommand>;
({}) satisfies ExportFieldValidationPropertiesFromCommand<typeof _dummyCommand>;

const _relationshipCommand = {
  relationship: {
    jpaDerivedIdentifier: { jdl: { type: 'unary' } },
    side: { choices: ['left', 'right'], jdl: { type: 'binary' } },
  },
} as const;

({ jpaDerivedIdentifier: true, side: 'left' }) satisfies ExportRelationshipConfigFromCommand<typeof _relationshipCommand>;
({
  // @ts-expect-error invalid value
  side: 'middle',
}) satisfies ExportRelationshipConfigFromCommand<typeof _relationshipCommand>;
({ sideLeft: true, sideRight: false, sideAny: true }) satisfies ExportRelationshipDerivedPropertiesFromCommand<typeof _relationshipCommand>;
({}) satisfies ExportRelationshipConfigFromCommand<typeof _dummyCommand>;
