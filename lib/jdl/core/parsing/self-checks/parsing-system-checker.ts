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

import type { Rule, TokenType } from 'chevrotain';

import TokenCollectorVisitor from './token-collector-visitor.ts';

export function checkTokens(allDefinedTokens: TokenType[], rules: Rule[]) {
  const usedTokens = getUsedTokens(rules);
  const unusedTokens = getUselessTokens(usedTokens, allDefinedTokens);
  if (unusedTokens.length !== 0) {
    const unusedTokenTypeNames = unusedTokens.map(tokenType => tokenType.name);
    throw Error(`Unused token definitions found: [ ${unusedTokenTypeNames.join(', ')} ]`);
  }
}

function getUsedTokens(rules: Rule[]): TokenType[] {
  return rules.reduce((result, currentRule) => {
    const collector = new TokenCollectorVisitor();
    currentRule.accept(collector);
    return [...new Set(result.concat(collector.actualTokens))];
  }, [] as TokenType[]);
}

function getUselessTokens(usedTokens: TokenType[], allDefinedTokens: TokenType[]) {
  // A token a rule consumes is matched by the tokens it is a category of too.
  const usedCategories = new Set([...usedTokens, ...usedTokens.flatMap(token => token.CATEGORIES ?? [])]);
  const directlyUsedTokens = new Set(usedTokens);
  const notDirectlyUsedTokens = allDefinedTokens.filter(token => !directlyUsedTokens.has(token));
  const redundant = notDirectlyUsedTokens.filter(token => !token.CATEGORIES?.some(category => usedCategories.has(category)));
  // A skipped or grouped token never reaches the parser.
  return redundant.filter(tokenType => tokenType.GROUP === undefined);
}
