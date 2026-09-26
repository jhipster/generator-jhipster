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

import { type JDLApplicationStatement, type JDLStatement, getStatements } from '../parsing/statements.ts';
import type {
  ParsedJDLAnnotation,
  ParsedJDLApplicationDeclaration,
  ParsedJDLDeployment,
  ParsedJDLEntity,
  ParsedJDLEntityField,
  ParsedJDLEnum,
  ParsedJDLOption,
  ParsedJDLRelationship,
  ParsedJDLRelationshipSide,
  ParsedJDLUseOption,
  ParsedJDLValidation,
} from '../parsing/types/parsed.ts';
import type { JDLRuntime } from '../parsing/types/runtime.ts';
import { formatComment } from '../utils/format-utils.ts';

/** A value the grammar reads without quotes: a name, or names joined by dots. */
const UNQUOTED_VALUE = /^[a-zA-Z_][\w-]*(\.[a-zA-Z_][\w-]*)*$/;

const INDENT = '  ';

/** The statements printed on following lines, without a blank line between them: the other types are their own group. */
const STATEMENT_GROUPS: Record<string, string> = { use: 'option', namespaceConfig: 'config' };

const statementGroup = (type: string): string => STATEMENT_GROUPS[type] ?? type;

/** Prints statements, a blank line between two groups. */
function printSequence<T extends { type: string }>(statements: readonly T[], print: (statement: T) => string): string {
  return statements
    .map((statement, index) => {
      const previous = statements[index - 1];
      if (!previous) return print(statement);
      const separator = statementGroup(previous.type) === statementGroup(statement.type) ? '\n' : '\n\n';
      return `${separator}${print(statement)}`;
    })
    .join('');
}

/**
 * Prints a jdl from its statements, as the parser keeps them (`getStatements(ast)`), in their order: parsing the printed jdl
 * gives the same statements again, without the locations.
 */
export function printJDL(statements: readonly JDLStatement[], runtime: JDLRuntime): string {
  return `${printSequence(statements, statement => printStatement(statement, runtime))}\n`;
}

function printStatement(statement: JDLStatement, runtime: JDLRuntime): string {
  switch (statement.type) {
    case 'constant':
      return `${statement.name} = ${statement.value}`;
    case 'application':
      return printApplication(statement.application, runtime);
    case 'deployment':
      return printDeployment(statement.deployment, runtime);
    case 'entity':
      return printEntity(statement.entity);
    case 'enum':
      return printEnum(statement.enum);
    case 'relationships':
      return `relationship ${statement.cardinality} {\n${statement.relationships.map(relationship => printRelationship(relationship)).join('\n')}\n}`;
    case 'option':
      return printOption(statement.option);
    case 'use':
      return printUse(statement.use);
  }
}

/**
 * A javadoc comment, from the text the parser keeps between its delimiters or from a json documentation: the importer
 * joins the lines of a comment with a written `\\n`, which is printed as a new line.
 */
function printComment(comment: string | null | undefined, indent = ''): string {
  const text = formatComment(comment);
  if (!text) {
    return '';
  }
  const lines = text.split('\\n').map(line => `${indent} * ${line}\n`);
  return `${indent}/**\n${lines.join('')}${indent} */\n`;
}

function printAnnotations(annotations: ParsedJDLAnnotation[] | undefined, indent = ''): string {
  return (annotations ?? []).map(annotation => `${indent}${printAnnotation(annotation)}\n`).join('');
}

function printAnnotation({ optionName, optionValue }: ParsedJDLAnnotation): string {
  if (optionValue === undefined || optionValue === true) {
    return `@${optionName}`;
  }
  if (typeof optionValue === 'string') {
    // A string is kept as written, with its escaped quotes.
    return `@${optionName}("${optionValue.replace(/(?<!\\)"/g, '\\"')}")`;
  }
  return `@${optionName}(${optionValue})`;
}

function printConfigValue(value: unknown, quoted: boolean): string {
  if (Array.isArray(value)) {
    return `[${value.map(item => printConfigValue(item, quoted)).join(', ')}]`;
  }
  if (typeof value !== 'string' || /^\d+$/.test(value)) {
    return String(value);
  }
  // A value holding a quote is written as it was read.
  if ((quoted || !UNQUOTED_VALUE.test(value)) && !value.includes('"')) {
    return `"${value}"`;
  }
  return value;
}

function printConfigBlock(keyword: string, config: Record<string, unknown>, isQuoted: (key: string) => boolean): string {
  const entries = Object.entries(config).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return `${INDENT}${keyword} {}`;
  }
  const lines = entries.map(([key, value]) => `${INDENT}${INDENT}${key} ${printConfigValue(value, isQuoted(key))}`);
  return `${INDENT}${keyword} {\n${lines.join('\n')}\n${INDENT}}`;
}

