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
  JDLLocation,
  ParsedJDLAnnotation,
  ParsedJDLApplicationDeclaration,
  ParsedJDLDeployment,
  ParsedJDLEntity,
  ParsedJDLEntityField,
  ParsedJDLEnum,
  ParsedJDLEnumValue,
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

/** What separates written nodes that may be copied with them: blanks, commas and comments. */
const TRIVIA = /^(?:[\s,]|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*$/;

const locationOf = (node: object): JDLLocation | undefined => (node as { location?: JDLLocation }).location;

/** The nodes printJDL prints on their own inside a statement, and the node it holds. */
function partsOf(node: object): object[] {
  const statement = node as JDLStatement;
  switch (statement.type) {
    case 'entity':
      return [statement.entity, ...(statement.entity.body ?? [])];
    case 'enum':
      return [statement.enum, ...statement.enum.values];
    case 'relationships':
      return statement.relationships;
    case 'application':
      return [statement.application, ...(getStatements<JDLApplicationStatement>(statement.application) ?? [])];
    default:
      return [];
  }
}

/** Whether a node is copied as written: it and the nodes it prints on their own have a location, none is new. */
const isWritten = (node: object): boolean => locationOf(node) !== undefined && partsOf(node).every(part => locationOf(part) !== undefined);

/** A printed node without the indentation of its first line, which the copied text before it holds. */
const withoutIndent = (printed: string) => printed.replace(/^[ \t]+/, '');

/** The source a jdl is printed from: a node that has a location there is copied as written. */
type SourceText = {
  /** The text of a node as written; undefined for a node without location, a new or changed one. */
  of: (node: object) => string | undefined;
  /** The text between two nodes, when they followed each other as written. */
  between: (previous: object, next: object) => string | undefined;
  /** The comment ending the line of a node, as written. */
  sameLine: (node: object) => string;
  /** The comment lines just above a node and its indentation, as written. */
  above: (node: object) => string;
  /** The text before a node, when only blanks and comments. */
  before: (node: object) => string | undefined;
  /** The text after a node, when only blanks and comments. */
  after: (node: object) => string | undefined;
  /** A part of the source. */
  slice: (start: number, end: number) => string | undefined;
};

function sourceText(source?: string): SourceText {
  const of = (node: object) => {
    const location = locationOf(node);
    return source === undefined || !location || !isWritten(node) ? undefined : source.slice(location.startOffset, location.endOffset + 1);
  };
  const trivia = (text: string) => (TRIVIA.test(text) ? text : undefined);
  return {
    of,
    slice: (start, end) => (source === undefined ? undefined : source.slice(start, end)),
    between: (previous, next) => {
      const [from, to] = [locationOf(previous), locationOf(next)];
      if (source === undefined || !from || !to || from.endOffset >= to.startOffset) return undefined;
      return trivia(source.slice(from.endOffset + 1, to.startOffset));
    },
    sameLine: node => {
      const location = locationOf(node);
      if (source === undefined || !location) return '';
      const end = source.indexOf('\n', location.endOffset + 1);
      const rest = source.slice(location.endOffset + 1, end === -1 ? undefined : end);
      return /^[ \t]*(?:\/\/.*|\/\*.*?\*\/[ \t]*)?$/.test(rest) ? rest.trimEnd() : '';
    },
    above: node => {
      const location = locationOf(node);
      if (source === undefined || !location) return '';
      let start = source.lastIndexOf('\n', location.startOffset - 1) + 1;
      if (source.slice(start, location.startOffset).trim() !== '') return '';
      // The comment lines right above, up to a blank line or code.
      while (start > 0) {
        const lineStart = source.lastIndexOf('\n', start - 2) + 1;
        if (
          !source
            .slice(lineStart, start - 1)
            .trim()
            .startsWith('//')
        )
          break;
        start = lineStart;
      }
      return source.slice(start, location.startOffset);
    },
    before: node => {
      const location = locationOf(node);
      return source === undefined || !location ? undefined : trivia(source.slice(0, location.startOffset));
    },
    after: node => {
      const location = locationOf(node);
      return source === undefined || !location ? undefined : trivia(source.slice(location.endOffset + 1));
    },
  };
}

/**
 * Prints nodes one after the other. A node written in the source is copied, with the text that separated it from the
 * previous one when they followed each other, or else the comment lines above it; any other node is printed, the
 * separator given by the caller. The comment ending the line of a copied node goes with it.
 */
function printSequence<T extends object>(
  nodes: readonly T[],
  print: (node: T) => string,
  text: SourceText,
  { indent = '', separator, aboveFirst = true }: { indent?: string; separator: (previous: T, next: T) => string; aboveFirst?: boolean },
): string {
  return nodes
    .map((node, index) => {
      const previous = nodes[index - 1];
      const written = text.of(node);
      const between = previous ? text.between(previous, node) : undefined;
      if (between !== undefined) return `${between}${written ?? withoutIndent(print(node))}`;
      const start = previous ? `${text.sameLine(previous)}${separator(previous, node)}` : '';
      const above = previous || aboveFirst ? text.above(node) : '';
      if (written !== undefined) return `${start}${above || indent}${written}`;
      return `${start}${above ? `${above}${withoutIndent(print(node))}` : print(node)}`;
    })
    .join('');
}

/** A blank line between two groups of statements. */
const statementSeparator = (previous: { type: string }, next: { type: string }) =>
  statementGroup(previous.type) === statementGroup(next.type) ? '\n' : '\n\n';

/** What printJDL prints from. */
export type PrintJDLOptions = {
  /**
   * The text the statements were parsed from: a node with a location, as the parser gives them, is copied from it as
   * written, comments and blanks included, unless it holds a new node; any other node, a new one, is printed, the text
   * around a node holding a new one being kept.
   */
  source?: string;
};

/**
 * Prints a jdl from its statements, as the parser keeps them (`getStatements(ast)`), in their order: parsing the printed jdl
 * gives the same statements again, without the locations.
 */
export function printJDL(statements: readonly JDLStatement[], runtime: JDLRuntime, options: PrintJDLOptions = {}): string {
  if (statements.length === 0) return '\n';
  const text = sourceText(options.source);
  const [first, last] = [statements[0], statements.at(-1)!];
  // The text before the first statement and after the last one, when they are copied.
  const leading = text.before(first);
  const trailing = text.after(last);
  const printed = printSequence(statements, statement => printStatement(statement, runtime, text), text, {
    separator: statementSeparator,
    aboveFirst: leading === undefined,
  });
  return `${leading ?? ''}${printed}${trailing ?? `${text.sameLine(last)}\n`}`;
}

function printStatement(statement: JDLStatement, runtime: JDLRuntime, text: SourceText): string {
  switch (statement.type) {
    case 'constant':
      return `${statement.name} = ${statement.value}`;
    case 'application':
      return printApplication(statement.application, runtime, text);
    case 'deployment':
      return printDeployment(statement.deployment, runtime);
    case 'entity':
      return printEntity(statement.entity, text);
    case 'enum':
      return printEnum(statement.enum, text);
    case 'relationships': {
      const relationships = printSequence(statement.relationships, relationship => printRelationship(relationship), text, {
        indent: INDENT,
        separator: () => '\n',
      });
      return `relationship ${statement.cardinality} {\n${relationships}\n}`;
    }
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

function printApplication(application: ParsedJDLApplicationDeclaration, runtime: JDLRuntime, text: SourceText): string {
  const statements = getStatements<JDLApplicationStatement>(application) ?? [];
  const printed = printSequence(statements, statement => printApplicationStatement(statement, runtime), text, {
    indent: INDENT,
    separator: statementSeparator,
  });
  return `application {\n${printed}\n}`;
}

function printApplicationStatement(statement: JDLApplicationStatement, runtime: JDLRuntime): string {
  const { applicationDefinition } = runtime;
  switch (statement.type) {
    case 'config':
      return printConfigBlock(
        'config',
        statement.config,
        key =>
          applicationDefinition.shouldTheValueBeQuoted(key) ||
          applicationDefinition.optionTypes[key]?.type === 'quotedList' ||
          runtime.propertyValidations[key]?.type === 'STRING',
      );
    case 'namespaceConfig':
      return printConfigBlock(`config(${statement.namespace})`, statement.config, () => false);
    case 'entities':
      return `${INDENT}entities ${printEntityList(statement.entities.entityList, statement.entities.excluded)}`;
    case 'option':
      return `${INDENT}${printOption(statement.option)}`;
    case 'use':
      return `${INDENT}${printUse(statement.use)}`;
  }
}

function printDeployment(deployment: ParsedJDLDeployment, runtime: JDLRuntime): string {
  const lines = Object.entries(deployment)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${INDENT}${key} ${printConfigValue(value, runtime.deploymentPropertyValidations[key]?.type === 'STRING')}`);
  return `deployment {\n${lines.join('\n')}\n}`;
}

/** The declaration of an entity before its fields: its javadoc, annotations, name and table name. */
function printEntityHeader(entity: ParsedJDLEntity): string {
  const header = `${printComment(entity.documentation)}${printAnnotations(entity.annotations)}entity ${entity.name}`;
  return entity.tableName ? `${header} (${entity.tableName})` : header;
}

function printEntity(entity: ParsedJDLEntity, text: SourceText): string {
  // The header of an entity holding a new field is copied as written.
  const { location, bodyLocation } = entity as { location?: JDLLocation; bodyLocation?: JDLLocation };
  const writtenHeader = location && bodyLocation ? text.slice(location.startOffset, bodyLocation.startOffset)?.trimEnd() : undefined;
  let printed = writtenHeader ?? printEntityHeader(entity);
  if (entity.body?.length) {
    const fields = printSequence(entity.body, field => printField(field), text, { indent: INDENT, separator: () => '\n' });
    printed += ` {\n${fields}\n}`;
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

function printEnum(jdlEnum: ParsedJDLEnum, text: SourceText): string {
  const values = printSequence(jdlEnum.values, value => printEnumValue(value), text, { indent: INDENT, separator: () => ',\n' });
  return `${printComment(jdlEnum.documentation)}enum ${jdlEnum.name} {\n${values}\n}`;
}

function printEnumValue({ key, value, comment }: ParsedJDLEnumValue): string {
  const printedValue = value ? ` (${UNQUOTED_VALUE.test(value) ? value : `"${value}"`})` : '';
  return `${printComment(comment, INDENT)}${INDENT}${key}${printedValue}`;
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
