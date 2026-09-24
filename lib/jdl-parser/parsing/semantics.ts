/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 * Licensed under the Apache License, Version 2.0.
 */
import type { ParsedJDLApplications, ParsedJDLOptionConfig } from '../types/parsed.ts';
import type { JDLApplicationConfig, JDLDefinitions, JDLOptionsDefinition, JDLValidatorOptionType } from '../types/parsing.ts';
import type { JDLRuntime } from '../types/runtime.ts';

import { findConfigValidation, findOptionDefinition } from './definitions.ts';
import type { JDLDiagnostic } from './diagnostics.ts';
import type { SourceRange } from './locations.ts';

type Located = { location?: SourceRange };
type ConfigDeclaration = Located & { key: string; value: unknown; valueType?: string };
type OptionDeclaration = Located & ParsedJDLOptionConfig & { optionName: string; optionValue?: string };
type NameKind = keyof NonNullable<JDLDefinitions['names']>;

/** Validate the recovered AST without accessing models, logging, or generator defaults. */
export function validateSemantics(ast: ParsedJDLApplications, runtime: JDLRuntime, fallback: SourceRange): JDLDiagnostic[] {
  const diagnostics: JDLDiagnostic[] = [];
  const { definitions } = runtime;
  const report = (ruleId: string, message: string, node?: Located, severity: JDLDiagnostic['severity'] = 'error') => {
    diagnostics.push({ ruleId, severity, message, range: node?.location ?? fallback });
  };
  const checkName = (name: string, kind: NameKind, node: Located, label: string = kind) => {
    const pattern = definitions.names?.[kind];
    if (name && pattern && !matches(pattern, name)) {
      report(`name.${kind}`, `The ${label} name must match: ${pattern}, got ${name}.`, node);
    }
  };
  const checkDuplicates = <T extends Located>(nodes: T[], getName: (node: T) => string, kind: string) => {
    const seen = new Set<string>();
    for (const node of nodes) {
      const name = getName(node);
      if (!name) continue;
      if (seen.has(name)) report(`duplicate.${kind}`, `The ${kind} '${name}' is declared more than once.`, node);
      seen.add(name);
    }
  };

  const entities = new Set((ast.entities ?? []).map(entity => entity.name).filter(Boolean));
  const enums = new Set((ast.enums ?? []).map(enumDeclaration => enumDeclaration.name).filter(Boolean));
  const checkReference = (name: string, node: Located) => {
    if (name && name !== '*' && name !== 'all' && !entities.has(name)) {
      report('reference.entity', `The entity '${name}' is not declared.`, node);
    }
  };
  const checkEntityList = (names: readonly string[] | undefined, node: Located) => {
    for (const name of names ?? []) checkReference(name, node);
  };
  const checkOptions = (options: OptionDeclaration[], optionDefinitions: JDLOptionsDefinition = definitions.entity) => {
    for (const option of options) {
      const match = findOptionDefinition(optionDefinitions, option.optionName);
      if (!match) {
        report('option.unknown', `Unknown option: ${option.optionName}.`, option);
        continue;
      }
      const [name, definition] = match;
      const { jdl } = definition;
      if (option.optionValue !== undefined) {
        const path = option.optionValue.startsWith('"');
        checkName(option.optionValue, path ? 'path' : 'method', option, path ? 'methodPath' : 'method');
      }
      if (jdl.deprecatedKeywords?.includes(option.optionName)) {
        report(
          'option.deprecated',
          `The ${option.optionName} option is deprecated, please use ${jdl.keyword ?? name} instead.`,
          option,
          'warning',
        );
      }
      if ((jdl.type === 'binary') !== (option.optionValue !== undefined)) {
        report(
          'option.kind',
          jdl.type === 'binary' ?
            `The ${option.optionName} option needs a value: ${option.optionName} <entities> with <value>.`
          : `The ${option.optionName} option takes no value.`,
          option,
        );
      } else if (option.optionValue !== undefined && definition.choices && !definition.choices.includes(option.optionValue)) {
        report('option.value', `The '${name}' option is not valid for value '${option.optionValue}'.`, option);
      }
      checkEntityList(option.list, option);
      checkEntityList(option.excluded, option);
    }
  };
  const checkConfig = (
    declarations: ConfigDeclaration[],
    config: JDLApplicationConfig,
    kind: 'application' | 'deployment',
    node: Located,
  ) => {
    checkDuplicates(declarations, declaration => declaration.key, `${kind}-config`);
    const declaredKeys = new Set(declarations.map(declaration => declaration.key));
    for (const key of config.required ?? []) {
      if (!declaredKeys.has(key)) report('config.required', `The ${kind} config property '${key}' is required.`, node);
    }
    for (const declaration of declarations) {
      const validation = findConfigValidation(config, declaration.key);
      const optionType = own(config.optionsTypes, declaration.key);
      if (!validation || !optionType) {
        report('config.unknown', `Unknown ${kind} option: ${declaration.key}.`, declaration);
        continue;
      }
      if (optionType.deprecated) {
        report(
          'config.deprecated',
          `The ${declaration.key} ${kind} option is deprecated: ${optionType.deprecated}`,
          declaration,
          'warning',
        );
      }
      if (!hasExpectedValueType(validation.type, declaration)) {
        report('config.type', valueTypeMessage(validation.type, declaration), declaration);
        continue;
      }
      const values = Array.isArray(declaration.value) ? declaration.value : [declaration.value];
      let invalidPattern = false;
      if (validation.pattern) {
        const syntaxValues =
          declaration.valueType === 'qualifiedName' ?
            String(declaration.value).split('.')
          : values.map(value =>
              declaration.valueType === 'STRING' || declaration.valueType === 'quotedList' ? `"${String(value)}"` : String(value),
            );
        for (const value of syntaxValues) {
          if (!matches(validation.pattern, value)) {
            invalidPattern = true;
            report(
              'config.value',
              `The ${validation.msg ?? declaration.key} name must match: ${validation.pattern}, got ${value}.`,
              declaration,
            );
          }
        }
      }
      if (!invalidPattern) {
        const choices = config.optionsValues[declaration.key];
        if (choices && typeof choices === 'object' && !Array.isArray(choices)) {
          for (const value of values) {
            if (!Object.hasOwn(choices, String(value))) {
              report('config.value', `The '${declaration.key}' option is not valid for value '${String(value)}'.`, declaration);
            }
          }
        }
      }
    }
  };

  checkDuplicates(ast.entities ?? [], entity => entity.name, 'entity');
  checkDuplicates(ast.enums ?? [], enumDeclaration => enumDeclaration.name, 'enum');
  checkDuplicates(ast.applications ?? [], application => application.config.baseName, 'application');
  checkDuplicates(ast.constantDeclarations ?? [], constant => constant.name, 'constant');
  for (const constant of ast.constantDeclarations ?? []) checkName(constant.name, 'constant', constant);
  for (const entity of ast.entities ?? []) {
    checkName(entity.name, 'entity', entity);
    if (enums.has(entity.name)) report('duplicate.type', `The name '${entity.name}' is used by both an entity and an enum.`, entity);
    checkDuplicates(entity.body ?? [], field => field.name, 'field');
    for (const annotation of entity.annotations ?? []) {
      // Generator extensions may introduce arbitrary annotations, but known options must retain their contract.
      const name = annotation.optionName.charAt(0).toLowerCase() + annotation.optionName.slice(1);
      const definition = own(definitions.entity.configs, name);
      if (!definition) continue;
      if (definition.jdl.type === 'binary' && annotation.optionValue === undefined) {
        report('option.kind', `The '${name}' option requires a value.`, annotation);
      } else if (definition.jdl.type === 'unary' && annotation.optionValue !== undefined && typeof annotation.optionValue !== 'boolean') {
        report('option.kind', `The '${name}' option requires a boolean annotation value.`, annotation);
      } else if (definition.choices && !definition.choices.includes(String(annotation.optionValue))) {
        report('option.value', `The '${name}' option is not valid for value '${String(annotation.optionValue)}'.`, annotation);
      }
    }
    for (const field of entity.body ?? []) {
      checkName(field.name, 'field', field, 'fieldName');
      checkName(field.type, 'type', field, 'typeName');
      const isEnum = enums.has(field.type);
      const fieldDefinition = definitions.fieldTypes && own(definitions.fieldTypes, field.type);
      const unknownType = definitions.fieldTypes && !fieldDefinition && !isEnum;
      if (field.type && unknownType) report('field.type', `The type '${field.type}' is not a declared enum or a known field type.`, field);
      checkDuplicates(field.validations ?? [], validation => validation.key, 'validation');
      for (const validation of field.validations ?? []) {
        const validationDefinition = definitions.validations && own(definitions.validations, validation.key);
        if (definitions.validations && !validationDefinition) {
          report('validation.unknown', `The validation ${validation.key} doesn't exist.`, validation);
          continue;
        }
        const supported = isEnum ? definitions.enumValidations : fieldDefinition?.validations;
        if (!unknownType && supported && !supported.includes(validation.key)) {
          report('validation.type', `The validation '${validation.key}' isn't supported for the type '${field.type}'.`, validation);
          continue;
        }
        if (!validationDefinition) continue;
        if (validationDefinition.type === 'flag') {
          if (validation.value !== undefined && validation.value !== true && validation.value !== '') {
            report('validation.value', `The validation ${validation.key} does not accept a value.`, validation);
          }
          continue;
        }
        if (validation.value === undefined) {
          report('validation.value', `The validation ${validation.key} requires a value.`, validation);
          continue;
        }
        let { value } = validation;
        if (validation.constant) {
          const constantName = String(value);
          if (!Object.hasOwn(ast.constants ?? {}, constantName)) {
            report('reference.constant', `The constant '${constantName}' is not declared.`, validation);
            continue;
          }
          value = ast.constants[constantName];
        }
        if (validationDefinition.type === 'number') {
          const numeric = Number(value);
          if (!Number.isFinite(numeric)) {
            report('validation.value', `The validation ${validation.key} requires a numeric value.`, validation);
          } else if (validationDefinition.integer && (!Number.isInteger(numeric) || String(value).includes('.'))) {
            report('validation.value', `Decimal values are forbidden for the ${validation.key} validation.`, validation);
          }
        } else if (validationDefinition.type === 'pattern') {
          try {
            // Constructing a regular expression validates it without executing user code or the expression.
            new RegExp(String(value));
          } catch {
            report('validation.pattern', `The validation ${validation.key} requires a valid regular expression.`, validation);
          }
        }
      }
    }
  }
  const usedTypes = new Set((ast.entities ?? []).flatMap(entity => (entity.body ?? []).map(field => field.type)));
  const warnedUnusedEnums = new Set<string>();
  for (const enumDeclaration of ast.enums ?? []) {
    checkName(enumDeclaration.name, 'enum', enumDeclaration);
    if (!usedTypes.has(enumDeclaration.name) && !warnedUnusedEnums.has(enumDeclaration.name)) {
      report('enum.unused', `The enum '${enumDeclaration.name}' is not used by any field.`, enumDeclaration, 'warning');
      warnedUnusedEnums.add(enumDeclaration.name);
    }
    checkDuplicates(enumDeclaration.values ?? [], value => value.key, 'enum-value');
    for (const value of enumDeclaration.values ?? []) {
      checkName(value.key, 'enumValue', value, 'enum property name');
      if (value.value && !value.quoted) checkName(value.value, 'enumValueValue', value, 'enum property value');
    }
  }
  for (const relationship of ast.relationships ?? []) {
    const { from, to } = relationship;
    if (!from || !to) continue;
    checkName(from.name, 'entity', from);
    checkName(to.name, 'entity', to);
    for (const side of [from, to]) {
      if (side.injectedField) {
        const [field, parameter] = side.injectedField.split('(');
        checkName(field, 'injectedField', side);
        if (parameter !== undefined) checkName(parameter.replace(/\)$/, ''), 'injectedField', side);
      }
      for (const validation of side.validationDeclarations ?? []) {
        if (validation.key !== 'required') {
          report('relationship.validation', `The validation '${validation.key}' is not supported for a relationship.`, validation);
        }
      }
    }
    checkReference(from.name, from);
    const builtInDestination = relationship.options?.global?.some(option => option.optionName === 'builtInEntity');
    if (!builtInDestination) checkReference(to.name, to);
    if (!['OneToOne', 'OneToMany', 'ManyToOne', 'ManyToMany'].includes(relationship.cardinality)) {
      report('relationship.type', `The relationship type '${relationship.cardinality}' doesn't exist.`, relationship);
      continue;
    }
    if (relationship.cardinality === 'OneToOne' && !from.injectedField && to.injectedField) {
      report(
        'relationship.owner',
        `In the One-to-One relationship from ${from.name} to ${to.name}, the source entity must possess the destination, or you must invert the direction of the relationship.`,
        from,
      );
    }
    if (from.name?.toLowerCase() === to.name?.toLowerCase() && (from.required || to.required)) {
      report(
        'relationship.required',
        `Required relationships to the same entity are not supported, for relationship from and to '${from.name}'.`,
        relationship,
      );
    }
    for (const annotation of [
      relationship.options?.global ?? [],
      relationship.options?.source ?? [],
      relationship.options?.destination ?? [],
    ].flat()) {
      // Annotation names remain extensible; statement options must be declared by the host.
      const statementDefinition = findOptionDefinition(definitions.relationship, annotation.optionName)?.[1];
      const definition =
        annotation.statement ? statementDefinition : (own(definitions.relationship.configs, annotation.optionName) ?? statementDefinition);
      if (!definition) {
        if (annotation.statement) report('option.unknown', `Unknown relationship option: ${annotation.optionName}.`, annotation);
        continue;
      }
      if (definition.jdl.type === 'binary' && annotation.optionValue === undefined) {
        report('option.kind', `The '${annotation.optionName}' option requires a value.`, annotation);
      } else if (definition.choices && !definition.choices.includes(String(annotation.optionValue))) {
        report(
          'option.value',
          `The '${annotation.optionName}' option is not valid for value '${String(annotation.optionValue)}'.`,
          annotation,
        );
      }
    }
  }
  checkOptions(ast.optionDeclarations ?? []);
  const applicationsPerEntity = new Map<string, Set<number>>();
  let applicationIndex = 0;
  for (const application of ast.applications ?? []) {
    checkConfig(application.configDeclarations ?? [], definitions.application, 'application', application);
    checkEntityList(application.entitiesOptions?.entityList ?? application.entities, application);
    checkEntityList(application.entitiesOptions?.excluded, application);
    checkOptions(application.optionDeclarations ?? []);
    checkUseOptions(application.useOptions ?? []);
    const included = application.entitiesOptions?.entityList ?? application.entities ?? [];
    const selected = new Set(included.includes('*') || included.includes('all') ? entities : included);
    for (const excluded of application.entitiesOptions?.excluded ?? []) selected.delete(excluded);
    for (const entity of selected) {
      const owners = applicationsPerEntity.get(entity) ?? new Set<number>();
      owners.add(applicationIndex);
      applicationsPerEntity.set(entity, owners);
    }
    applicationIndex++;
    if (definitions.namespaceConfigOption) {
      const namespaces = application.config[definitions.namespaceConfigOption];
      // A malformed list already has a config.type diagnostic; avoid a second error for its contents.
      if (namespaces === undefined || Array.isArray(namespaces)) {
        for (const [namespace, config] of Object.entries(application.namespaceConfigs ?? {})) {
          if (!namespaces?.includes(namespace)) {
            report(
              'reference.namespace',
              `Namespace config '${namespace}' requires '${namespace}' in '${definitions.namespaceConfigOption}'.`,
              config,
            );
          }
        }
      }
    }
    for (const option of [...(application.optionDeclarations ?? []), ...(application.useOptions ?? [])]) {
      for (const name of option.list) {
        if (entities.has(name) && !selected.has(name) && !option.excluded.includes(name)) {
          report('reference.application-entity', `The entity '${name}' is not declared in this application.`, option);
        }
      }
    }
  }
  for (const relationship of ast.relationships ?? []) {
    const sources = applicationsPerEntity.get(relationship.from.name);
    const destinations = applicationsPerEntity.get(relationship.to.name);
    if (
      entities.has(relationship.from.name) &&
      entities.has(relationship.to.name) &&
      sources?.size &&
      destinations?.size &&
      [...sources].some(source => !destinations.has(source))
    ) {
      report(
        'relationship.application',
        `Entities for the ${relationship.cardinality} relationship from '${relationship.from.name}' to '${relationship.to.name}' do not belong to the same application.`,
        relationship,
      );
    }
  }
  for (const deployment of ast.deployments ?? []) {
    checkConfig(deployment.configDeclarations ?? [], definitions.deployment, 'deployment', deployment);
  }
  checkUseOptions(ast.useOptions ?? []);
  return diagnostics;

  function checkUseOptions(options: (Located & { optionValues: string[]; list: string[]; excluded: string[] })[]) {
    for (const option of options) {
      checkEntityList(option.list, option);
      checkEntityList(option.excluded, option);
      for (const value of option.optionValues) {
        const known = Object.entries(definitions.entity.configs).some(
          ([name, definition]) => (definition.jdl.type === 'unary' && name === value) || definition.choices?.includes(value),
        );
        if (!known) report('option.unknown-value', `The '${value}' option value is not recognized.`, option);
      }
    }
  }
}

