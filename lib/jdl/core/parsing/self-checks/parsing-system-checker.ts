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

import { difference, flatMap, includes, isEmpty, reject, some, uniq, values } from 'lodash-es';
import { Lexer } from 'chevrotain';
import TokenCollectorVisitor from './token-collector-visitor.js';

export function checkTokens(allDefinedTokens, rules) {
  const usedTokens = getUsedTokens(rules);
  const unusedTokens = getUselessTokens(usedTokens, allDefinedTokens);
  if (unusedTokens.length !== 0) {
    const unusedTokenTypeNames = unusedTokens.map(tokenType => tokenType.name);
    throw Error(`Unused token definitions found: [ ${unusedTokenTypeNames.join(', ')} ]`);
  }
}

function getUsedTokens(rules) {
  return rules.reduce((result, currentRule) => {
    const collector = new TokenCollectorVisitor();
    currentRule.accept(collector);
    return uniq(result.concat(collector.actualTokens));
  }, []);
}

function getUselessTokens(usedTokens: any[], allDefinedTokens: any[]) {
  const usedCategories = uniq(flatMap(usedTokens, 'CATEGORIES'));
  // TODO: Calling uniq with two parameters is probably a bug.

  // @ts-expect-error TODO
  const notDirectlyUsedTokens = difference(allDefinedTokens, uniq(usedTokens, usedCategories));
  const redundant = reject(notDirectlyUsedTokens, token => {
    const tokCategories = token.CATEGORIES;
    return some(tokCategories, category => includes(usedCategories, category));
  });
  return reject(redundant, tokenType => tokenType.GROUP === Lexer.SKIPPED);
}

export function checkConfigKeys(definedTokensMap, usedConfigKeys) {
  checkForUselessConfigurationKeys(definedTokensMap, usedConfigKeys);
  checkForMissingConfigurationKeys(definedTokensMap, usedConfigKeys);
}

function checkForUselessConfigurationKeys(definedTokensMap, usedConfigKeys) {
  const redundantConfigKeys = difference(usedConfigKeys, Object.keys(definedTokensMap));
  if (!isEmpty(redundantConfigKeys)) {
    throw Error(`Useless configuration keys: [ ${redundantConfigKeys.join(', ')} ]`);
  }
}

function checkForMissingConfigurationKeys(definedTokensMap, usedConfigKeys) {
  const definedConfigKeyNames = values(definedTokensMap)
    .filter(tokenType => includes(tokenType.CATEGORIES, definedTokensMap.CONFIG_KEY))
    .map(tokenType => tokenType.name);

  const missingConfigKeys = difference(definedConfigKeyNames, usedConfigKeys);
  if (!isEmpty(missingConfigKeys)) {
    throw Error(`Missing configuration keys: [ ${missingConfigKeys.join(', ')} ]`);
  }
}
