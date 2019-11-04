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

const Rules = require('./rules');
const EnumIssue = require('./issues/enum_issue');
const { getAllFieldDeclarations } = require('./linter_utils');

let issues;

module.exports = {
  checkEnums
};

/**
 * Check enums for lint issues.
 * @param {Object} cst a concrete syntax tree object obtained from the parsing system
 * @param {Issues} passedIssues the issues object to update with what's detected
 */
function checkEnums(cst, passedIssues) {
  if (!cst.children.enumDeclaration) {
    return;
  }
  issues = passedIssues;
  checkForDuplicatedEnums(cst.children.enumDeclaration);
  if (cst.children.entityDeclaration) {
    const fieldDeclarations = getAllFieldDeclarations(cst);
    checkForUnusedEnums(cst.children.enumDeclaration, fieldDeclarations);
  }
}

function checkForDuplicatedEnums(enumDeclarations) {
  const enumNames = new Set();
  const duplicatedEnumIssues = new Map(); // key: enumName, value: issue
  enumDeclarations.forEach(enumDeclaration => {
    const enumName = enumDeclaration.children.NAME[0].image;
    if (enumNames.has(enumName)) {
      if (!duplicatedEnumIssues.has(enumName)) {
        duplicatedEnumIssues.set(
          enumName,
          new EnumIssue({
            ruleName: Rules.RuleNames.ENUM_DUPLICATED,
            enumName
          })
        );
      }
    } else {
      enumNames.add(enumName);
    }
  });
  duplicatedEnumIssues.forEach(issue => {
    issues.addEnumIssue(issue);
  });
}

function checkForUnusedEnums(enumDeclarations, fieldDeclarations) {
  const usedEnums = fieldDeclarations.map(fieldDeclaration => fieldDeclaration.children.type[0].children.NAME[0].image);
  const declaredEnums = new Set(enumDeclarations.map(enumDeclaration => enumDeclaration.children.NAME[0].image));
  usedEnums.forEach(usedEnum => {
    declaredEnums.delete(usedEnum);
  });
  if (declaredEnums.size !== 0) {
    declaredEnums.forEach(unusedEnum => {
      issues.addEnumIssue(new EnumIssue({ enumName: unusedEnum, ruleName: Rules.RuleNames.ENUM_UNUSED }));
    });
  }
}
