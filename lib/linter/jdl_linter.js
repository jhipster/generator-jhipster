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
const FileUtils = require('../utils/file_utils');
const JDLReader = require('../readers/jdl_reader');
const Rules = require('./rules');
const Issues = require('./issues/issues');
const EntityIssue = require('./issues/entity_issue');
const FieldIssue = require('./issues/field_issue');
const EnumIssue = require('./issues/enum_issue');
const RelationshipIssue = require('./issues/relationship_issue');
const RelationshipTypes = require('../core/jhipster/relationship_types');

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
    this.checkForEnumDeclarationIssues(cst);
    this.checkForRelationshipIssues(cst);
    return this.issues;
  }

  checkForEntityDeclarationIssues(cst) {
    if (!cst.children.entityDeclaration) {
      return;
    }
    this.checkForDuplicatedEntities(cst.children.entityDeclaration);
    cst.children.entityDeclaration.forEach(entityDeclaration => {
      this.checkForUselessEntityBraces(entityDeclaration);
      this.checkForUselessTableName(entityDeclaration);
      const entityName = entityDeclaration.children.NAME[0].image;
      const fieldDeclarations = getFieldDeclarationsFromEntity(entityDeclaration);
      if (fieldDeclarations.length !== 0) {
        this.checkForDuplicatedFields(entityName, fieldDeclarations);
      }
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

  checkForUselessTableName(entityDeclaration) {
    const entityName = entityDeclaration.children.NAME[0].image;
    const entityTableNameDeclaration = entityDeclaration.children.entityTableNameDeclaration;
    if (entityTableNameDeclaration) {
      const tableName = entityTableNameDeclaration[0].children.NAME[0].image;
      if (_.snakeCase(entityName) === tableName) {
        this.issues.addEntityIssue(
          new EntityIssue({
            ruleName: Rules.RuleNames.ENT_OPTIONAL_TABLE_NAME,
            entityName
          })
        );
      }
    }
  }

  checkForDuplicatedEntities(entityDeclarations) {
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
      this.issues.addEntityIssue(issue);
    });
  }

  checkForDuplicatedFields(entityName, fieldDeclarations) {
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
      this.issues.addFieldIssue(issue);
    });
  }

  checkForEnumDeclarationIssues(cst) {
    if (!cst.children.enumDeclaration) {
      return;
    }
    this.checkForDuplicatedEnums(cst.children.enumDeclaration);
    if (cst.children.entityDeclaration) {
      const fieldDeclarations = getAllFieldDeclarations(cst);
      this.checkForUnusedEnums(cst.children.enumDeclaration, fieldDeclarations);
    }
  }

  checkForDuplicatedEnums(enumDeclarations) {
    const enumNames = new Set();
    const duplicatedEnumIssues = new Map(); // key: enumName, value: issue
    enumDeclarations.forEach(enumDeclaration => {
      const enumName = enumDeclaration.children.NAME[0].image;
      if (enumNames.has(enumName)) {
        if (!duplicatedEnumIssues.has(enumName)) {
          duplicatedEnumIssues.set(
            enumName,
            new EnumIssue({
              ruleName: Rules.RuleNames.ENUM_DUPLICATED,
              enumName
            })
          );
        }
      } else {
        enumNames.add(enumName);
      }
    });
    duplicatedEnumIssues.forEach(issue => {
      this.issues.addEnumIssue(issue);
    });
  }

  checkForUnusedEnums(enumDeclarations, fieldDeclarations) {
    const usedEnums = fieldDeclarations.map(
      fieldDeclaration => fieldDeclaration.children.type[0].children.NAME[0].image
    );
    const declaredEnums = new Set(enumDeclarations.map(enumDeclaration => enumDeclaration.children.NAME[0].image));
    usedEnums.forEach(usedEnum => {
      declaredEnums.delete(usedEnum);
    });
    if (declaredEnums.size !== 0) {
      declaredEnums.forEach(unusedEnum => {
        this.issues.addEnumIssue(new EnumIssue({ enumName: unusedEnum, ruleName: Rules.RuleNames.ENUM_UNUSED }));
      });
    }
  }

  checkForRelationshipIssues(cst) {
    if (!cst.children.relationDeclaration || cst.children.relationDeclaration.length === 0) {
      return;
    }
    this.checkForCollapsibleRelationships(cst.children.relationDeclaration);
  }

  checkForCollapsibleRelationships(relationshipDeclarations) {
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
          this.issues.addRelationshipIssue(
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
}

module.exports = JDLLinter;

function getAllFieldDeclarations(cst) {
  return cst.children.entityDeclaration.reduce((fieldDeclarations, entityDeclaration) => {
    return fieldDeclarations.concat(getFieldDeclarationsFromEntity(entityDeclaration));
  }, []);
}

function getFieldDeclarationsFromEntity(entityDeclaration) {
  if (entityDeclaration.children.entityBody && entityDeclaration.children.entityBody[0].children.fieldDeclaration) {
    return entityDeclaration.children.entityBody[0].children.fieldDeclaration;
  }
  return [];
}
