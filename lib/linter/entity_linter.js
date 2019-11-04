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

const _ = require('lodash');
const Rules = require('./rules');
const EntityIssue = require('./issues/entity_issue');
const FieldIssue = require('./issues/field_issue');
const { getFieldDeclarationsFromEntity } = require('./linter_utils');

let issues;

module.exports = {
  checkEntities
};

/**
 * Check entities and fields for lint issues.
 * @param {Object} cst a concrete syntax tree object obtained from the parsing system
 * @param {Issues} passedIssues the issues object to update with what's detected
 */
function checkEntities(cst, passedIssues) {
  if (!cst.children.entityDeclaration) {
    return;
  }
  issues = passedIssues;
  checkForDuplicatedEntities(cst.children.entityDeclaration);
  cst.children.entityDeclaration.forEach(entityDeclaration => {
    checkForUselessEntityBraces(entityDeclaration);
    checkForUselessTableName(entityDeclaration);
    const entityName = entityDeclaration.children.NAME[0].image;
    const fieldDeclarations = getFieldDeclarationsFromEntity(entityDeclaration);
    if (fieldDeclarations.length !== 0) {
      checkForDuplicatedFields(entityName, fieldDeclarations);
    }
  });
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
    issues.addEntityIssue(issue);
  });
}

function checkForUselessEntityBraces(entityDeclaration) {
  const entityBody = entityDeclaration.children.entityBody;
  if (entityBody && Object.keys(entityBody[0].children).length === 2) {
    // only LCURLY & RCURLY
    issues.addEntityIssue(
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
    if (_.snakeCase(entityName) === tableName) {
      issues.addEntityIssue(
        new EntityIssue({
          ruleName: Rules.RuleNames.ENT_OPTIONAL_TABLE_NAME,
          entityName
        })
      );
    }
  }
}

function checkForDuplicatedFields(entityName, fieldDeclarations) {
  const fieldNames = new Set();
  const duplicatedFieldIssues = new Map(); // key: fieldName, value: issue
  fieldDeclarations.forEach(fieldDeclaration => {
    const fieldName = fieldDeclaration.children.NAME[0].image;
    if (fieldNames.has(fieldName)) {
      if (!duplicatedFieldIssues.has(fieldName)) {
        duplicatedFieldIssues.set(
          fieldName,
          new FieldIssue({
            ruleName: Rules.RuleNames.FLD_DUPLICATED,
            fieldName,
            entityName
          })
        );
      }
    } else {
      fieldNames.add(fieldName);
    }
  });
  duplicatedFieldIssues.forEach(issue => {
    issues.addFieldIssue(issue);
  });
}
