/** Copyright 2013-2018 the original author or authors from the JHipster project.
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
const chevrotain = require('chevrotain');

const GAstVisitor = chevrotain.GAstVisitor;
const Lexer = chevrotain.Lexer;

/**
 * This module includes reflective checks on the DSL implementation.
 * to increase correctness and reduce the TCO.
 */
module.exports = {
  findRedundantTokens,
  checkConfigKeys
};

class TokenCollectorVisitor extends GAstVisitor {
  constructor() {
    super();
    this.actualTokens = [];
  }

  visitTerminal(node) {
    this.actualTokens.push(node.terminalType);
  }

  visitRepetitionMandatoryWithSeparator(node) {
    this.actualTokens.push(node.separator);
  }

  visitRepetitionWithSeparator(node) {
    this.actualTokens.push(node.separator);
  }
}

function findRedundantTokens(allDefinedTokens, rules) {
  const usedTokens = rules.reduce(
    (result, currRule) => {
      const collector = new TokenCollectorVisitor();
      currRule.accept(collector);
      return _.uniq(result.concat(collector.actualTokens));
    },
    []
  );

  const usedCategories = _.uniq(_.flatMap(usedTokens, 'CATEGORIES'));

  const notDirectlyUsed = _.difference(
    allDefinedTokens,
    _.uniq(usedTokens, usedCategories)
  );

  function memberOfUsedCategory(tok) {
    const tokCategories = tok.CATEGORIES;
    return _.some(tokCategories, cat => _.includes(usedCategories, cat));
  }
  const redundant = _.reject(notDirectlyUsed, memberOfUsedCategory);
  const realRedundant = _.reject(
    redundant,
    tokType => tokType.GROUP === Lexer.SKIPPED
  );

  if (!_.isEmpty(realRedundant)) {
    const redundantTokenNames = realRedundant.map(tokType => tokType.tokenName);
    throw Error(
      `Redundant Token Definitions Found: [ ${redundantTokenNames.join(',')} ]`
    );
  }
}

function checkConfigKeys(definedTokensMap, usedConfigKeys) {
  const redundantConfigKeys = _.difference(
    usedConfigKeys,
    _.keys(definedTokensMap)
  );
  if (!_.isEmpty(redundantConfigKeys)) {
    throw Error(
      `Redundant Configuration Keys: [ ${redundantConfigKeys.join(',')} ]`
    );
  }

  const isCategoryType = tokType =>
    _.includes(tokType.CATEGORIES, definedTokensMap.CONFIG_KEY);
  const allDefinedConfigKeys = _.values(definedTokensMap).filter(
    isCategoryType
  );
  const allDefinedConfigKeysNames = allDefinedConfigKeys.map(
    tokType => tokType.tokenName
  );
  const missingConfigKeys = _.difference(
    allDefinedConfigKeysNames,
    usedConfigKeys
  );

  if (!_.isEmpty(missingConfigKeys)) {
    throw Error(
      `Missing Configuration Keys: [ ${missingConfigKeys.join(',')} ]`
    );
  }
}
