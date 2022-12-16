/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import RelationshipIssue from './issues/relationship-issue.js';

import { rulesNames } from './rules.js';
import RelationshipTypes from '../jhipster/relationship-types.js';

let issues: RelationshipIssue[];

type RelationshipDeclaration = {
  children: {
    relationshipType: any[];
  };
};

export default {
  checkRelationships,
};

/**
 * Check relationships for lint issues.
 * That is done by passing the list of relationship declarations from the CST (from the JDLReader output).
 * @param {Array} relationshipDeclarations - the list of relationship declarations
 * @return the found relationship issues.
 */
export function checkRelationships(relationshipDeclarations: RelationshipDeclaration[]): RelationshipIssue[] {
  if (!relationshipDeclarations || relationshipDeclarations.length === 0) {
    return [];
  }
  issues = [];
  checkForCollapsibleRelationships(relationshipDeclarations);
  return issues;
}

function checkForCollapsibleRelationships(relationshipDeclarations: RelationshipDeclaration[]) {
  const sortedRelationships: {
    [key in string]: { from: string; to: string }[];
  } = {
    [RelationshipTypes.ONE_TO_ONE]: [],
    [RelationshipTypes.ONE_TO_MANY]: [],
    [RelationshipTypes.MANY_TO_ONE]: [],
    [RelationshipTypes.MANY_TO_MANY]: [],
  };
  relationshipDeclarations.forEach((relationshipDeclaration: any) => {
    const type = relationshipDeclaration.children.relationshipType[0].children.RELATIONSHIP_TYPE[0].image;
    const from = relationshipDeclaration.children.relationshipBody[0].children.from[0].children.NAME[0].image;
    const to = relationshipDeclaration.children.relationshipBody[0].children.to[0].children.NAME[0].image;
    sortedRelationships[type].push({ from, to });
  });
  Object.keys(sortedRelationships).forEach(type => {
    if (sortedRelationships[type].length > 1) {
      sortedRelationships[type].forEach(relationship => {
        issues.push(
          new RelationshipIssue({
            ruleName: rulesNames.REL_INDIVIDUAL_DECL,
            from: relationship.from,
            to: relationship.to,
            type,
          })
        );
      });
    }
  });
}
