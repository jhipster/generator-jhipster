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

const FileUtils = require('../utils/file_utils');
const JDLReader = require('../reader/jdl_reader');
const Rules = require('./rules');
const Issues = require('./issues/issues');
const EntityIssue = require('./issues/entity_issue');

class JDLLinter {
  /**
   * Constructs a JDLLinter with an arg object.
   * @param args the arg object, keys:
   *             - filePath: the path to the JDL file to check
   */
  constructor(args = {}) {
    if (!args.filePath) {
      throw new Error('The JDL file path must be passed.');
    }
    if (!FileUtils.doesFileExist(args.filePath)) {
      throw new Error(`The path to the JDL file doesn't exist, got '${args.filePath}'.`);
    }
    this.filePath = args.filePath;
    this.issues = new Issues();
  }

  check() {
    const cst = JDLReader.getCstFromFiles([this.filePath]);
    this.checkForEntityDeclarationIssues(cst);
    return this.issues;
  }

  checkForEntityDeclarationIssues(cst) {
    if (!cst.children.entityDeclaration) {
      return;
    }
    cst.children.entityDeclaration.forEach(entityDeclaration => {
      this.checkForUselessEntityBraces(entityDeclaration);
    });
  }

  checkForUselessEntityBraces(entityDeclaration) {
    const entityBody = entityDeclaration.children.entityBody;
    if (entityBody && Object.keys(entityBody[0].children).length === 2) {
      // only LCURLY & RCURLY
      this.issues.addEntityIssue(
        new EntityIssue({
          ruleName: Rules.RuleNames.ENT_SHORTER_DECL,
          entityName: entityDeclaration.children.NAME[0].image
        })
      );
    }
  }
}

module.exports = JDLLinter;
