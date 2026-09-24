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

import { type ITokenConfig, Lexer, type TokenType, createToken as createChevrotainToken } from 'chevrotain';

import type { JDLDefinitions } from '../../types/parsing.ts';

import { namePattern as defaultNamePattern } from './shared-tokens.ts';
import createTokenFromConfigCreator from './token-creator.ts';

export type JDLTokens = {
  /** The structural tokens the parser refers to by name. */
  tokens: Record<string, TokenType>;
  /** The ordered vocabulary, shared by every kind of JDL block. */
  vocabulary: TokenType[];
};

/**
 * Only JDL syntax has dedicated tokens. Option names and values are identifiers;
 * definitions validate their meaning after parsing, so blueprints need no lexer changes.
 */
export const buildTokens = ({
  namePattern = defaultNamePattern,
  validations = {},
}: Pick<JDLDefinitions, 'namePattern' | 'validations'> = {}): JDLTokens => {
  const NAME = createChevrotainToken({ name: 'NAME', pattern: namePattern });
  const KEYWORD = createChevrotainToken({ name: 'KEYWORD', pattern: Lexer.NA, categories: [NAME] });
  const tokens: Record<string, TokenType> = {};
  const createToken = (config: ITokenConfig) => {
    const token = createTokenFromConfigCreator(config, KEYWORD);
    tokens[config.name] = token;
    return token;
  };

  const BOOLEAN = createToken({ name: 'BOOLEAN', pattern: Lexer.NA });
  createToken({ name: 'WHITESPACE', pattern: /[\n\t\r \u2028\u2029]+/, group: Lexer.SKIPPED });
  createToken({ name: 'JAVADOC', pattern: /\/\*\*([\s\S]*?)\*\// });
  createToken({ name: 'BLOCK_COMMENT', pattern: /\/\*([\s\S]*?)\*\//, group: Lexer.SKIPPED });
  createToken({ name: 'LINE_COMMENT', pattern: /\/\/[^\n\r]*/, group: Lexer.SKIPPED });
  createToken({
    name: 'DIRECTIVE',
    pattern: (text, offset) =>
      offset === 0 || text[offset - 1] === '\n' || text[offset - 1] === '\r' ? /^#[^\n\r]*/.exec(text.slice(offset)) : null,
    start_chars_hint: ['#'],
    line_breaks: false,
    group: Lexer.SKIPPED,
  });

  for (const keyword of [
    'config',
    'entities',
    'application',
    'deployment',
    'entity',
    'enum',
    'relationship',
    'with',
    'except',
    'use',
    'for',
    'to',
  ]) {
    createToken({ name: keyword.toUpperCase(), pattern: keyword });
  }
  createToken({ name: 'TRUE', pattern: 'true', categories: [BOOLEAN] });
  createToken({ name: 'FALSE', pattern: 'false', categories: [BOOLEAN] });

  const validationCategories = {
    flag: createToken({ name: 'FLAG_VALIDATION', pattern: Lexer.NA }),
    number: createToken({ name: 'NUMBER_VALIDATION', pattern: Lexer.NA }),
    pattern: createToken({ name: 'PATTERN_VALIDATION', pattern: Lexer.NA }),
  };
  for (const [name, definition] of Object.entries(validations)) {
    createToken({ name: `VALIDATION_${name}`, pattern: name, categories: [validationCategories[definition.type]] });
  }

  createToken({ name: 'REGEX', pattern: /\/[^\n\r]*\// });
  createToken({ name: 'DECIMAL', pattern: /-?\d+\.\d+/ });
  createToken({ name: 'INTEGER', pattern: /-?\d+/ });
  // Keep the literal contents: an escaped quote does not close a string.
  createToken({ name: 'STRING', pattern: /"(?:[^"\\]|\\"|\\)*"/ });
  for (const [name, pattern] of Object.entries({
    STAR: '*',
    LPAREN: '(',
    RPAREN: ')',
    LCURLY: '{',
    RCURLY: '}',
    LSQUARE: '[',
    RSQUARE: ']',
    COMMA: ',',
    EQUALS: '=',
    DOT: '.',
    AT: '@',
  })) {
    createToken({ name, pattern });
  }
  // Identifiers follow keywords so that their categories can still accept structural words.
  tokens.NAME = NAME;
  return { tokens, vocabulary: Object.values(tokens) };
};

export const allTokens = ({ vocabulary }: JDLTokens): TokenType[] => vocabulary;

// Fail initialization rather than silently falling back to an unoptimized lexer.
export const createJDLLexer = ({ vocabulary }: JDLTokens) => new Lexer(vocabulary, { ensureOptimizations: true });
