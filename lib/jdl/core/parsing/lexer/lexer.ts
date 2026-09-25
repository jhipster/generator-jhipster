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

import { type ITokenConfig, Lexer, type TokenType } from 'chevrotain';

import RelationshipTypeTokens from './relationship-type-tokens.ts';
import { IDENTIFIER, NAME } from './shared-tokens.ts';
import createTokenFromConfigCreator from './token-creator.ts';
import ValidationTokens from './validation-tokens.ts';

export type JDLTokens = {
  /** The tokens the parser refers to by name. */
  tokens: Record<string, TokenType>;
  /** The tokens in lexing order. */
  list: TokenType[];
};

/**
 * The tokens of the jdl: its structure only. The lexer knows no option: the config and deployment keys, the entity and
 * relationship option keywords are names, checked against the definitions once parsed.
 */
export const buildTokens = (): JDLTokens => {
  const _tokens: Record<string, TokenType> = {};

  function createTokenFromConfig(config: ITokenConfig) {
    const newToken = createTokenFromConfigCreator(config);
    _tokens[config.name] = newToken;
    return newToken;
  }

  // Some categories to make the grammar easier to read
  const BOOLEAN = createTokenFromConfig({
    name: 'BOOLEAN',
    pattern: Lexer.NA,
  });

  createTokenFromConfig({
    name: 'WHITESPACE',
    pattern: /[\n\t\r \u2028\u2029]+/,
    // Whitespace insensitivity for the win.
    group: Lexer.SKIPPED,
  });

  // Comments
  createTokenFromConfig({
    name: 'JAVADOC',
    pattern: /\/\*\*([\s\S]*?)\*\//,
  });

  // Comments
  createTokenFromConfig({
    name: 'BLOCK_COMMENT',
    pattern: /\/\*([\s\S]*?)\*\//,
    group: Lexer.SKIPPED,
  });

  // Constants
  // Application constants
  createTokenFromConfig({ name: 'CONFIG', pattern: 'config' });
  createTokenFromConfig({ name: 'ENTITIES', pattern: 'entities' });

  createTokenFromConfig({ name: 'APPLICATION', pattern: 'application' });
  createTokenFromConfig({ name: 'DEPLOYMENT', pattern: 'deployment' });

  // boolean value constants
  createTokenFromConfig({ name: 'TRUE', pattern: 'true', categories: [BOOLEAN] });
  createTokenFromConfig({ name: 'FALSE', pattern: 'false', categories: [BOOLEAN] });
  // Entity constants
  createTokenFromConfig({ name: 'ENTITY', pattern: 'entity' });
  createTokenFromConfig({ name: 'ENUM', pattern: 'enum' });
  // Relationship-related
  createTokenFromConfig({ name: 'RELATIONSHIP', pattern: 'relationship' });

  // Category For the relationship type key names
  RelationshipTypeTokens.tokens.forEach(token => {
    _tokens[token.name] = token;
  });

  createTokenFromConfig({ name: 'STAR', pattern: '*' });

  // Option statements
  createTokenFromConfig({ name: 'WITH', pattern: 'with' });
  createTokenFromConfig({ name: 'EXCEPT', pattern: 'except' });
  createTokenFromConfig({ name: 'USE', pattern: 'use' });
  createTokenFromConfig({ name: 'FOR', pattern: 'for' });

  // validations
  ValidationTokens.tokens.forEach(token => {
    _tokens[token.name] = token;
  });

  createTokenFromConfig({ name: 'REGEX', pattern: /\/[^\n\r]*\// });
  createTokenFromConfig({ name: 'DECIMAL', pattern: /-?\d+\.\d+/ });
  createTokenFromConfig({ name: 'INTEGER', pattern: /-?\d+/ });
  // A backslash is a literal character, except that `\"` does not close the literal, e.g. "java(\"a\")".
  // The content is kept as written.
  createTokenFromConfig({ name: 'STRING', pattern: /"(?:[^"\\]|\\"|\\)*"/ });

  // punctuation
  createTokenFromConfig({ name: 'LPAREN', pattern: '(' });
  createTokenFromConfig({ name: 'RPAREN', pattern: ')' });
  createTokenFromConfig({ name: 'LCURLY', pattern: '{' });
  createTokenFromConfig({ name: 'RCURLY', pattern: '}' });
  createTokenFromConfig({ name: 'LSQUARE', pattern: '[' });
  createTokenFromConfig({ name: 'RSQUARE', pattern: ']' });
  createTokenFromConfig({ name: 'COMMA', pattern: ',' });
  createTokenFromConfig({ name: 'EQUALS', pattern: '=' });
  createTokenFromConfig({ name: 'DOT', pattern: '.' });

  createTokenFromConfig({ name: 'TO', pattern: 'to' });

  // annotations
  createTokenFromConfig({ name: 'AT', pattern: '@' });

  // Imperative the "IDENTIFIER" token will be added after all the keywords to resolve keywords vs identifier conflict.
  _tokens.NAME = NAME;
  _tokens.IDENTIFIER = IDENTIFIER;

  return { tokens: _tokens, list: Object.values(_tokens) };
};

/** Every token of the lexer. */
export const allTokens = ({ list }: JDLTokens): TokenType[] => list;

// with 'ensureOptimizations' the lexer initialization will throw a descriptive error
// instead of silently reverting to an unoptimized algorithm.
// This will avoid performance regressions.
export const createJDLLexer = ({ list }: JDLTokens) => new Lexer(list, { ensureOptimizations: true });
