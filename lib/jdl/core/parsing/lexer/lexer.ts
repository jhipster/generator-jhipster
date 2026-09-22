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

import { type IMultiModeLexerDefinition, type ITokenConfig, Lexer, type TokenType } from 'chevrotain';
import { uniq } from 'lodash-es';

import { relationshipOptions } from '../../built-in-options/index.ts';

import OptionTokens from './option-tokens.ts';
import RelationshipTypeTokens from './relationship-type-tokens.ts';
import { BINARY_OPTION, NAME, UNARY_OPTION } from './shared-tokens.ts';
import createTokenFromConfigCreator from './token-creator.ts';
import ValidationTokens from './validation-tokens.ts';

type TokenParam = { categoryToken: TokenType; tokens: TokenType[] };

export type JDLTokens = {
  /** The tokens the parser refers to by name. */
  tokens: Record<string, TokenType>;
  /** The lexer modes: the application config and the deployment blocks lex their own keys. */
  modes: IMultiModeLexerDefinition;
};

/** The lexer modes: the default one, the one inside `config { }` and the one inside `deployment { }`. */
export const LexerModes = {
  DEFAULT: 'default',
  APPLICATION_CONFIG: 'application_config',
  DEPLOYMENT: 'deployment',
} as const;
const { DEFAULT: DEFAULT_MODE, APPLICATION_CONFIG: APPLICATION_CONFIG_MODE, DEPLOYMENT: DEPLOYMENT_MODE } = LexerModes;

/**
 * The application config keys and the deployment keys are lexed in modes of their own, entered at `config` and
 * `deployment` and left at the `}` closing the block, so that the two grammars are independent: a keyword of both is
 * a token of each, and neither needs to know what the other declares.
 */
