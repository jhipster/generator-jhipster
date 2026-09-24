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

import { buildJDLAstBuilderVisitor } from './jdl-ast-builder-visitor.ts';
import type { JDLRuntime } from './types/runtime.ts';
import performAdditionalSyntaxChecks from './validator.ts';

type ParseOptions = {
  startRule?: string;
  /** Receives the warnings about what the jdl uses, a deprecated option for instance; `console.warn` by default. */
  onWarning?: (message: string) => void;
};

export function parse(input: string, runtime: JDLRuntime, options?: ParseOptions) {
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

function throwParserError(errors: IRecognitionException[]) {
  const parserError = errors[0];
  if (parserError.name === 'MismatchedTokenException') {
    throwErrorAboutInvalidToken(parserError);
  }
  const expectedStatements = EXPECTED_STATEMENTS[parserError.context.ruleStack.at(-1)!];
  // A statement starting with a name that is no keyword: a misspelled keyword, or an option statement opening a block.
  if (parserError.name === 'NoViableAltException' && expectedStatements && parserError.token.tokenType.name === 'IDENTIFIER') {
    const { token } = parserError;
    throw new Error(
      `Unknown statement '${token.image}', expected ${expectedStatements}.\n\tat line: ${token.startLine}, column: ${token.startColumn}`,
    );
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