function printApplication(application: ParsedJDLApplicationDeclaration, runtime: JDLRuntime): string {
  const { applicationDefinition } = runtime;
  const isQuoted = (key: string) =>
    applicationDefinition.shouldTheValueBeQuoted(key) ||
    applicationDefinition.optionTypes[key]?.type === 'quotedList' ||
    runtime.propertyValidations[key]?.type === 'STRING';
  const statements = getStatements<JDLApplicationStatement>(application) ?? [];
  const printed = printSequence(statements, statement => {
    switch (statement.type) {
      case 'config':
        return printConfigBlock('config', statement.config, isQuoted);
      case 'namespaceConfig':
        return printConfigBlock(`config(${statement.namespace})`, statement.config, () => false);
      case 'entities':
        return `${INDENT}entities ${printEntityList(statement.entities.entityList, statement.entities.excluded)}`;
      case 'option':
        return `${INDENT}${printOption(statement.option)}`;
      case 'use':
        return `${INDENT}${printUse(statement.use)}`;
    }
  });
  return `application {\n${printed}\n}`;
}

function printDeployment(deployment: ParsedJDLDeployment, runtime: JDLRuntime): string {
  const lines = Object.entries(deployment)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${INDENT}${key} ${printConfigValue(value, runtime.deploymentPropertyValidations[key]?.type === 'STRING')}`);
  return `deployment {\n${lines.join('\n')}\n}`;
}

function printEntity(entity: ParsedJDLEntity): string {
  let printed = `${printComment(entity.documentation)}${printAnnotations(entity.annotations)}entity ${entity.name}`;
  if (entity.tableName) {
    printed += ` (${entity.tableName})`;
  }
  if (entity.body?.length) {
    printed += ` {\n${entity.body.map(field => printField(field)).join('\n')}\n}`;
  }
  return printed;
}

function printField(field: ParsedJDLEntityField): string {
  const validations = field.validations.map(validation => ` ${printValidation(validation)}`).join('');
  return `${printComment(field.documentation, INDENT)}${printAnnotations(field.annotations, INDENT)}${INDENT}${field.name} ${field.type}${validations}`;
}

function printValidation({ key, value, constant }: ParsedJDLValidation): string {
  if (value === undefined || value === null || value === '') {
    return key;
  }
  if (value instanceof RegExp) {
    return `${key}(${value.toString()})`;
  }
  if (key === 'pattern' && !constant) {
    return `${key}(/${value}/)`;
  }
  return `${key}(${value})`;
}

function printEnum(jdlEnum: ParsedJDLEnum): string {
  const values = jdlEnum.values.map(({ key, value, comment }) => {
    const printedValue = value ? ` (${UNQUOTED_VALUE.test(value) ? value : `"${value}"`})` : '';
    return `${printComment(comment, INDENT)}${INDENT}${key}${printedValue}`;
  });
  return `${printComment(jdlEnum.documentation)}enum ${jdlEnum.name} {\n${values.join(',\n')}\n}`;
}

function printRelationship({ from, to, options }: ParsedJDLRelationship): string {
  let printed = `${printRelationshipSideWithAnnotations(from, options.source, INDENT)} to`;
  printed += printRelationshipSideWithAnnotations(to, options.destination, to.documentation ? `\n${INDENT}` : ' ');
  if (options.global.length > 0) {
    printed += ` with ${options.global.map(option => option.optionName).join(', ')}`;
  }
  return printed;
}

/** A side of a relationship: its annotations come before its comment. */
function printRelationshipSideWithAnnotations(side: ParsedJDLRelationshipSide, annotations: ParsedJDLAnnotation[], before: string): string {
  const printedAnnotations = annotations.map(annotation => printAnnotation(annotation)).join(' ');
  if (!side.documentation) {
    return `${before}${printedAnnotations ? `${printedAnnotations} ` : ''}${printRelationshipSide(side)}`;
  }
  const comment = printComment(side.documentation, INDENT);
  const lineStart = before.startsWith('\n') ? '\n' : '';
  if (!printedAnnotations) {
    return `${lineStart}${comment}${INDENT}${printRelationshipSide(side)}`;
  }
  return `${lineStart}${INDENT}${printedAnnotations}\n${comment}${INDENT}${printRelationshipSide(side)}`;
}

function printRelationshipSide({ name, injectedField, required }: ParsedJDLRelationshipSide): string {
  if (!injectedField) {
    return name;
  }
  return `${name}{${injectedField}${required ? ' required' : ''}}`;
}

function printEntityList(list: string[], excluded: string[]): string {
  const printed = list.join(', ');
  return excluded.length > 0 ? `${printed} except ${excluded.join(', ')}` : printed;
}

/** An option statement, with its keyword as written. */
function printOption({ optionName, optionValue, list, excluded }: ParsedJDLOption): string {
  if (optionValue === undefined) {
    return `${optionName} ${printEntityList(list, excluded)}`;
  }
  // A value written as a string, a path, keeps its quotes.
  const value = UNQUOTED_VALUE.test(optionValue) || optionValue.startsWith('"') ? optionValue : `"${optionValue}"`;
  return `${optionName} ${list.join(', ')} with ${value}${excluded.length > 0 ? ` except ${excluded.join(', ')}` : ''}`;
}

function printUse({ optionValues, list, excluded }: ParsedJDLUseOption): string {
  return `use ${optionValues.join(', ')} for ${printEntityList(list, excluded)}`;
}
