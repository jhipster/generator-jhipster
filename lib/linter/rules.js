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

const Rule = require('./rule');
const { INFO, WARNING, ERROR } = require('./rule_levels');

const rulesNames = {
  ENT_SHORTER_DECL: 'ENT_SHORTER_DECL',
  ENT_OPTIONAL_TABLE_NAME: 'ENT_OPTIONAL_TABLE_NAME',
  ENT_DUPLICATED: 'ENT_DUPLICATED',
  FLD_OPTIONAL_COMMAS: 'FLD_OPTIONAL_COMMAS',
  REL_INDIVIDUAL_DECL: 'REL_INDIVIDUAL_DECL',
  FLD_DUPLICATED: 'FLD_DUPLICATED',
  ENUM_DUPLICATED: 'ENUM_DUPLICATED',
  ENUM_UNUSED: 'ENUM_UNUSED'
};

const rules = {
  ENT_SHORTER_DECL: new Rule({
    name: 'ShorterEntityDeclaration',
    level: INFO,
    comment: 'When an entity does not have any field, it is possible to omit the curly braces.'
  }),
  ENT_OPTIONAL_TABLE_NAME: new Rule({
    name: 'OptionalEntityTableName',
    level: WARNING,
    comment: 'Setting custom table names is possible, but not recommended.'
  }),
  ENT_DUPLICATED: new Rule({
    name: 'DuplicatedEntityDeclaration',
    level: ERROR,
    comment: 'An entity should not be declared more than once.'
  }),
  FLD_DUPLICATED: new Rule({
    name: 'DuplicatedFieldDeclaration',
    level: ERROR,
    comment: 'A field should not be declared more than once in an entity.'
  }),
  FLD_OPTIONAL_COMMAS: new Rule({
    name: 'OptionalFieldCommas',
    level: INFO,
    comment: 'While commas are supported, they are not mandatory if only one field is declared per line.'
  }),
  REL_INDIVIDUAL_DECL: new Rule({
    name: 'IndividualRelationshipDeclaration',
    level: WARNING,
    comment: 'It is preferable to group relationships by type instead of declaring them one by one.'
  }),
  ENUM_DUPLICATED: new Rule({
    name: 'DuplicatedEnumDeclaration',
    level: ERROR,
    comment: 'An enum should not be declared more than once.'
  }),
  ENUM_UNUSED: new Rule({
    name: 'UnusedEnum',
    level: INFO,
    comment: 'An unused enum should be removed.'
  })
};

module.exports = {
  RuleNames: rulesNames,
  getRule,
  ...rules
};

/**
 * Gets and returns the rule having the passed name.
 * @param {string} ruleName - the name of the rule to fetch
 * @returns {Object} the rule.
 * @throws if no ruleName is passed.
 */
function getRule(ruleName) {
  if (!ruleName) {
    throw new Error('A rule name has to be passed to get a rule.');
  }
  return rules[ruleName];
}
