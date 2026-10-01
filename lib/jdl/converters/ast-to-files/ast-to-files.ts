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

import { capitalize, kebabCase, lowerFirst, upperFirst } from 'lodash-es';

import { customCamelCase } from '../../../utils/string-utils.ts';
import { asJdlRelationshipType } from '../../core/basic-types/relationship-types.ts';
import { binaryOptions, relationshipOptions, unaryOptions, validations } from '../../core/built-in-options/index.ts';
import { type JDLApplicationStatement, type JDLStatement, getStatements } from '../../core/parsing/statements.ts';
import type {
  ParsedJDLAnnotation,
  ParsedJDLApplication,
  ParsedJDLApplications,
  ParsedJDLDeployment,
  ParsedJDLEntity,
  ParsedJDLEntityField,
  ParsedJDLEnum,
  ParsedJDLOptionConfig,
  ParsedJDLRelationship,
  ParsedJDLRelationshipSide,
} from '../../core/parsing/types/parsed.ts';
import type { JDLRuntime } from '../../core/parsing/types/runtime.ts';
import { formatComment } from '../../core/utils/format-utils.ts';

import { jhipsterCustomizations } from './jhipster-customizations.ts';

const GENERATOR_JHIPSTER = 'generator-jhipster';
const {
  Validations: { PATTERN, REQUIRED, UNIQUE },
} = validations;
const { BUILT_IN_ENTITY } = relationshipOptions;
const { FILTER, NO_FLUENT_METHOD } = unaryOptions;
const {
  Options: { ANGULAR_SUFFIX, MICROSERVICE, SEARCH },
} = binaryOptions;

/** The json files a jdl converts to. */
export type JDLFiles = {
  /**
   * The json files, by path relative to the folder holding the applications: the `.yo-rc.json` and `.jhipster/*.json`
   * files of each application in a folder named after its base name, and the `.yo-rc.json` file of each deployment in a
   * folder named after its type. The entities of a jdl without application are in `.jhipster`, without folder:
   * `checkEntitiesImportedInto` checks they can be imported into an application.
   */
  files: Record<string, Record<string, any>>;
  /**
   * The folder, among the files, of the application the generator runs in: the base name of the application of a jdl
   * declaring one, `''` for a jdl declaring several, whose folder holds them, or only entities, whose files are the ones
   * of the current application. Null for a jdl declaring only deployments: the caller finds where the applications are.
   */
  relativeRoot: string | null;
};

type JSONEntity = Record<string, any> & { name: string; relationships: Record<string, any>[] };

/** An option statement, a `use` statement being one statement for each of its values. */
type OptionStatement = ParsedJDLOptionConfig & { optionName: string; optionValue?: string };

/** The options of an annotation list: an annotation repeated with different values gives a list. */
function annotationsToOptions(annotations: ParsedJDLAnnotation[] = []): Record<string, any> {
  const result: Record<string, any> = {};
  for (const annotation of annotations) {
    const name = lowerFirst(annotation.optionName);
    const value = annotation.optionValue ?? true;
    if (!(name in result)) {
      result[name] = value;
    } else if (!(Array.isArray(result[name]) ? result[name] : [result[name]]).includes(value)) {
      result[name] = [result[name], value].flat();
    }
  }
  return result;
}

