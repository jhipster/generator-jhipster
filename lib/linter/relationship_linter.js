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
const RelationshipIssue = require('./issues/relationship_issue');
const RelationshipTypes = require('../core/jhipster/relationship_types');

let issues;

module.exports = {
  checkRelationships
};

/**
 * Check relationships for lint issues.
 * @param {Object} cst a concrete syntax tree object obtained from the parsing system
 * @param {Issues} passedIssues the issues object to update with what's detected
 */
function checkRelationships(cst, passedIssues) {
  if (!cst.children.relationDeclaration || cst.children.relationDeclaration.length === 0) {
    return;
  }
  issues = passedIssues;
  checkForCollapsibleRelationships(cst.children.relationDeclaration);
}

function checkForCollapsibleRelationships(relationshipDeclarations) {
  const sortedRelationships = {
    [RelationshipTypes.ONE_TO_ONE]: [],
    [RelationshipTypes.ONE_TO_MANY]: [],
    [RelationshipTypes.MANY_TO_ONE]: [],
    [RelationshipTypes.MANY_TO_MANY]: []
  };
  relationshipDeclarations.forEach(relationshipDeclaration => {
    const type = RelationshipTypes[Object.keys(relationshipDeclaration.children.relationshipType[0].children)[0]];
    const from = relationshipDeclaration.children.relationshipBody[0].children.from[0].children.NAME[0].image;
    const to = relationshipDeclaration.children.relationshipBody[0].children.to[0].children.NAME[0].image;
    sortedRelationships[type].push({ from, to });
  });
  Object.keys(sortedRelationships).forEach(type => {
    if (sortedRelationships[type].length > 1) {
      sortedRelationships[type].forEach(relationship => {
        issues.addRelationshipIssue(
          new RelationshipIssue({
            ruleName: Rules.RuleNames.REL_INDIVIDUAL_DECL,
            from: relationship.from,
            to: relationship.to,
            type
          })
        );
      });
    }
  });
}
