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

import type { CstNode, IToken } from 'chevrotain';
import { rulesNames } from './rules.js';
import FieldIssue from './issues/field-issue.js';

let issues: FieldIssue[];

/**
 * Check fields for lint issues.
 * That is done by passing the list of fields declarations from the CST (from the JDLReader output).
 * @param entityName - the name of the entity having the fields
 * @param {Array} fieldDeclarations - the field declaration list
 * @return the found entity issues.
 */
export function checkFields(entityName: string, fieldDeclarations: CstNode[]): FieldIssue[] {
  if (fieldDeclarations.length === 0) {
    return [];
  }
  issues = [];
  checkForDuplicatedFields(entityName, fieldDeclarations);
  return issues;
}

function checkForDuplicatedFields(entityName: string, fieldDeclarations: CstNode[]) {
  const fieldNames = new Set();
  const duplicatedFieldIssues = new Map<string, FieldIssue>(); // key: fieldName, value: issue
  fieldDeclarations.forEach(fieldDeclaration => {
    const fieldName = (fieldDeclaration.children.NAME[0] as IToken).image;
    if (fieldNames.has(fieldName)) {
      if (!duplicatedFieldIssues.has(fieldName)) {
        duplicatedFieldIssues.set(
          fieldName,
          new FieldIssue({
            ruleName: rulesNames.FLD_DUPLICATED,
            fieldName,
            entityName,
          }),
        );
      }
    } else {
      fieldNames.add(fieldName);
    }
  });
  duplicatedFieldIssues.forEach(issue => {
    issues.push(issue);
  });
}
