/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { rulesNames } from './rules.js';
import EnumIssue from './issues/enum-issue.js';
import { FieldDeclaration } from './field-linter.js';

let issues: EnumIssue[];

export type EnumDeclaration = {
  children: {
    NAME: any[];
  };
};

/**
 * Check enums for lint issues.
 * That is done by passing the list of enum declarations from the CST (from the JDLReader output).
 * @param enumDeclarations - the list of enum declarations
 * @param fieldDeclarations - the list of field declarations, to check for unused enums
 * @return the found entity issues.
 */
export function checkEnums(enumDeclarations: EnumDeclaration[], fieldDeclarations: FieldDeclaration[]): EnumIssue[] {
  if (!enumDeclarations) {
    return [];
  }
  issues = [];
  checkForDuplicatedEnums(enumDeclarations);
  checkForUnusedEnums(enumDeclarations, fieldDeclarations);
  return issues;
}

function checkForDuplicatedEnums(enumDeclarations: EnumDeclaration[]) {
  const enumNames = new Set();
  const duplicatedEnumIssues = new Map(); // key: enumName, value: issue
  enumDeclarations.forEach(enumDeclaration => {
    const enumName = enumDeclaration.children.NAME[0].image;
    if (enumNames.has(enumName)) {
      if (!duplicatedEnumIssues.has(enumName)) {
        duplicatedEnumIssues.set(
          enumName,
          new EnumIssue({
            ruleName: rulesNames.ENUM_DUPLICATED,
            enumName,
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

function checkForUnusedEnums(enumDeclarations: EnumDeclaration[], fieldDeclarations: FieldDeclaration[]) {
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
      issues.push(new EnumIssue({ enumName: unusedEnum, ruleName: rulesNames.ENUM_UNUSED }));
    });
  }
}
