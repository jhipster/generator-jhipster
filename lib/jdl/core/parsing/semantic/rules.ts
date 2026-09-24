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
import { JDL_RELATIONSHIP_ONE_TO_ONE } from '../relationship-types.ts';
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

export const fieldType: JDLSemanticRule = {
  id: 'field-type',
  check: (ast, runtime) => {
    if (!runtime.fieldTypesDefinition) return [];
    const { types } = runtime.fieldTypesDefinition;
    const enumNames = new Set(ast.enums.map(jdlEnum => jdlEnum.name));
    return ast.entities.flatMap(entity =>
      (entity.body ?? []).flatMap(field => {
        if (enumNames.has(field.type)) return [];
        const type = types[field.type];
        if (!type) {
          return [
            {
              message: `The type ${field.type} of the field ${field.name} in the entity ${entity.name} is neither a field type nor an enum.`,
              location: field.location,
            },
          ];
        }
        if (type.deprecated) {
          return [
            {
              severity: 'warning' as const,
              message: `The type ${field.type} of the field ${field.name} in the entity ${entity.name} is deprecated: ${type.deprecated}.`,
              location: field.location,
            },
          ];
        }
        return [];
      }),
    );
  },
};

export const validationForFieldType: JDLSemanticRule = {
  id: 'validation-for-field-type',
  check: (ast, runtime) => {
    if (!runtime.fieldTypesDefinition) return [];
    const { types, enum: enumType } = runtime.fieldTypesDefinition;
    const enumNames = new Set(ast.enums.map(jdlEnum => jdlEnum.name));
    return ast.entities.flatMap(entity =>
      (entity.body ?? []).flatMap(field => {
        // An unknown type is the field-type rule's.
        if (!enumNames.has(field.type) && !types[field.type]) return [];
        const allowed = enumNames.has(field.type) ? enumType.validations : types[field.type].validations;
        return field.validations
          .filter(validation => !allowed.includes(validation.key))
          .map(validation => ({
            message: `The validation '${validation.key}' isn't supported for the type '${field.type}'.`,
            location: validation.location,
          }));
      }),
    );
  },
};

export const decimalValidationValue: JDLSemanticRule = {
  id: 'decimal-validation-value',
  check: (ast, runtime) =>
    ast.entities.flatMap(entity =>
      (entity.body ?? []).flatMap(field =>
        field.validations
          .filter(validation => runtime.validationDefinition.configs[validation.key]?.jdl.value === 'integer')
          .filter(validation => String(validation.constant ? ast.constants[validation.value as string] : validation.value).includes('.'))
          .map(validation => ({
            message: `Decimal values are forbidden for the ${validation.key} validation.`,
            location: validation.location,
          })),
      ),
    ),
};

export const requiredReflexiveRelationship: JDLSemanticRule = {
  id: 'required-reflexive-relationship',
  check: ast =>
    ast.relationships
      .filter(({ from, to }) => from.name.toLowerCase() === to.name.toLowerCase() && (from.required || to.required))
      .map(relationship => ({
        message: `Required relationships to the same entity are not supported, for relationship from and to '${relationship.from.name}'.`,
        location: relationship.location,
      })),
};

export const oneToOneDirection: JDLSemanticRule = {
  id: 'one-to-one-direction',
  check: ast =>
    ast.relationships
      // Without any injected field, both sides get one.
      .filter(({ cardinality, from, to }) => cardinality === JDL_RELATIONSHIP_ONE_TO_ONE && !from.injectedField && to.injectedField)
      .map(relationship => ({
        message:
          `In the One-to-One relationship from ${relationship.from.name} to ${relationship.to.name}, ` +
          'the source entity must possess the destination, or you must invert the direction of the relationship.',
        location: relationship.location,
      })),
};

/** Whether a value is one of the choices of an option, an option without choices taking any value. */
const isOptionValue = (runtime: JDLRuntime, optionName: string, value: string): boolean => {
  const choices = runtime.entityDefinition.configs[optionName]?.choices;
  return !choices || choices.includes(value);
};

export const optionValue: JDLSemanticRule = {
  id: 'option-value',
  check: (ast, runtime) => {
    const blocks = [ast, ...ast.applications];
    const binaryOptions = blocks.flatMap(block =>
      Object.entries(block.options ?? {}).flatMap(([optionName, config]) =>
        Array.isArray((config as ParsedJDLOptionConfig).list) ?
          []
        : Object.entries(config as Record<string, ParsedJDLOptionConfig>).map(([value, valueConfig]) => ({
            optionName,
            value,
            valueConfig,
          })),
      ),
    );
    const useOptions = blocks.flatMap(block => block.useOptions ?? []);
    return [
      ...binaryOptions
        .filter(({ optionName, value }) => !isOptionValue(runtime, optionName, value))
        .map(({ optionName, value, valueConfig }) => ({
          message: `The '${optionName}' option is not valid for value '${value}'.`,
          location: valueConfig.location,
        })),
      ...useOptions.flatMap(useOption =>
        useOption.optionValues
          // `no` is a value of several options, it selects none of them.
          .filter(
            value => value === 'no' || !Object.values(runtime.entityDefinition.configs).some(config => config.choices?.includes(value)),
          )
          .map(value => ({
            message: `The value '${value}' of the use statement is the value of no option.`,
            location: useOption.location,
          })),
      ),
    ];
  },
};

export const semanticRules: JDLSemanticRule[] = [
  undeclaredRelationshipEntity,
  undeclaredApplicationEntity,
  entityOutsideApplication,
  undeclaredOptionEntity,
  duplicatedEntity,
  duplicatedEnum,
  duplicatedField,
  fieldType,
  validationForFieldType,
  decimalValidationValue,
  requiredReflexiveRelationship,
  oneToOneDirection,
  optionValue,
];
