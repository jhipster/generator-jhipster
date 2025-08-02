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

import { getCstFromContent } from '../readers/jdl-reader.ts';
import type { JDLRuntime } from '../types/runtime.js';

import { checkEntities } from './entity-linter.ts';
import { checkEnums } from './enum-linter.ts';
import { checkFields } from './field-linter.ts';
import Issues from './issues/issues.ts';
import { checkRelationships } from './relationship-linter.ts';

export type JDLLinter = {
  check: () => Issues;
};

/**
 * Creates a new JDL linters from a JDL string content.
 * @param jdlString - the JDL string content to lint.
 * @return {Object} the JDL linters.
 * @throws {Error} if the content isn't passed.
 */
export function createJDLLinterFromContent(jdlString: string, runtime: JDLRuntime) {
  if (!jdlString) {
    throw new Error('A JDL content must be passed to create a new JDL linter.');
  }
  return makeJDLLinter(jdlString, runtime);
}

let cst: CstNode;
let issues: Issues;

function makeJDLLinter(content: any, runtime: JDLRuntime) {
  cst = getCstFromContent(content, runtime);
  issues = new Issues();

  return {
    check: () => {
      checkForEntityDeclarationIssues();
      checkForFieldDeclarationIssues();
      checkForEnumDeclarationIssues();
      checkForRelationshipIssues();
      return issues;
    },
  };
}

function checkForEntityDeclarationIssues() {
  const entityDeclarations = cst.children.entityDeclaration;
  const entityIssues = checkEntities(entityDeclarations as CstNode[]);
  issues.addEntityIssues(entityIssues);
}

function checkForFieldDeclarationIssues() {
  const entityDeclarations = cst.children.entityDeclaration as CstNode[];
  if (!entityDeclarations) {
    return;
  }
  entityDeclarations.forEach(entityDeclaration => {
    const entityName = (entityDeclaration.children.NAME[0] as IToken).image;
    const fieldDeclarations = getFieldDeclarationsFromEntity(entityDeclaration);
    if (fieldDeclarations.length !== 0) {
      const fieldIssues = checkFields(entityName, fieldDeclarations);
      issues.addFieldIssues(fieldIssues);
    }
  });
}

function checkForEnumDeclarationIssues() {
  const enumDeclarations = cst.children.enumDeclaration as CstNode[];
  const entityDeclarations = cst.children.entityDeclaration as CstNode[];
  const fieldDeclarations = getAllFieldDeclarations(entityDeclarations);
  const enumIssues = checkEnums(enumDeclarations, fieldDeclarations);
  issues.addEnumIssues(enumIssues);
}

function checkForRelationshipIssues() {
  const relationshipDeclarations = cst.children.relationDeclaration as CstNode[];
  const relationshipIssues = checkRelationships(relationshipDeclarations);
  issues.addRelationshipIssues(relationshipIssues);
}

function getAllFieldDeclarations(entityDeclarations: CstNode[]): CstNode[] {
  if (!entityDeclarations) {
    return [];
  }
  return entityDeclarations.reduce(
    (fieldDeclarations: CstNode[], entityDeclaration) => fieldDeclarations.concat(getFieldDeclarationsFromEntity(entityDeclaration)),
    [],
  );
}

function getFieldDeclarationsFromEntity(entityDeclaration: CstNode): CstNode[] {
  const entityBody = entityDeclaration.children.entityBody?.[0] as CstNode | undefined;
  return (entityBody?.children.fieldDeclaration as CstNode[]) ?? [];
}