function convertField(field: ParsedJDLEntityField, enums: Map<string, ParsedJDLEnum>, constants: Record<string, string>) {
  const json: Record<string, any> = { fieldName: customCamelCase(lowerFirst(field.name)), fieldType: field.type };
  const documentation = formatComment(field.documentation);
  if (documentation) json.documentation = documentation;

  const jdlEnum = enums.get(field.type);
  if (jdlEnum) {
    json.fieldValues = jdlEnum.values.map(({ key, value }) => (value ? `${key} (${value})` : key)).join(',');
    const enumDocumentation = formatComment(jdlEnum.documentation);
    if (enumDocumentation) json.fieldTypeDocumentation = enumDocumentation;
    const javadocs = Object.fromEntries(jdlEnum.values.filter(({ comment }) => comment).map(({ key, comment }) => [key, comment]));
    if (Object.keys(javadocs).length > 0) json.fieldValuesJavadocs = javadocs;
  }

  if (field.validations.length > 0) {
    for (const { key, value, constant } of field.validations) {
      let resolved = constant ? constants[value as string] : value;
      // A pattern has each quote that is not escaped escaped.
      if (key === PATTERN) resolved = (resolved as string).replaceAll(/(?<!\\)'/g, String.raw`\'`);
      if (key !== REQUIRED && key !== UNIQUE) json[`fieldValidateRules${capitalize(key)}`] = resolved;
    }
    json.fieldValidateRules = [...new Set(field.validations.map(({ key }) => key))];
  }

  const options = annotationsToOptions(field.annotations);
  if (Object.keys(options).length > 0) json.options = options;
  return json;
}

function convertEntity(entity: ParsedJDLEntity, enums: Map<string, ParsedJDLEnum>, constants: Record<string, string>): JSONEntity {
  const json: JSONEntity = {
    name: upperFirst(entity.name),
    fields: (entity.body ?? []).map(field => convertField(field, enums, constants)),
    relationships: [],
  };
  const documentation = formatComment(entity.documentation);
  if (documentation) json.documentation = documentation;
  if (entity.tableName) json.entityTableName = entity.tableName;
  if (entity.annotations?.length) {
    json.annotations = Object.fromEntries(
      entity.annotations.map(annotation => [
        lowerFirst(annotation.optionName),
        annotation.type === 'UNARY' ? true : annotation.optionValue,
      ]),
    );
  }
  return json;
}

/** Splits `<relationshipName>(<otherEntityField>)`. */
function splitInjectedField(field?: string | null): { relationshipName?: string; otherEntityField?: string } {
  const [relationshipName, otherEntityField] = field ? field.replace('(', '/').replace(')', '').split('/') : [];
  return { relationshipName, otherEntityField };
}

/** The json relationship of a side of a relationship, pointing at the other side. */
function relationshipSide(
  side: 'left' | 'right',
  own: ParsedJDLRelationshipSide,
  other: ParsedJDLRelationshipSide,
  type: string,
  options: Record<string, any>,
): Record<string, any> {
  const ownField = splitInjectedField(own.injectedField);
  const otherField = splitInjectedField(other.injectedField);
  const json: Record<string, any> = {
    relationshipSide: side,
    relationshipType: side === 'left' ? kebabCase(type) : kebabCase(type).split('-').reverse().join('-'),
    otherEntityName: customCamelCase(other.name),
  };
  if (otherField.relationshipName) json.otherEntityRelationshipName = lowerFirst(otherField.relationshipName);
  if (own.required) json.relationshipValidateRules = REQUIRED;
  const documentation = formatComment(own.documentation);
  if (documentation) json.documentation = documentation;
  json.relationshipName = customCamelCase(ownField.relationshipName || other.name);
  if (ownField.otherEntityField) json.otherEntityField = lowerFirst(ownField.otherEntityField);
  // The built-in entity option is not an option of the relationship.
  const { [BUILT_IN_ENTITY]: builtInEntity, ...relationshipOptions } = options;
  if (Object.keys(relationshipOptions).length > 0) json.options = relationshipOptions;
  if (builtInEntity !== undefined) json.relationshipWithBuiltInEntity = builtInEntity;
  return json;
}

/**
 * Adds a relationship to the entities of its sides: always to the source, to the destination when that side is
 * navigable (it injects a field) or annotated.
 */
function addRelationship(entities: Map<string, JSONEntity>, relationship: ParsedJDLRelationship) {
  const { from, to } = relationship;
  const type = asJdlRelationshipType(relationship.cardinality);
  const global = annotationsToOptions(relationship.options.global);
  const source = annotationsToOptions(relationship.options.source);
  const destination = annotationsToOptions(relationship.options.destination);
  entities.get(from.name)?.relationships.push(relationshipSide('left', from, to, type, { ...global, ...destination }));
  if (to.injectedField || Object.keys(source).length > 0) {
    const { [BUILT_IN_ENTITY]: _builtInEntity, ...rightOptions } = { ...global, ...source };
    entities.get(to.name)?.relationships.push(relationshipSide('right', to, from, type, rightOptions));
  }
}

/** The key and the value an option statement sets in the json entities. */
function jsonOption({ optionName, optionValue }: OptionStatement): [string, string | boolean] {
  switch (optionName) {
    case MICROSERVICE:
      return ['microserviceName', optionValue!];
    case NO_FLUENT_METHOD:
      return ['fluentMethods', false];
    case ANGULAR_SUFFIX:
      return ['angularJSSuffix', optionValue!];
    case SEARCH:
      return ['searchEngine', optionValue!];
    case FILTER:
      return ['jpaMetamodelFiltering', true];
    default:
      return [optionName, optionValue ?? true];
  }
}

/** The option statements among statements, in the order they are written; a `use` statement gives one for each value. */
function optionStatements(statements: (JDLStatement | JDLApplicationStatement)[]): OptionStatement[] {
  return statements.flatMap<OptionStatement>(statement => {
    if (statement.type === 'option') return [statement.option];
    if (statement.type !== 'use') return [];
    const { optionValues, list, excluded } = statement.use;
    return optionValues
      .map(optionValue => ({ list, excluded, optionName: binaryOptions.getOptionNameForValue(optionValue)!, optionValue }))
      .filter(({ optionName }) => optionName);
  });
}

/**
 * Applies an option statement to the entities it names: `*`, or no name, stands for every entity passed but the
 * excluded ones. An entity using a dto or filtering gets a service class, unless it has a service; an entity excluded
 * from a search statement is not searched.
 */
function applyOption(entities: Map<string, JSONEntity>, statement: OptionStatement) {
  const { optionName, list, excluded = [] } = statement;
  const names = list.length === 0 || list.includes('*') ? [...entities.keys()].filter(name => !excluded.includes(name)) : list;
  const [key, value] = jsonOption(statement);
  for (const entity of names.map(name => entities.get(name)).filter(entity => entity !== undefined)) {
    entity[key] = value;
  }
  if (optionName === SEARCH) {
    for (const name of excluded) {
      if (entities.has(name)) entities.get(name)!.searchEngine = 'no';
    }
  }
}

/** A namespace config value has no declared type: a number is written as an integer, a list keeps each item once. */
function convertNamespaceValue(value: unknown): unknown {
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number.parseInt(value, 10);
  return Array.isArray(value) ? [...new Set(value)] : value;
}

/** The `.yo-rc.json` of an application, with the options it declares. */
function applicationFile(application: JDLApplicationDeclaration, entities: string[], runtime: JDLRuntime): Record<string, any> {
  const { applicationDefinition } = runtime;
  const config: Record<string, any> = {};
  for (const [name, value] of Object.entries<unknown>(application.config)) {
    // The semantic rules checked the options.
    if (value === undefined || !applicationDefinition.doesOptionExist(name)) continue;
    const type = applicationDefinition.getTypeForOption(name);
    config[name] = type === 'list' || type === 'quotedList' ? [...new Set(value as string[])] : value;
  }
  if (config.creationTimestamp !== undefined) config.creationTimestamp = Number.parseInt(config.creationTimestamp, 10);
  if (config.blueprints) config.blueprints = config.blueprints.map((name: string) => ({ name }));
  if (config.microfrontends) config.microfrontends = config.microfrontends.map((baseName: string) => ({ baseName }));
  config.entities = entities;

  const file: Record<string, any> = {};
  for (const [namespace, namespaceConfig] of Object.entries(application.namespaceConfigs)) {
    file[namespace] = Object.fromEntries(Object.entries(namespaceConfig).map(([name, value]) => [name, convertNamespaceValue(value)]));
  }
  file[GENERATOR_JHIPSTER] = config;
  return file;
}

/** The `.yo-rc.json` of a deployment, with the options it declares. */
function deploymentFile(deployment: ParsedJDLDeployment): Record<string, any> {
  const config: Record<string, any> = {};
  for (const [key, value] of Object.entries(deployment)) {
    if (value !== undefined) config[key] = Array.isArray(value) ? [...new Set(value)] : value;
  }
  return { [GENERATOR_JHIPSTER]: config };
}

/**
 * The entities of an application, with the options of the application applied in the order written; each a copy, as
 * the options set its attributes only.
 */
function applicationEntities(entities: Map<string, JSONEntity>, names: string[], statements: OptionStatement[]): JSONEntity[] {
  const own = new Map(names.filter(entity => entities.has(entity)).map(entity => [entity, { ...entities.get(entity)! }]));
  for (const statement of statements) applyOption(own, statement);
  return [...own.values()];
}

/** An application, as a customization receives and returns it: its config and the configs of its namespaces. */
export type JDLApplicationDeclaration = {
  config: Record<string, any>;
  namespaceConfigs: Record<string, Record<string, any>>;
};

/** The customizations a tool makes to the conversion of a jdl, outside what the jdl declares. */
export type JDLConversionCustomizations = {
  /** Customizes an application before it is converted. */
  application?: (application: JDLApplicationDeclaration) => JDLApplicationDeclaration;
  /** Customizes a relationship before it is converted. */
  relationship?: (relationship: ParsedJDLRelationship) => ParsedJDLRelationship;
};

/**
 * Converts the AST of a jdl, checked by the semantic rules, to the json files of its applications, entities and
 * deployments, walking its statements in the order they are written: a later option statement overrides an earlier
 * one. The files hold what the jdl declares, and the customizations passed. It reads and writes no file: merging them
 * with the files on the disk is left to the caller.
 * @param ast - the AST of the jdl.
 * @param customizations - what a tool adds to the conversion.
 */
export function convertAstToFiles(
  ast: ParsedJDLApplications,
  runtime: JDLRuntime,
  customizations: JDLConversionCustomizations = {},
): JDLFiles {
  const statements = getStatements<JDLStatement>(ast) ?? [];
  const enums = new Map(ast.enums.map(jdlEnum => [jdlEnum.name, jdlEnum]));
  const entities = new Map<string, JSONEntity>();
  const applications: ParsedJDLApplication[] = [];
  const deploymentFiles: JDLFiles['files'] = {};

  // The entity and relationship statements build the entities; the option statements of the jdl apply once every
  // entity is known, as `*` names each of them wherever it is written.
  for (const statement of statements) {
    if (statement.type === 'entity') {
      entities.set(statement.entity.name, convertEntity(statement.entity, enums, ast.constants));
    } else if (statement.type === 'application') {
      applications.push(statement.application);
    } else if (statement.type === 'deployment') {
      deploymentFiles[`${statement.deployment.deploymentType}/.yo-rc.json`] = deploymentFile(statement.deployment);
    }
  }
  for (const statement of statements) {
    if (statement.type === 'relationships') {
      for (const relationship of statement.relationships) {
        addRelationship(entities, customizations.relationship?.(relationship) ?? relationship);
      }
    }
  }
  for (const statement of optionStatements(statements)) applyOption(entities, statement);

  const files: JDLFiles['files'] = {};
  if (applications.length === 0 && entities.size > 0) {
    if (Object.keys(deploymentFiles).length > 0) {
      throw new Error('A jdl declaring entities without application cannot declare deployments.');
    }
    for (const entity of entities.values()) {
      files[`.jhipster/${entity.name}.json`] = entity;
    }
  }
  const folders: string[] = [];
  for (const application of applications) {
    const declared = { config: application.config, namespaceConfigs: application.namespaceConfigs ?? {} };
    const customized = customizations.application?.(declared) ?? declared;
    const folder: string | undefined = customized.config.baseName;
    if (!folder) {
      throw new Error('An application without baseName has no folder to be converted to.');
    }
    folders.push(folder);
    files[`${folder}/.yo-rc.json`] = applicationFile(customized, application.entities ?? [], runtime);
    const applicationStatements = optionStatements(getStatements<JDLApplicationStatement>(application) ?? []);
    for (const entity of applicationEntities(entities, application.entities ?? [], applicationStatements)) {
      files[`${folder}/.jhipster/${entity.name}.json`] = entity;
    }
  }
  Object.assign(files, deploymentFiles);

  let relativeRoot: string | null = '';
  if (folders.length === 1) {
    relativeRoot = folders[0];
  } else if (applications.length === 0 && entities.size === 0 && Object.keys(deploymentFiles).length > 0) {
    relativeRoot = null;
  }
  return { files, relativeRoot };
}

/**
 * Converts the AST of a jdl, checked by the semantic rules, to the json files of its applications, entities and
 * deployments (see `convertAstToFiles`), with the customizations of JHipster (see `jhipsterCustomizations`).
 * @param ast - the AST of the jdl.
 */
export function astToFiles(ast: ParsedJDLApplications, runtime: JDLRuntime): JDLFiles {
  return convertAstToFiles(ast, runtime, jhipsterCustomizations);
}
