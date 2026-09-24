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

import { type CstNode, EOF, type ILexingError, type IRecognitionException, type IToken } from 'chevrotain';

import { buildJDLAstBuilderVisitor } from './jdl-ast-builder-visitor.ts';
import performJDLPostParsingTasks from './jdl-post-parsing-tasks.ts';
import { tokenLocation } from './location.ts';
import { checkSemantics } from './semantic/index.ts';
import type { JDLDiagnostic } from './semantic/types.ts';
import type { JDLLocation, ParsedJDLApplications } from './types/parsed.ts';
import type { JDLRuntime } from './types/runtime.ts';
import performAdditionalSyntaxChecks from './validator.ts';

type ParseOptions = {
  startRule?: string;
  /** Receives the warnings about what the jdl uses, a deprecated option for instance; `console.warn` by default. */
  onWarning?: (message: string) => void;
};

export type { JDLDiagnostic } from './semantic/types.ts';
export type { JDLLocation } from './types/parsed.ts';

export type JDLParseResult = {
  /**
   * The parsed jdl, whenever it lexes, even with parsing, syntax or semantic errors: after a parsing error it is what could
   * be parsed, when that is enough to build it.
   */
  ast?: ParsedJDLApplications;
  /** Every problem found, errors and warnings, in source order. */
  diagnostics: JDLDiagnostic[];
};

/** The location of a token, none for one inserted by recovery or the end of the input. */
const locationOfToken = (token: IToken): JDLLocation | undefined =>
  Number.isNaN(token.startOffset) || token.tokenType === EOF ? undefined : tokenLocation(token);

const lexingDiagnostic = (error: ILexingError): JDLDiagnostic => ({
  ruleId: 'lexing',
  severity: 'error',
  message: error.message,
  location: {
    startOffset: error.offset,
    endOffset: error.offset + error.length - 1,
    startLine: error.line!,
    startColumn: error.column!,
    endLine: error.line!,
    endColumn: error.column! + error.length - 1,
  },
});

const parsingDiagnostic = (error: IRecognitionException): JDLDiagnostic => ({
  ruleId: 'parsing',
  severity: 'error',
  message: unknownStatementMessage(error) ?? error.message,
  location: locationOfToken(error.token),
});

/**
 * Parses a jdl without throwing: every problem is a diagnostic with its location, the lexing and parsing errors, the syntax
 * errors, the semantic ones and the warnings. The parser recovers from an error and reports every one; a jdl with parsing
 * errors is not checked further, the checks would report their consequences. A jdl that does not lex has no AST.
 */
export function parseJDL(input: string, runtime: JDLRuntime, options?: Pick<ParseOptions, 'startRule'>): JDLParseResult {
  const lexResult = runtime.lexer.tokenize(input);
  if (lexResult.errors.length > 0) {
    return { diagnostics: lexResult.errors.map(lexingDiagnostic) };
  }
  const { recoveringParser } = runtime;
  recoveringParser.input = lexResult.tokens;
  const startRule = options?.startRule ?? 'prog';
  const cst = (recoveringParser as unknown as Record<string, () => CstNode>)[startRule]();
  if (recoveringParser.errors.length > 0) {
    // The CST has what could be parsed; the checks would report the consequences of the errors, only the errors are.
    return { ast: buildRecoveredAst(cst, runtime), diagnostics: recoveringParser.errors.map(parsingDiagnostic) };
  }
  const diagnostics: JDLDiagnostic[] = performAdditionalSyntaxChecks(cst, runtime).map(error => ({
    ruleId: 'syntax',
    severity: 'error',
    message: error.message,
    location: locationOfToken(error.token),
  }));
  const ast: ParsedJDLApplications = buildJDLAstBuilderVisitor(runtime, (message, location) =>
    diagnostics.push({ ruleId: 'deprecated', severity: 'warning', message, location }),
  ).visit(cst);
  // The semantic rules are about a whole jdl.
  if (startRule === 'prog') {
    diagnostics.push(...checkSemantics(performJDLPostParsingTasks(ast), runtime));
  }
  diagnostics.sort((a, b) => (a.location?.startOffset ?? Infinity) - (b.location?.startOffset ?? Infinity));
  return { ast, diagnostics };
}

