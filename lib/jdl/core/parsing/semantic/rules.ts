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
import type { ParsedJDLOptionConfig, ParsedJDLUseOption } from '../types/parsed.ts';
import type { JDLRuntime } from '../types/runtime.ts';

import type { JDLSemanticRule } from './types.ts';

/** The options of a block, a binary option holding one entity list per value. */
const optionEntityLists = (
  options: Record<string, ParsedJDLOptionConfig | Record<string, ParsedJDLOptionConfig>> = {},
): { optionName: string; config: ParsedJDLOptionConfig }[] =>
  Object.entries(options).flatMap(([optionName, config]) =>
    Array.isArray((config as ParsedJDLOptionConfig).list) ?
      [{ optionName, config: config as ParsedJDLOptionConfig }]
    : Object.values(config as Record<string, ParsedJDLOptionConfig>).map(valueConfig => ({ optionName, config: valueConfig })),
  );

/** The option a `use` statement value belongs to. */
const useOptionName = (runtime: JDLRuntime, value: string): string =>
  Object.entries(runtime.entityDefinition.configs).find(([_name, config]) => config.choices?.includes(value))?.[0] ?? value;

/** The options of a block and its `use` statements, by option name. */
const allOptionEntityLists = (
  runtime: JDLRuntime,
  options: Record<string, ParsedJDLOptionConfig | Record<string, ParsedJDLOptionConfig>> | undefined,
  useOptions: ParsedJDLUseOption[] | undefined,
) => [
  ...optionEntityLists(options),
  ...(useOptions ?? []).flatMap(useOption =>
    useOption.optionValues.map(value => ({ optionName: useOptionName(runtime, value), config: useOption })),
  ),
];

/** The entity names an option lists by name, `*` lists every entity. */
const listedEntityNames = (config: ParsedJDLOptionConfig) => config.list.filter(name => name !== '*');

export const undeclaredRelationshipEntity: JDLSemanticRule = {
  id: 'undeclared-relationship-entity',
  check: (ast, runtime) => {
    const entityNames = new Set(ast.entities.map(entity => entity.name));
    return ast.relationships.flatMap(relationship => {
      const { from, to } = relationship;
      const toBuiltIn = relationship.options.global.some(
        option => runtime.relationshipDefinition.configs[option.optionName]?.jdl.builtInEntity,
      );
      const absent = [from.name, ...(toBuiltIn ? [] : [to.name])].filter(name => !entityNames.has(name));
      if (absent.length === 0) return [];
      return [
        {
          message:
            `In the relationship between ${from.name} and ${to.name}, ${absent.join(' and ')} ${absent.length === 1 ? 'is' : 'are'} not declared. ` +
            `If '${to.name}' is a built-in entity declare like '${from.name} to ${to.name} with builtInEntity'.`,
          location: relationship.location,
        },
      ];
    });
  },
};

export const undeclaredApplicationEntity: JDLSemanticRule = {
  id: 'undeclared-application-entity',
  check: ast => {
    const entityNames = new Set(ast.entities.map(entity => entity.name));
    return ast.applications.flatMap(application => {
      const { entitiesOptions } = application;
      if (!entitiesOptions || entitiesOptions.entityList.includes('*')) return [];
      return entitiesOptions.entityList
        .filter(name => !entityNames.has(name))
        .map(name => ({
          message: `The entity ${name} which is declared in ${application.config.baseName}'s entity list doesn't exist.`,
          location: entitiesOptions.keyLocations?.[name],
        }));
    });
  },
};

export const entityOutsideApplication: JDLSemanticRule = {
  id: 'entity-outside-application',
  check: (ast, runtime) =>
    ast.applications.flatMap(application => {
      const applicationEntityNames = new Set(application.entities);
      return allOptionEntityLists(runtime, application.options, application.useOptions).flatMap(({ optionName, config }) =>
        listedEntityNames(config)
          .filter(name => !applicationEntityNames.has(name) && !config.excluded.includes(name))
          .map(name => ({
            message: `The entity ${name} in the ${optionName} option isn't declared in ${application.config.baseName}'s entity list.`,
            location: config.keyLocations?.[name],
          })),
      );
    }),
};

export const undeclaredOptionEntity: JDLSemanticRule = {
  id: 'undeclared-option-entity',
  check: (ast, runtime) => {
    const entityNames = new Set(ast.entities.map(entity => entity.name));
    return allOptionEntityLists(runtime, ast.options, ast.useOptions).flatMap(({ optionName, config }) =>
      listedEntityNames(config)
        .filter(name => !entityNames.has(name))
        .map(name => ({
          message: `The entity ${name} in the ${optionName} option is not declared.`,
          location: config.keyLocations?.[name],
        })),
    );
  },
};

/** The nodes declared under a name already taken: every declaration after the first one. */
const redeclared = <T extends { name: string }>(nodes: T[]): T[] => {
  const seen = new Set<string>();
  return nodes.filter(node => seen.has(node.name) || !seen.add(node.name));
};

export const duplicatedEntity: JDLSemanticRule = {
  id: 'duplicated-entity',
  check: ast =>
    redeclared(ast.entities).map(entity => ({
      message: `The entity ${entity.name} is declared more than once.`,
      location: entity.location,
    })),
};

export const duplicatedEnum: JDLSemanticRule = {
  id: 'duplicated-enum',
  check: ast =>
    redeclared(ast.enums).map(jdlEnum => ({ message: `The enum ${jdlEnum.name} is declared more than once.`, location: jdlEnum.location })),
};

export const duplicatedField: JDLSemanticRule = {
  id: 'duplicated-field',
  check: ast =>
    ast.entities.flatMap(entity =>
      redeclared(entity.body ?? []).map(field => ({
        message: `The field ${field.name} is declared more than once in the entity ${entity.name}.`,
        location: field.location,
      })),
    ),
};

export const semanticRules: JDLSemanticRule[] = [
  undeclaredRelationshipEntity,
  undeclaredApplicationEntity,
  entityOutsideApplication,
  undeclaredOptionEntity,
  duplicatedEntity,
  duplicatedEnum,
  duplicatedField,
];
