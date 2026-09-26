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
import { getDuplicatedKeys } from '../location.ts';
import { JDL_RELATIONSHIP_BUILT_IN_ENTITY } from '../relationship-options.ts';
import { JDL_RELATIONSHIP_ONE_TO_ONE } from '../relationship-types.ts';
import { type JDLApplicationStatement, applicationStatementName, getStatements, isDuplicatedApplicationStatement } from '../statements.ts';
import type { JDLLocation, ParsedJDLOptionConfig, ParsedJDLRelationship, ParsedJDLUseOption } from '../types/parsed.ts';
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

/** The `builtInEntity` option of a relationship, if it has one. */
const builtInEntityOption = (relationship: ParsedJDLRelationship) =>
  relationship.options.global.find(option => option.optionName === JDL_RELATIONSHIP_BUILT_IN_ENTITY);

/** Whether an entity may be the destination of a relationship `with builtInEntity`: any is, unless the runtime lists them. */
const mayBeBuiltIn = (runtime: JDLRuntime, entityName: string): boolean => runtime.builtInEntities?.includes(entityName) ?? true;

export const undeclaredRelationshipEntity: JDLSemanticRule = {
  id: 'undeclared-relationship-entity',
  check: (ast, runtime) => {
    const entityNames = new Set(ast.entities.map(entity => entity.name));
    return ast.relationships.flatMap(relationship => {
      const { from, to } = relationship;
      // A destination the runtime does not provide is the built-in-entity rule's.
      const toBuiltIn = builtInEntityOption(relationship) !== undefined;
      const absent = [from.name, ...(toBuiltIn ? [] : [to.name])].filter(name => !entityNames.has(name));
      if (absent.length === 0) return [];
      const hint =
        !toBuiltIn && absent.includes(to.name) && mayBeBuiltIn(runtime, to.name) ?
          ` If '${to.name}' is a built-in entity declare like '${from.name} to ${to.name} with builtInEntity'.`
        : '';
      return [
        {
          message: `In the relationship between ${from.name} and ${to.name}, ${absent.join(' and ')} ${absent.length === 1 ? 'is' : 'are'} not declared.${hint}`,
          location: relationship.location,
        },
      ];
    });
  },
};

