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

let issues;

module.exports = {
  checkEnums
};

/**
 * Check enums for lint issues.
 * That is done by passing the list of enum declarations from the CST (from the JDLReader output).
 * @param {Array} enumDeclarations - the list of enum declarations
 * @param {Array} fieldDeclarations - the list of field declarations, to check for unused enums
 * @return {Array} the found entity issues.
 */
function checkEnums(enumDeclarations, fieldDeclarations) {
  if (!enumDeclarations) {
    return [];
  }
  issues = [];
  checkForDuplicatedEnums(enumDeclarations);
  checkForUnusedEnums(enumDeclarations, fieldDeclarations);
  return issues;
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
    issues.push(issue);
  });
}

function checkForUnusedEnums(enumDeclarations, fieldDeclarations) {
  const fieldTypes = fieldDeclarations.map(fieldDeclaration => {
    return fieldDeclaration.children.type[0].children.NAME[0].image;
  });
  const declaredEnums = new Set(
    enumDeclarations.map(enumDeclaration => {
      return enumDeclaration.children.NAME[0].image;
    })
  );
  fieldTypes.forEach(usedEnum => {
    declaredEnums.delete(usedEnum);
  });
  if (declaredEnums.size !== 0) {
    declaredEnums.forEach(unusedEnum => {
      issues.push(new EnumIssue({ enumName: unusedEnum, ruleName: Rules.RuleNames.ENUM_UNUSED }));
    });
  }
}
