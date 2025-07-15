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
import { relationshipTypes } from '../basic-types/index.js';
import RelationshipIssue from './issues/relationship-issue.js';

import { rulesNames } from './rules.js';

let issues: RelationshipIssue[];

export default {
  checkRelationships,
};

/**
 * Check relationships for lint issues.
 * That is done by passing the list of relationship declarations from the CST (from the JDLReader output).
 * @param {Array} relationshipDeclarations - the list of relationship declarations
 * @return the found relationship issues.
 */
export function checkRelationships(relationshipDeclarations: CstNode[]): RelationshipIssue[] {
  if (!relationshipDeclarations || relationshipDeclarations.length === 0) {
    return [];
  }
  issues = [];
  checkForCollapsibleRelationships(relationshipDeclarations);
  return issues;
}

function checkForCollapsibleRelationships(relationshipDeclarations: CstNode[]) {
  const sortedRelationships: Record<string, { from: string; to: string }[]> = {
    [relationshipTypes.ONE_TO_ONE]: [],
    [relationshipTypes.ONE_TO_MANY]: [],
    [relationshipTypes.MANY_TO_ONE]: [],
    [relationshipTypes.MANY_TO_MANY]: [],
  };
  relationshipDeclarations.forEach(relationshipDeclaration => {
    const type = ((relationshipDeclaration.children.relationshipType[0] as CstNode).children.RELATIONSHIP_TYPE[0] as IToken).image;
    const from = (
      ((relationshipDeclaration.children.relationshipBody[0] as CstNode).children.from[0] as CstNode).children.NAME[0] as IToken
    ).image;
    const to = (((relationshipDeclaration.children.relationshipBody[0] as CstNode).children.to[0] as CstNode).children.NAME[0] as IToken)
      .image;
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
          }),
        );
      });
    }
  });
}
