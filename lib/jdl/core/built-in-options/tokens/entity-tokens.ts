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

import { Lexer, type TokenType } from 'chevrotain';
import { snakeCase } from 'lodash-es';

import { BINARY_OPTION, UNARY_OPTION } from '../../parsing/lexer/shared-tokens.ts';
import createTokenFromConfig from '../../parsing/lexer/token-creator.ts';
import type { JDLOptionsDefinition } from '../../types/parsing.ts';

export const relationshipOptionCategoryToken = createTokenFromConfig({ name: 'RELATIONSHIP_OPTION', pattern: Lexer.NA });

const tokenName = (keyword: string) => snakeCase(keyword).toUpperCase();

/** The keywords of an option statement: the option name by default, and the deprecated ones. */
export const optionKeywords = (name: string, { jdl }: { jdl: { keyword?: string; deprecatedKeywords?: readonly string[] } }): string[] => [
  jdl.keyword ?? name,
  ...(jdl.deprecatedKeywords ?? []),
];

/**
 * The option keywords of the entity and relationship statements from their JDL definitions: a token per keyword, in
 * the category the parser consumes it by.
 */
export const buildEntityTokens = (
  entityDefinition: JDLOptionsDefinition,
  relationshipDefinition: JDLOptionsDefinition,
): { categoryToken: TokenType; tokens: TokenType[] } => {
  const tokens: TokenType[] = [];
  for (const [name, config] of Object.entries(entityDefinition.configs)) {
    const category = config.jdl.type === 'unary' ? UNARY_OPTION : BINARY_OPTION;
    for (const keyword of optionKeywords(name, config)) {
      tokens.push(createTokenFromConfig({ name: tokenName(keyword), pattern: keyword, categories: [category] }));
    }
  }
  for (const [name, config] of Object.entries(relationshipDefinition.configs)) {
    for (const keyword of optionKeywords(name, config)) {
      tokens.push(createTokenFromConfig({ name: tokenName(keyword), pattern: keyword, categories: [relationshipOptionCategoryToken] }));
    }
  }
  return { categoryToken: relationshipOptionCategoryToken, tokens };
};
