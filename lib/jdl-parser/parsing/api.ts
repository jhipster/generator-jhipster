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

import { type CstNode, EOF, type IRecognitionException } from 'chevrotain';

import type { JDLRuntime } from '../types/runtime.ts';

import type { JDLDiagnostic, JDLParseResult } from './diagnostics.ts';
import { buildJDLAstBuilderVisitor } from './jdl-ast-builder-visitor.ts';
import { type SourcePosition, type SourceRange, tokenRange } from './locations.ts';
import { validateSemantics } from './semantics.ts';
import performAdditionalSyntaxChecks from './validator.ts';

export type ParseOptions = { startRule?: string; onDiagnostic?: (diagnostic: JDLDiagnostic) => void };

/** Parse user input, retaining recovered nodes and returning all positioned diagnostics. */
export function parse(input: string, runtime: JDLRuntime, options?: ParseOptions): JDLParseResult {
  const lexResult = runtime.lexer.tokenize(input);
  const diagnostics: JDLDiagnostic[] = lexResult.errors.map(error => ({
    ruleId: 'syntax.lexical',
    severity: 'error',
    message: error.message,
    range: rangeAt(input, error.offset, error.offset + error.length),
  }));
  const { parser } = runtime;
  parser.input = lexResult.tokens;
  const cst = (parser as unknown as Record<string, () => CstNode>)[options?.startRule ?? 'prog']();
  for (const error of parser.errors) {
    diagnostics.push({
      ruleId: `syntax.${error.name}`,
      severity: 'error',
      message: parserErrorMessage(error),
      range:
        error.token.tokenType === EOF || !Number.isFinite(error.token.startOffset) ?
          rangeAt(input, input.length, input.length)
        : tokenRange(error.token),
    });
  }
  const ast = cst ? buildJDLAstBuilderVisitor(runtime, { locations: true }).visit(cst) : undefined;
  if (ast && (!options?.startRule || options.startRule === 'prog')) {
    diagnostics.push(...validateSemantics(ast, runtime, rangeAt(input, input.length, input.length)));
  }
  diagnostics.sort((a, b) => a.range.start.offset - b.range.start.offset || a.range.end.offset - b.range.end.offset);
  diagnostics.forEach(diagnostic => options?.onDiagnostic?.(diagnostic));
  return { ast, diagnostics };
}

/** Generator compatibility wrapper: syntax errors keep their historical wording and the AST stays unadorned. */
export function parseOrThrow(input: string, runtime: JDLRuntime, options?: ParseOptions) {
  const cst = getCst(input, runtime, options);
  if (!options?.startRule || options.startRule === 'prog') {
    const ast = buildJDLAstBuilderVisitor(runtime, { locations: true }).visit(cst);
    const diagnostics = validateSemantics(ast, runtime, rangeAt(input, input.length, input.length));
    diagnostics.sort((a, b) => a.range.start.offset - b.range.start.offset || a.range.end.offset - b.range.end.offset);
    diagnostics.forEach(diagnostic => options?.onDiagnostic?.(diagnostic));
    const errors = diagnostics.filter(diagnostic => diagnostic.severity === 'error');
    if (errors.length) {
      throw new Error(
        errors.map(error => `${error.message}\n\tat line: ${error.range.start.line}, column: ${error.range.start.column}`).join('\n'),
      );
    }
  }
  const astBuilderVisitor = buildJDLAstBuilderVisitor(runtime);
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

function throwParserError(errors: IRecognitionException[]) {
  throw new Error(parserErrorMessage(errors[0]));
}

function parserErrorMessage(parserError: IRecognitionException): string {
  if (parserError.name === 'MismatchedTokenException') {
    return invalidTokenMessage(parserError);
  }
  const errorMessage = `${parserError.name}: ${parserError.message}`;
  const { token } = parserError;
  const errorMessageLocation = token.tokenType === EOF ? '' : `\n\tat line: ${token.startLine}, column: ${token.startColumn}`;
  return `${errorMessage}${errorMessageLocation}`;
}

function invalidTokenMessage(parserError: IRecognitionException) {
  const { token } = parserError;
  const errorMessageBeginning = `Found an invalid token '${token.image}'`;
  const errorMessageLocation = token.tokenType === EOF ? '' : `, at line: ${token.startLine} and column: ${token.startColumn}`;
  const errorMessageComplement = 'Please make sure your JDL content does not use invalid characters, keywords or options.';
  return `${parserError.name}: ${errorMessageBeginning}${errorMessageLocation}.\n\t${errorMessageComplement}`;
}

function rangeAt(input: string, start: number, end: number): SourceRange {
  const position = (offset: number): SourcePosition => {
    const prefix = input.slice(0, offset);
    const lines = prefix.split(/\r\n|\r|\n/);
    return { offset, line: lines.length, column: lines[lines.length - 1].length + 1 };
  };
  return { start: position(start), end: position(end) };
}

function throwSyntaxError(errors: IRecognitionException[]) {
  throw new Error(
    errors.map(error => `${error.message}\n\tat line: ${error.token.startLine}, column: ${error.token.startColumn}`).join('\n'),
  );
}
