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

import { mergeKeyLocations, setKeyLocations, setLocation } from './location.ts';
import { setKind } from './nodes.ts';
import type { JDLRelationshipType } from './relationship-types.ts';
import type {
  JDLLocation,
  ParsedJDLApplicationConfig,
  ParsedJDLApplicationDeclaration,
  ParsedJDLApplications,
  ParsedJDLDeployment,
  ParsedJDLEntity,
  ParsedJDLEnum,
  ParsedJDLOption,
  ParsedJDLOptionConfig,
  ParsedJDLRelationship,
  ParsedJDLUseOption,
} from './types/parsed.ts';

type Statement<T extends string, P> = { type: T; location?: JDLLocation } & P;

/** A statement of an application block, as written: nothing is merged. */
export type JDLApplicationStatement =
  | Statement<'config', { config: ParsedJDLApplicationConfig }>
  | Statement<'namespaceConfig', { namespace: string; config: NonNullable<ParsedJDLApplicationDeclaration['namespaceConfigs']>[string] }>
  | Statement<'entities', { entities: NonNullable<ParsedJDLApplicationDeclaration['entitiesOptions']> }>
  | Statement<'option', { option: ParsedJDLOption }>
  | Statement<'use', { use: ParsedJDLUseOption }>;

/** A statement of a jdl, as written and in the order it is written: nothing is merged. */
export type JDLStatement =
  | Statement<'constant', { name: string; value: string }>
  | Statement<'application', { application: ParsedJDLApplicationDeclaration }>
  | Statement<'deployment', { deployment: ParsedJDLDeployment }>
  | Statement<'entity', { entity: ParsedJDLEntity }>
  | Statement<'enum', { enum: ParsedJDLEnum }>
  | Statement<'relationships', { cardinality: JDLRelationshipType; relationships: ParsedJDLRelationship[] }>
  | Statement<'option', { option: ParsedJDLOption }>
  | Statement<'use', { use: ParsedJDLUseOption }>;

/** The option name a statement keyword stands for. */
export type BinaryOptionName = (keyword: string, location: JDLLocation | undefined) => string;

const deduplicate = <T>(array: T[]): T[] => [...new Set(array)];

type OptionsAST = Record<string, ParsedJDLOptionConfig | Record<string, ParsedJDLOptionConfig>>;

/** Merges the entities of an option statement into the option it adds to. */
function mergeOption(target: ParsedJDLOptionConfig, option: ParsedJDLOption) {
  target.list = deduplicate([...(Array.isArray(target.list) ? target.list : []), ...option.list]);
  target.excluded = deduplicate([...(Array.isArray(target.excluded) ? target.excluded : []), ...(option.excluded ?? [])]);
  mergeKeyLocations(target, option.keyLocations);
  // The statements are merged: the first one locates them.
  if (!target.location) setLocation(target, option.location);
}

/**
 * Merges the option statements by option, then by value for a binary one: the unary statements first, then the binary
 * ones, whose keyword is resolved to the option name.
 */
function mergeOptions(options: ParsedJDLOption[], binaryOptionName: BinaryOptionName): OptionsAST {
  const merged: OptionsAST = {};
  for (const option of options.filter(option => option.optionValue === undefined)) {
    merged[option.optionName] ??= setKind({} as ParsedJDLOptionConfig, 'Option');
    mergeOption(merged[option.optionName] as ParsedJDLOptionConfig, option);
  }
  for (const option of options.filter(option => option.optionValue !== undefined)) {
    option.optionName = binaryOptionName(option.optionName, option.location);
    const byValue = (merged[option.optionName] ??= {}) as Record<string, ParsedJDLOptionConfig>;
    byValue[option.optionValue!] ??= setKind({ list: [], excluded: [] }, 'Option');
    mergeOption(byValue[option.optionValue!], option);
  }
  return merged;
}

/**
 * The application of an application block: the last config and entities statements win, the option statements are merged.
 */
export function groupApplicationStatements(
  statements: JDLApplicationStatement[],
  binaryOptionName: BinaryOptionName,
): ParsedJDLApplicationDeclaration {
  const application: ParsedJDLApplicationDeclaration = {
    config: setKind({}, 'ApplicationConfig') as ParsedJDLApplicationConfig,
    namespaceConfigs: {},
    entitiesOptions: setKind({ entityList: [], excluded: [] }, 'ApplicationEntities'),
    options: {},
    useOptions: [],
  };
  const options: ParsedJDLOption[] = [];
  for (const statement of statements) {
    if (statement.type === 'config') {
      application.config = statement.config;
    } else if (statement.type === 'namespaceConfig') {
      // Only the last namespace config is kept, whatever its namespace.
      application.namespaceConfigs = { [statement.namespace]: statement.config };
    } else if (statement.type === 'entities') {
      application.entitiesOptions = statement.entities;
    } else if (statement.type === 'option') {
      options.push(statement.option);
    } else {
      application.useOptions!.push(statement.use);
    }
  }
  application.options = mergeOptions(options, binaryOptionName);
  return setKind(application, 'Application');
}

/**
 * The AST of a jdl from its statements: each kind of statement in its own list, the constants in a record, the option
 * statements merged.
 */
export function groupStatements(statements: JDLStatement[], binaryOptionName: BinaryOptionName): ParsedJDLApplications {
  const ast: ParsedJDLApplications = setKind(
    {
      applications: [],
      deployments: [],
      constants: setKind({}, 'Constants'),
      entities: [],
      relationships: [],
      enums: [],
      options: {},
      useOptions: [],
    },
    'JDL',
  );
  const constantLocations: Record<string, JDLLocation | undefined> = {};
  const options: ParsedJDLOption[] = [];
  for (const statement of statements) {
    switch (statement.type) {
      case 'constant':
        ast.constants[statement.name] = statement.value;
        constantLocations[statement.name] = statement.location;
        break;
      case 'application':
        ast.applications.push(statement.application);
        break;
      case 'deployment':
        ast.deployments.push(statement.deployment);
        break;
      case 'entity':
        ast.entities.push(statement.entity);
        break;
      case 'enum':
        ast.enums.push(statement.enum);
        break;
      case 'relationships':
        ast.relationships.push(...statement.relationships);
        break;
      case 'option':
        options.push(statement.option);
        break;
      case 'use':
        ast.useOptions.push(statement.use);
        break;
    }
  }
  if (Object.keys(constantLocations).length > 0) {
    setKeyLocations(ast.constants, constantLocations);
  }
  ast.options = mergeOptions(options, binaryOptionName) as ParsedJDLApplications['options'];
  return ast;
}

/** The statements a node of the AST was grouped from, in the order they are written; not enumerable, like the location. */
export function setStatements<T extends object>(node: T, statements: readonly unknown[]): T {
  Object.defineProperty(node, 'statements', { value: statements, enumerable: false, writable: true, configurable: true });
  return node;
}

export const getStatements = <T = JDLStatement>(node: object): T[] | undefined => (node as { statements?: T[] }).statements;
