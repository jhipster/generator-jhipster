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

const { readFile } = require('../readers/file_reader');
const JDLReader = require('../readers/jdl_reader');
const Issues = require('./issues/issues');
const { checkEntities } = require('./entity_linter');
const { checkEnums } = require('./enum_linter');
const { checkRelationships } = require('./relationship_linter');

module.exports = {
  createJDLLinterFromContent,
  createJDLLinterFromFile
};

/**
 * Creates a new JDL linter from a JDL string content.
 * @param {string} jdlString - the JDL string content to lint.
 * @return {Object} the JDL linter.
 * @throws {Error} if the content isn't passed.
 */
function createJDLLinterFromContent(jdlString) {
  if (!jdlString) {
    throw new Error('A JDL content must be passed to create a new JDL linter.');
  }
  return makeJDLLinter(jdlString);
}

/**
 * Creates a new JDL linter from a JDL file.
 * @param {string} file - the JDL file.
 * @return {Object} the JDL linter.
 * @throws {Error} if the JDL file isn't passed.
 */
function createJDLLinterFromFile(file) {
  if (!file) {
    throw new Error('A JDL file must be passed to create a new JDL linter.');
  }
  const jdlString = readFile(file);
  return makeJDLLinter(jdlString);
}

let cst;
let issues;

function makeJDLLinter(content) {
  cst = JDLReader.getCstFromContent(content);
  issues = new Issues();

  return {
    check: () => {
      checkForEntityDeclarationIssues();
      checkForEnumDeclarationIssues();
      checkForRelationshipIssues();
      return issues;
    }
  };
}

function checkForEntityDeclarationIssues() {
  checkEntities(cst, issues);
}

function checkForEnumDeclarationIssues() {
  checkEnums(cst, issues);
}

function checkForRelationshipIssues() {
  checkRelationships(cst, issues);
}
