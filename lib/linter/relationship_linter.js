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
 * That is done by passing the list of relationship declarations from the CST (from the JDLReader output).
 * @param {Array} relationshipDeclarations - the list of relationship declarations
 * @return {Array} the found relationship issues.
 */
function checkRelationships(relationshipDeclarations) {
  if (!relationshipDeclarations || relationshipDeclarations === 0) {
    return [];
  }
  issues = [];
  checkForCollapsibleRelationships(relationshipDeclarations);
  return issues;
}

function checkForCollapsibleRelationships(relationshipDeclarations) {
  const sortedRelationships = {
    [RelationshipTypes.ONE_TO_ONE]: [],
    [RelationshipTypes.ONE_TO_MANY]: [],
    [RelationshipTypes.MANY_TO_ONE]: [],
    [RelationshipTypes.MANY_TO_MANY]: []
  };
  relationshipDeclarations.forEach(relationshipDeclaration => {
    const type = relationshipDeclaration.children.relationshipType[0].children;
    const relationshipType = RelationshipTypes[Object.keys(type)[0]];
    const from = relationshipDeclaration.children.relationshipBody[0].children.from[0].children.NAME[0].image;
    const to = relationshipDeclaration.children.relationshipBody[0].children.to[0].children.NAME[0].image;
    sortedRelationships[relationshipType].push({ from, to });
  });
  Object.keys(sortedRelationships).forEach(type => {
    if (sortedRelationships[type].length > 1) {
      sortedRelationships[type].forEach(relationship => {
        issues.push(
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