function matches(pattern: RegExp, value: string): boolean {
  // A supplied global/sticky pattern must not retain state between validations or parses.
  return new RegExp(pattern.source, pattern.flags).test(value);
}

function own<T>(record: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.hasOwn(record, key) ? record[key] : undefined;
}

function hasExpectedValueType(expected: JDLValidatorOptionType, declaration: ConfigDeclaration): boolean {
  const { value, valueType } = declaration;
  if (expected === 'NAME') {
    return valueType === 'BOOLEAN' || ((valueType === 'NAME' || valueType === 'qualifiedName') && !String(value).includes('.'));
  }
  if (expected === 'qualifiedName') return valueType === 'qualifiedName' || valueType === 'NAME';
  return valueType === expected;
}

function valueTypeMessage(expected: JDLValidatorOptionType, declaration: ConfigDeclaration): string {
  if (expected === 'NAME' && declaration.valueType === 'qualifiedName')
    return 'A single name is expected, but found a fully qualified name.';
  const labels: Record<JDLValidatorOptionType, string> = {
    NAME: 'A name',
    qualifiedName: 'A fully qualified name',
    list: 'An array of names',
    quotedList: 'An array of names',
    INTEGER: 'An integer literal',
    STRING: 'A string literal',
    BOOLEAN: 'A boolean literal',
  };
  const value = declaration.valueType === 'STRING' ? `"${String(declaration.value)}"` : String(declaration.value);
  return `${labels[expected]} is expected, but found: "${value}"`;
}
