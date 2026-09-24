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

export type JDLValidatorOptionType = 'BOOLEAN' | 'INTEGER' | 'list' | 'NAME' | 'qualifiedName' | 'STRING' | 'quotedList';

export type JDLValidatorOption = {
  type: JDLValidatorOptionType;
  pattern?: RegExp;
  msg?: string;
};

export type JDLApplicationOptionValue = string | number | boolean | undefined | never[] | Record<string, string>;
export type JDLApplicationOptionTypeValue = 'string' | 'integer' | 'boolean' | 'list' | 'quotedList';
export type JDLApplicationOptionType = {
  type: JDLApplicationOptionTypeValue;
  /** Why the option is deprecated, warned about when the jdl sets it. */
  deprecated?: string;
};

export type JDLApplicationConfig = {
  validatorConfig: Record<string, JDLValidatorOption>;
  optionsValues: Record<string, JDLApplicationOptionValue>;
  optionsTypes: Record<string, JDLApplicationOptionType>;
  quotedOptionNames: string[];
};

/** The jdl spec of an option statement: `<option> <entities>` for a unary one, `<option> <entities> with <value>` for a binary one. */
export type JDLOptionStatementSpec = {
  type: 'unary' | 'binary';
  /** The keyword of the statement, the option name by default. */
  keyword?: string;
  /** Deprecated keywords still accepted for the option, warned about. */
  deprecatedKeywords?: readonly string[];
  /** A relationship option: the destination is a built-in entity, which the jdl does not declare. */
  builtInEntity?: boolean;
};

/** An option of the entity or relationship statements, shaped like a command config. */
export type JDLOptionConfig = {
  description?: string;
  /** The values a binary option accepts; a binary option without choices accepts any name. */
  choices?: readonly string[];
  /** The value of the option for the entities the jdl does not set it on. */
  default?: string;
  jdl: JDLOptionStatementSpec;
};

/**
 * The option statements of a jdl block, entity or relationship, shaped like a generator command so a generator may
 * declare them the same way one day.
 */
export type JDLOptionsDefinition = {
  configs: Readonly<Record<string, JDLOptionConfig>>;
};

/**
 * A field validation written with a value, `<name>(<value>)`: `number` takes an integer, a decimal or a constant, `integer`
 * the same but a decimal, `regex` a regular expression. The validations without a value, `required` and `unique`, are keywords of the grammar: a name
 * after the type of a field could be the next field otherwise.
 */
export type JDLValidationConfig = {
  description?: string;
  jdl: { value: 'integer' | 'number' | 'regex' };
};

/** The field validations written with a value, shaped like the option statements. */
export type JDLValidationsDefinition = {
  configs: Readonly<Record<string, JDLValidationConfig>>;
};

/** The field types and the validations each one takes. */
export type JDLFieldTypesDefinition = {
  /** The field types and their validations; a deprecated type is still accepted, warned about with the reason. */
  types: Readonly<Record<string, { validations: readonly string[]; deprecated?: string }>>;
  /** The validations of a field whose type is an enum of the jdl. */
  enum: { validations: readonly string[] };
};

/** Every definition a runtime is built from. */
export type JDLDefinitions = {
  /** The application config options. */
  application: JDLApplicationConfig;
  /** The deployment options. */
  deployment: JDLApplicationConfig;
  /** The option statements of entities. */
  entity: JDLOptionsDefinition;
  /** The option statements of relationships. */
  relationship: JDLOptionsDefinition;
  /** The field validations written with a value. */
  validation: JDLValidationsDefinition;
  /** The field types and their validations. */
  fieldTypes: JDLFieldTypesDefinition;
};

export type JHipsterOptionDefinition = {
  name: string;
  type: JDLApplicationOptionTypeValue;
  tokenType: JDLValidatorOptionType;
  tokenValuePattern?: RegExp;
  knownChoices?: string[];
  /** Whether the value should be quoted when written back to JDL (e.g. jhipsterVersion). */
  quoted?: boolean;
  /** The option is deprecated: setting it in the jdl warns with this reason. */
  deprecated?: string;
};