export const buildTokens = (tokens: { applicationTokens: TokenParam; deploymentTokens: TokenParam }): JDLTokens => {
  const { applicationTokens, deploymentTokens } = tokens;
  const _tokens: Record<string, TokenType> = {};

  const { BUILT_IN_ENTITY } = relationshipOptions;

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

  const WHITESPACE = createTokenFromConfig({
    name: 'WHITESPACE',
    pattern: /[\n\t\r \u2028\u2029]+/,
    // Whitespace insensitivity for the win.
    group: Lexer.SKIPPED,
  });

  // Comments
  const JAVADOC = createTokenFromConfig({
    name: 'JAVADOC',
    pattern: /\/\*\*([\s\S]*?)\*\//,
  });

  // Comments
  const BLOCK_COMMENT = createTokenFromConfig({
    name: 'BLOCK_COMMENT',
    pattern: /\/\*([\s\S]*?)\*\//,
    group: Lexer.SKIPPED,
  });

  // Constants
  // Application constants
  createTokenFromConfig({ name: 'CONFIG', pattern: 'config', push_mode: APPLICATION_CONFIG_MODE });
  createTokenFromConfig({ name: 'ENTITIES', pattern: 'entities' });

  // application must appear AFTER "applicationType" due to shorter common prefix.
  createTokenFromConfig({ name: 'APPLICATION', pattern: 'application' });
  createTokenFromConfig({ name: 'DEPLOYMENT', pattern: 'deployment', push_mode: DEPLOYMENT_MODE });

  // boolean value constants
  const TRUE = createTokenFromConfig({ name: 'TRUE', pattern: 'true', categories: [BOOLEAN] });
  const FALSE = createTokenFromConfig({ name: 'FALSE', pattern: 'false', categories: [BOOLEAN] });
  // Entity constants
  createTokenFromConfig({ name: 'ENTITY', pattern: 'entity' });
  createTokenFromConfig({ name: 'ENUM', pattern: 'enum' });
  // Relationship-related
  createTokenFromConfig({ name: 'RELATIONSHIP', pattern: 'relationship' });
  createTokenFromConfig({ name: 'BUILT_IN_ENTITY', pattern: BUILT_IN_ENTITY });

  // Category For the relationship type key names
  RelationshipTypeTokens.tokens.forEach(token => {
    _tokens[token.name] = token;
  });

  createTokenFromConfig({ name: 'STAR', pattern: '*' });

  // Options
  OptionTokens.tokens.forEach(token => {
    _tokens[token.name] = token;
  });

  // validations
  ValidationTokens.tokens.forEach(token => {
    _tokens[token.name] = token;
  });

  createTokenFromConfig({ name: 'REGEX', pattern: /\/[^\n\r]*\// });
  const DECIMAL = createTokenFromConfig({ name: 'DECIMAL', pattern: /-?\d+\.\d+/ });
  const INTEGER = createTokenFromConfig({ name: 'INTEGER', pattern: /-?\d+/ });
  // A backslash is a literal character, except that `\"` does not close the literal, e.g. "java(\"a\")".
  // The content is kept as written.
  const STRING = createTokenFromConfig({ name: 'STRING', pattern: /"(?:[^"\\]|\\"|\\)*"/ });

  // punctuation
  const LPAREN = createTokenFromConfig({ name: 'LPAREN', pattern: '(' });
  const RPAREN = createTokenFromConfig({ name: 'RPAREN', pattern: ')' });
  const LCURLY = createTokenFromConfig({ name: 'LCURLY', pattern: '{' });
  const RCURLY = createTokenFromConfig({ name: 'RCURLY', pattern: '}' });
  const LSQUARE = createTokenFromConfig({ name: 'LSQUARE', pattern: '[' });
  const RSQUARE = createTokenFromConfig({ name: 'RSQUARE', pattern: ']' });
  const COMMA = createTokenFromConfig({ name: 'COMMA', pattern: ',' });
  const COMMA_WITHOUT_NEWLINE = createTokenFromConfig({ name: 'COMMA_WITHOUT_NEWLINE', pattern: /,[^\n\r]/ });
  createTokenFromConfig({ name: 'EQUALS', pattern: '=' });
  const DOT = createTokenFromConfig({ name: 'DOT', pattern: '.' });

  createTokenFromConfig({ name: 'TO', pattern: 'to' });

  // annotations
  createTokenFromConfig({ name: 'AT', pattern: '@' });

  // The `}` closing a config or a deployment block leaves its mode; the parser consumes it as a RCURLY.
  const BLOCK_RCURLY = createTokenFromConfigCreator({ name: 'BLOCK_RCURLY', pattern: '}', pop_mode: true, categories: [RCURLY] });

  const typedTokens = {
    UNARY_OPTION,
    BINARY_OPTION,
    // Imperative the "NAME" token will be added after all the keywords to resolve keywords vs identifier conflict.
    NAME,
  };
  // The categories the parser consumes the keys of a block by; the keys themselves are tokens of their mode.
  const categoryTokens = { CONFIG_KEY: applicationTokens.categoryToken, DEPLOYMENT_KEY: deploymentTokens.categoryToken };

  // What a config or a deployment block holds besides its keys: the values, and the punctuation around them.
  const blockTokens = [
    WHITESPACE,
    JAVADOC,
    BLOCK_COMMENT,
    BOOLEAN,
    TRUE,
    FALSE,
    DECIMAL,
    INTEGER,
    STRING,
    LPAREN,
    RPAREN,
    LCURLY,
    BLOCK_RCURLY,
    LSQUARE,
    RSQUARE,
    COMMA,
    COMMA_WITHOUT_NEWLINE,
    DOT,
    NAME,
  ];

  return {
    tokens: { ..._tokens, ...typedTokens, ...categoryTokens },
    modes: {
      defaultMode: DEFAULT_MODE,
      modes: {
        [DEFAULT_MODE]: uniq([...Object.values(_tokens), ...Object.values(typedTokens)]),
        [APPLICATION_CONFIG_MODE]: [...applicationTokens.tokens, ...blockTokens],
        [DEPLOYMENT_MODE]: [...deploymentTokens.tokens, ...blockTokens],
      },
    },
  };
};

/** Every token of the lexer, whatever the mode. */
export const allTokens = ({ modes }: JDLTokens): TokenType[] => uniq(Object.values(modes.modes).flat());

// with 'ensureOptimizations' the lexer initialization will throw a descriptive error
// instead of silently reverting to an unoptimized algorithm.
// This will avoid performance regressions.
export const createJDLLexer = ({ modes }: JDLTokens) => new Lexer(modes, { ensureOptimizations: true });
