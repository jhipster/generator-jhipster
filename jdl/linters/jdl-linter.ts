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

import { readFile } from '../readers/file-reader.js';
import * as JDLReader from '../readers/jdl-reader.js';
import Issues from './issues/issues.js';
import { checkEntities, EntityDeclaration } from './entity-linter.js';
import { checkFields } from './field-linter.js';
import { checkEnums } from './enum-linter.js';
import { checkRelationships } from './relationship-linter.js';

export type JDLLinter = {
  check: () => Issues;
};

/**
 * Creates a new JDL linters from a JDL string content.
 * @param jdlString - the JDL string content to lint.
 * @return {Object} the JDL linters.
 * @throws {Error} if the content isn't passed.
 */
export function createJDLLinterFromContent(jdlString: string) {
  if (!jdlString) {
    throw new Error('A JDL content must be passed to create a new JDL linter.');
  }
  return makeJDLLinter(jdlString);
}

/**
 * Creates a new JDL linters from a JDL file.
 * @param file - the JDL file.
 * @return {Object} the JDL linters.
 * @throws {Error} if the JDL file isn't passed.
 */
export function createJDLLinterFromFile(file: string): JDLLinter {
  if (!file) {
    throw new Error('A JDL file must be passed to create a new JDL linter.');
  }
  const jdlString = readFile(file);
  return makeJDLLinter(jdlString);
}

type CST = {
  children: {
    entityDeclaration: EntityDeclaration[];
    enumDeclaration: [];
    relationDeclaration: [];
  };
};

let cst: CST;
let issues: Issues;

function makeJDLLinter(content: any) {
  cst = JDLReader.getCstFromContent(content);
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
  const entityIssues = checkEntities(entityDeclarations);
  issues.addEntityIssues(entityIssues);
}

function checkForFieldDeclarationIssues() {
  const entityDeclarations = cst.children.entityDeclaration;
  if (!entityDeclarations) {
    return;
  }
  entityDeclarations.forEach(entityDeclaration => {
    const entityName = entityDeclaration.children.NAME[0].image;
    const fieldDeclarations = getFieldDeclarationsFromEntity(entityDeclaration);
    if (fieldDeclarations.length !== 0) {
      const fieldIssues = checkFields(entityName, fieldDeclarations);
      issues.addFieldIssues(fieldIssues);
    }
  });
}

function checkForEnumDeclarationIssues() {
  const enumDeclarations = cst.children.enumDeclaration;
  const entityDeclarations = cst.children.entityDeclaration;
  const fieldDeclarations = getAllFieldDeclarations(entityDeclarations);
  const enumIssues = checkEnums(enumDeclarations, fieldDeclarations);
  issues.addEnumIssues(enumIssues);
}

function checkForRelationshipIssues() {
  const relationshipDeclarations = cst.children.relationDeclaration;
  const relationshipIssues = checkRelationships(relationshipDeclarations);
  issues.addRelationshipIssues(relationshipIssues);
}

function getAllFieldDeclarations(entityDeclarations: EntityDeclaration[]) {
  if (!entityDeclarations) {
    return [];
  }
  return entityDeclarations.reduce((fieldDeclarations, entityDeclaration) => {
    return fieldDeclarations.concat(getFieldDeclarationsFromEntity(entityDeclaration));
  }, []);
}

function getFieldDeclarationsFromEntity(entityDeclaration: EntityDeclaration) {
  const entityBody = entityDeclaration.children.entityBody;
  const entityFields = entityBody && entityBody[0].children.fieldDeclaration;
  if (entityBody && entityFields) {
    return entityFields;
  }
  return [];
}
