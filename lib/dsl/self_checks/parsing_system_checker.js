/** Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const Lexer = require('chevrotain').Lexer;
const TokenCollectorVisitor = require('./token_collector_visitor');

module.exports = {
  checkTokens,
  checkConfigKeys
};

function checkTokens(allDefinedTokens, rules) {
  const usedTokens = getUsedTokens(rules);
  const uselessTokens = getUselessTokens(usedTokens, allDefinedTokens);
  if (uselessTokens.length !== 0) {
    const redundantTokenNames = uselessTokens.map(tokenType => tokenType.tokenName);
    throw Error(`Redundant token definitions found: [ ${redundantTokenNames.join(', ')} ]`);
  }
}

function getUsedTokens(rules) {
  return rules.reduce((result, currentRule) => {
    const collector = new TokenCollectorVisitor();
    currentRule.accept(collector);
    return _.uniq(result.concat(collector.actualTokens));
  }, []);
}

function getUselessTokens(usedTokens, allDefinedTokens) {
  const usedCategories = _.uniq(_.flatMap(usedTokens, 'CATEGORIES'));
  const notDirectlyUsedTokens = _.difference(allDefinedTokens, _.uniq(usedTokens, usedCategories));
  const redundant = _.reject(notDirectlyUsedTokens, token => {
    const tokCategories = token.CATEGORIES;
    return _.some(tokCategories, category => _.includes(usedCategories, category));
  });
  return _.reject(redundant, tokenType => tokenType.GROUP === Lexer.SKIPPED);
}

function checkConfigKeys(definedTokensMap, usedConfigKeys) {
  checkForUselessConfigurationKeys(definedTokensMap, usedConfigKeys);
  checkForMissingConfigurationKeys(definedTokensMap, usedConfigKeys);
}

function checkForUselessConfigurationKeys(definedTokensMap, usedConfigKeys) {
  const redundantConfigKeys = _.difference(usedConfigKeys, Object.keys(definedTokensMap));
  if (!_.isEmpty(redundantConfigKeys)) {
    throw Error(`Useless configuration keys: [ ${redundantConfigKeys.join(', ')} ]`);
  }
}

function checkForMissingConfigurationKeys(definedTokensMap, usedConfigKeys) {
  const definedConfigKeyNames = _.values(definedTokensMap)
    .filter(tokenType => _.includes(tokenType.CATEGORIES, definedTokensMap.CONFIG_KEY))
    .map(tokenType => tokenType.tokenName);

  const missingConfigKeys = _.difference(definedConfigKeyNames, usedConfigKeys);
  if (!_.isEmpty(missingConfigKeys)) {
    throw Error(`Missing configuration keys: [ ${missingConfigKeys.join(', ')} ]`);
  }
}
