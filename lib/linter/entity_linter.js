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
const EntityIssue = require('./issues/entity_issue');
const { createFromEntityName } = require('../core/jhipster/entity_table_name_creator');

let issues;

module.exports = {
  checkEntities
};

/**
 * Check entities for lint issues.
 * That is done by passing the list of entity declarations from the CST (from the JDLReader output).
 * @param {Array} entityDeclarations - the list of entity declarations
 * @return {Array} the found entity issues.
 */
function checkEntities(entityDeclarations) {
  if (!entityDeclarations) {
    return [];
  }
  issues = [];
  checkForDuplicatedEntities(entityDeclarations);
  entityDeclarations.forEach(entityDeclaration => {
    checkForUselessEntityBraces(entityDeclaration);
    checkForUselessTableName(entityDeclaration);
  });
  return issues;
}

function checkForDuplicatedEntities(entityDeclarations) {
  const entityNames = new Set();
  const duplicatedEntityIssues = new Map(); // key: entityName, value: issue
  entityDeclarations.forEach(entityDeclaration => {
    const entityName = entityDeclaration.children.NAME[0].image;
    if (entityNames.has(entityName)) {
      if (!duplicatedEntityIssues.has(entityName)) {
        duplicatedEntityIssues.set(
          entityName,
          new EntityIssue({
            ruleName: Rules.RuleNames.ENT_DUPLICATED,
            entityName
          })
        );
      }
    } else {
      entityNames.add(entityName);
    }
  });
  duplicatedEntityIssues.forEach(issue => {
    issues.push(issue);
  });
}

function checkForUselessEntityBraces(entityDeclaration) {
  const entityBody = entityDeclaration.children.entityBody;
  const nextTokensAfterRelationshipType = entityBody && entityBody[0].children;
  const onlyCurlyBracesAsRelationshipBody = entityBody && Object.keys(nextTokensAfterRelationshipType).length === 2;
  if (onlyCurlyBracesAsRelationshipBody) {
    issues.push(
      new EntityIssue({
        ruleName: Rules.RuleNames.ENT_SHORTER_DECL,
        entityName: entityDeclaration.children.NAME[0].image
      })
    );
  }
}

function checkForUselessTableName(entityDeclaration) {
  const entityName = entityDeclaration.children.NAME[0].image;
  const entityTableNameDeclaration = entityDeclaration.children.entityTableNameDeclaration;
  if (entityTableNameDeclaration) {
    const tableName = entityTableNameDeclaration[0].children.NAME[0].image;
    if (createFromEntityName(entityName) === tableName) {
      issues.push(
        new EntityIssue({
          ruleName: Rules.RuleNames.ENT_OPTIONAL_TABLE_NAME,
          entityName
        })
      );
    }
  }
}