/** The AST of what could be parsed, none when the CST misses what the AST builder needs. */
function buildRecoveredAst(cst: CstNode, runtime: JDLRuntime): ParsedJDLApplications | undefined {
  try {
    return buildJDLAstBuilderVisitor(runtime, () => {}).visit(cst);
  } catch {
    return undefined;
  }
}

export function parse(input: string, runtime: JDLRuntime, options?: ParseOptions): ParsedJDLApplications {
  const cst = getCst(input, runtime, options);
  // The parser has no logger of its own: a caller that passes none still sees the warnings.
  // eslint-disable-next-line no-console
  const astBuilderVisitor = buildJDLAstBuilderVisitor(runtime, options?.onWarning ?? (message => console.warn(message)));
  return astBuilderVisitor.visit(cst);
}

export function getCst(input: string, runtime: JDLRuntime, options?: ParseOptions): CstNode {
  const lexResult = runtime.lexer.tokenize(input);

  if (lexResult.errors.length > 0) {
    throw new Error(lexResult.errors[0].message);
  }

  runtime.parser.input = lexResult.tokens;

  const cst = (runtime.parser as unknown as Record<string, () => CstNode>)[options?.startRule ?? 'prog']();

  if (runtime.parser.errors.length > 0) {
    throwParserError(runtime.parser.errors);
  }

  const extraSyntaxErrors = performAdditionalSyntaxChecks(cst, runtime);

  if (extraSyntaxErrors.length > 0) {
    throwSyntaxError(extraSyntaxErrors);
  }

  return cst;
}

/** What a statement may be, by the rule it is parsed in: the list chevrotain expects is a wall of token sequences. */
const EXPECTED_STATEMENTS: Record<string, string> = {
  prog: 'an entity, an enum, a relationship, an application, a deployment, a use statement, a constant or an option statement',
  applicationSubDeclaration: 'a config block, an entities statement, a use statement or an option statement',
};

/** A statement starting with a name that is no keyword: a misspelled keyword, or an option statement opening a block. */
function unknownStatementMessage(parserError: IRecognitionException): string | undefined {
  const expectedStatements = EXPECTED_STATEMENTS[parserError.context.ruleStack.at(-1)!];
  if (parserError.name === 'NoViableAltException' && expectedStatements && parserError.token.tokenType.name === 'IDENTIFIER') {
    return `Unknown statement '${parserError.token.image}', expected ${expectedStatements}.`;
  }
  return undefined;
}

function throwParserError(errors: IRecognitionException[]) {
  const parserError = errors[0];
  if (parserError.name === 'MismatchedTokenException') {
    throwErrorAboutInvalidToken(parserError);
  }
  const unknownStatement = unknownStatementMessage(parserError);
  if (unknownStatement) {
    const { token } = parserError;
    throw new Error(`${unknownStatement}\n\tat line: ${token.startLine}, column: ${token.startColumn}`);
  }
  const errorMessage = `${parserError.name}: ${parserError.message}`;
  const { token } = parserError;
  const errorMessageLocation = token.tokenType === EOF ? '' : `\n\tat line: ${token.startLine}, column: ${token.startColumn}`;
  throw new Error(`${errorMessage}${errorMessageLocation}`);
}

function throwErrorAboutInvalidToken(parserError: IRecognitionException) {
  const { token } = parserError;
  const errorMessageBeginning = `Found an invalid token '${token.image}'`;
  const errorMessageLocation = token.tokenType === EOF ? '' : `, at line: ${token.startLine} and column: ${token.startColumn}`;
  const errorMessageComplement = 'Please make sure your JDL content does not use invalid characters, keywords or options.';
  throw new Error(`${parserError.name}: ${errorMessageBeginning}${errorMessageLocation}.\n\t${errorMessageComplement}`);
}

function throwSyntaxError(errors: IRecognitionException[]) {
  throw new Error(
    errors.map(error => `${error.message}\n\tat line: ${error.token.startLine}, column: ${error.token.startColumn}`).join('\n'),
  );
}
