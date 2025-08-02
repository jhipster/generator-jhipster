/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { uniq } from 'lodash-es';
import type { CstNode, IRecognitionException } from 'chevrotain';
import { EOF } from 'chevrotain';
import type { JDLRuntime } from '../types/runtime.js';
import { buildJDLAstBuilderVisitor } from './jdl-ast-builder-visitor.ts';
import performAdditionalSyntaxChecks from './validator.ts';

type ParseOptions = { startRule?: string };

export function parse(input: string, runtime: JDLRuntime, options?: ParseOptions) {
  const cst = getCst(input, runtime, options);
  const astBuilderVisitor = buildJDLAstBuilderVisitor(runtime);
  return astBuilderVisitor.visit(cst);
}

export function getCst(input: string, runtime: JDLRuntime, options?: ParseOptions): CstNode {
  const lexResult = runtime.lexer.tokenize(input);

  if (lexResult.errors.length > 0) {
    throw Error(lexResult.errors[0].message);
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
  const parserError = errors[0];
  if (parserError.name === 'MismatchedTokenException') {
    throwErrorAboutInvalidToken(parserError);
  }
  const errorMessage = `${parserError.name}: ${parserError.message}`;
  const { token } = parserError;
  const errorMessageLocation = token.tokenType !== EOF ? `\n\tat line: ${token.startLine}, column: ${token.startColumn}` : '';
  throw Error(`${errorMessage}${errorMessageLocation}`);
}

function throwErrorAboutInvalidToken(parserError: IRecognitionException) {
  const { token } = parserError;
  const errorMessageBeginning = `Found an invalid token '${token.image}'`;
  const errorMessageLocation = token.tokenType !== EOF ? `, at line: ${token.startLine} and column: ${token.startColumn}` : '';
  const errorMessageComplement = 'Please make sure your JDL content does not use invalid characters, keywords or options.';
  throw Error(`${parserError.name}: ${errorMessageBeginning}${errorMessageLocation}.\n\t${errorMessageComplement}`);
}

function throwSyntaxError(errors: IRecognitionException[]) {
  throw Error(errors.map(error => `${error.message}\n\tat line: ${error.token.startLine}, column: ${error.token.startColumn}`).join('\n'));
}

// A more complete example can be found here:
// https://github.com/SAP/chevrotain/blob/master/examples/parser/content_assist/official_feature_content_assist.js#L134
export function getSyntacticAutoCompleteSuggestions(input: string, runtime: JDLRuntime, options?: ParseOptions) {
  const lexResult = runtime.lexer.tokenize(input);

  // ".input" is a setter which will reset the parsers' internal state.
  runtime.parser.input = lexResult.tokens;

  const syntacticSuggestions = runtime.parser.computeContentAssist(options?.startRule ?? 'prog', lexResult.tokens);

  // Each suggestion includes additional information such as the "Rule Stack" at suggestion point.
  // This may be handy for advanced implementations, e.g: different logic for suggesting a NAME token in an entity
  // or a field. But it is irrelevant in the scope of the POC.
  return uniq(syntacticSuggestions.map(suggestion => suggestion.nextTokenType));
}