export const builtInEntity: JDLSemanticRule = {
  id: 'built-in-entity',
  check: (ast, runtime) => {
    const { builtInEntities } = runtime;
    if (!builtInEntities) return [];
    return ast.relationships.flatMap(relationship => {
      const option = builtInEntityOption(relationship);
      const { from, to } = relationship;
      if (!option || builtInEntities.includes(to.name)) return [];
      const known =
        builtInEntities.length === 0 ? 'there is no built-in entity' : `the built-in entities are: ${builtInEntities.join(', ')}`;
      return [
        {
          message: `In the relationship between ${from.name} and ${to.name}, ${to.name} is not a built-in entity, ${known}.`,
          location: option.location ?? relationship.location,
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

export const relationshipBetweenApplications: JDLSemanticRule = {
  id: 'relationship-between-applications',
  check: ast => {
    const applicationsPerEntity = new Map<string, Set<string>>();
    for (const application of ast.applications) {
      for (const entityName of application.entities ?? []) {
        if (!applicationsPerEntity.has(entityName)) applicationsPerEntity.set(entityName, new Set());
        applicationsPerEntity.get(entityName)!.add(application.config.baseName);
      }
    }
    return ast.relationships.flatMap(relationship => {
      const sourceApplications = applicationsPerEntity.get(relationship.from.name);
      const destinationApplications = applicationsPerEntity.get(relationship.to.name);
      // An application with the source entity must have the destination one.
      if (!sourceApplications || !destinationApplications || [...sourceApplications].every(name => destinationApplications.has(name))) {
        return [];
      }
      return [
        {
          message: `Entities for the ${relationship.cardinality} relationship from '${relationship.from.name}' to '${relationship.to.name}' do not belong to the same application.`,
          location: relationship.location,
        },
      ];
    });
  },
};

/** A value an option with choices does not take, a list value by any of its items. */
const isValueNotAllowed = (
  definition: JDLRuntime['applicationDefinition'],
  optionName: string,
  value: unknown,
): value is string | string[] =>
  (Array.isArray(value) || typeof value === 'string') &&
  definition.doesOptionExist(optionName) &&
  !definition.doesOptionValueExist(optionName, value);

export const applicationOptionValue: JDLSemanticRule = {
  id: 'application-option-value',
  check: (ast, runtime) =>
    ast.applications.flatMap(({ config }) =>
      Object.entries(config)
        .filter(([optionName, value]) => isValueNotAllowed(runtime.applicationDefinition, optionName, value))
        .map(([optionName, value]) => ({
          message: `The value '${value}' is not allowed for the option '${optionName}'.`,
          location: config.keyLocations?.[optionName],
        })),
    ),
};

export const deploymentOptionValue: JDLSemanticRule = {
  id: 'deployment-option-value',
  check: (ast, runtime) =>
    ast.deployments.flatMap(deployment =>
      Object.entries(deployment)
        .filter(([optionName, value]) => isValueNotAllowed(runtime.deploymentDefinition, optionName, value))
        .map(([optionName, value]) => ({
          message: `The value '${value}' is not allowed for the deployment option '${optionName}'.`,
          location: deployment.keyLocations?.[optionName],
        })),
    ),
};

/** A namespace config configures the blueprint of the same name, which the application must use. */
export const duplicatedApplicationStatement: JDLSemanticRule = {
  id: 'duplicated-application-statement',
  check: ast =>
    ast.applications.flatMap(application => {
      const statements = getStatements<JDLApplicationStatement>(application) ?? [];
      return statements
        .filter(statement => isDuplicatedApplicationStatement(statements, statement))
        .map(statement => ({
          message: `The application ${application.config.baseName} declares ${applicationStatementName(statement)} more than once.`,
          location: statement.location,
        }));
    }),
};

export const duplicatedApplication: JDLSemanticRule = {
  id: 'duplicated-application',
  check: ast => {
    const seen = new Set<string>();
    return ast.applications
      .filter(({ config: { baseName } }) => baseName !== undefined && (seen.has(baseName) || !seen.add(baseName)))
      .map(application => ({
        message: `The application ${application.config.baseName} is declared more than once.`,
        location: application.location,
      }));
  },
};

export const duplicatedConfigKey: JDLSemanticRule = {
  id: 'duplicated-config-key',
  check: ast => [
    ...ast.applications.flatMap(application => [
      ...getDuplicatedKeys(application.config).map(({ key, location }) => ({
        message: `The application ${application.config.baseName} declares the option ${key} more than once.`,
        location,
      })),
      ...Object.entries(application.namespaceConfigs ?? {}).flatMap(([namespace, config]) =>
        getDuplicatedKeys(config).map(({ key, location }) => ({
          message: `The application ${application.config.baseName} declares ${key} more than once in config(${namespace}).`,
          location,
        })),
      ),
    ]),
    ...ast.deployments.flatMap(deployment =>
      getDuplicatedKeys(deployment).map(({ key, location }) => ({
        message: `The ${deployment.deploymentType} deployment declares the option ${key} more than once.`,
        location,
      })),
    ),
  ],
};

export const namespaceConfigBlueprint: JDLSemanticRule = {
  id: 'namespace-config-blueprint',
  check: ast =>
    ast.applications.flatMap(application => {
      const { blueprints } = application.config;
      return Object.entries(application.namespaceConfigs ?? {})
        .filter(([namespace]) => !(Array.isArray(blueprints) && blueprints.includes(namespace)))
        .map(([namespace, config]) => ({
          message: `Blueprint namespace config ${namespace} requires the blueprint ${namespace}`,
          location: config.location,
        }));
    }),
};

export const unusedEnum: JDLSemanticRule = {
  id: 'unused-enum',
  check: ast => {
    const fieldTypes = new Set(ast.entities.flatMap(entity => (entity.body ?? []).map(field => field.type)));
    return ast.enums
      .filter(jdlEnum => !fieldTypes.has(jdlEnum.name))
      .map(jdlEnum => ({ severity: 'info' as const, message: `The enum ${jdlEnum.name} is not used.`, location: jdlEnum.location }));
  },
};

export const emptyEntityBody: JDLSemanticRule = {
  id: 'empty-entity-body',
  check: ast =>
    ast.entities
      .filter(entity => entity.bodyLocation && (entity.body ?? []).length === 0)
      .map(entity => ({
        severity: 'info' as const,
        message: `The entity ${entity.name} has no field, it can be declared without braces.`,
        location: entity.bodyLocation,
      })),
};

export const individualRelationshipDeclaration: JDLSemanticRule = {
  id: 'individual-relationship-declaration',
  check: ast => {
    // The declarations of each relationship type, by where they start.
    const declarations = new Map<string, Map<number, JDLLocation | undefined>>();
    for (const { cardinality, declarationLocation } of ast.relationships) {
      if (!declarations.has(cardinality)) declarations.set(cardinality, new Map());
      declarations.get(cardinality)!.set(declarationLocation?.startOffset ?? -1, declarationLocation);
    }
    return [...declarations].flatMap(([cardinality, locations]) =>
      locations.size < 2 ?
        []
      : [...locations.values()].map(location => ({
          severity: 'info' as const,
          message: `The ${cardinality} relationships are declared apart, they can be declared together.`,
          location,
        })),
    );
  },
};

export const semanticRules: JDLSemanticRule[] = [
  undeclaredRelationshipEntity,
  builtInEntity,
  undeclaredApplicationEntity,
  entityOutsideApplication,
  undeclaredOptionEntity,
  duplicatedEntity,
  duplicatedEnum,
  duplicatedField,
  duplicatedApplication,
  duplicatedApplicationStatement,
  duplicatedConfigKey,
  fieldType,
  validationForFieldType,
  decimalValidationValue,
  requiredReflexiveRelationship,
  oneToOneDirection,
  optionValue,
  relationshipBetweenApplications,
  applicationOptionValue,
  deploymentOptionValue,
  namespaceConfigBlueprint,
  unusedEnum,
  emptyEntityBody,
  individualRelationshipDeclaration,
];
