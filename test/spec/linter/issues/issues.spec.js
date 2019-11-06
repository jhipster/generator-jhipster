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

const expect = require('chai').expect;
const Issues = require('../../../../lib/linter/issues/issues');
const Rules = require('../../../../lib/linter/rules');
const RelationshipTypes = require('../../../../lib/core/jhipster/relationship_types');
const EntityIssue = require('../../../../lib/linter/issues/entity_issue');
const FieldIssue = require('../../../../lib/linter/issues/field_issue');
const EnumIssue = require('../../../../lib/linter/issues/enum_issue');
const RelationshipIssue = require('../../../../lib/linter/issues/relationship_issue');

describe('Issues', () => {
  describe('getNumberOfIssues', () => {
    let issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('returns 0', () => {
        expect(issues.getNumberOfIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addEntityIssues([
          new EntityIssue({
            ruleName: Rules.RuleNames.ENT_SHORTER_DECL,
            entityName: 'A'
          })
        ]);
        issues.addEnumIssues([
          new EnumIssue({
            ruleName: Rules.RuleNames.ENUM_DUPLICATED,
            enumName: 'SuperEnum'
          })
        ]);
        issues.addFieldIssues([
          new FieldIssue({
            ruleName: Rules.RuleNames.FLD_DUPLICATED,
            fieldName: 'a',
            entityName: 'A'
          })
        ]);
        issues.addRelationshipIssues([
          new RelationshipIssue({
            ruleName: Rules.RuleNames.REL_INDIVIDUAL_DECL,
            from: 'A',
            to: 'A',
            type: RelationshipTypes.ONE_TO_ONE
          })
        ]);
      });

      it('returns the total amount', () => {
        expect(issues.getNumberOfIssues()).to.equal(4);
      });
    });
  });
  describe('getNumberOfEntityIssues', () => {
    let issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('returns 0', () => {
        expect(issues.getNumberOfEntityIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addEntityIssues([
          new EntityIssue({
            ruleName: Rules.RuleNames.ENT_SHORTER_DECL,
            entityName: 'A'
          })
        ]);
      });

      it('returns the total amount', () => {
        expect(issues.getNumberOfEntityIssues()).to.equal(1);
      });
    });
  });
  describe('getNumberOfEnumIssues', () => {
    let issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('returns 0', () => {
        expect(issues.getNumberOfEnumIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addEnumIssues([
          new EnumIssue({
            ruleName: Rules.RuleNames.ENUM_DUPLICATED,
            enumName: 'SuperEnum'
          })
        ]);
      });

      it('returns the total amount', () => {
        expect(issues.getNumberOfEnumIssues()).to.equal(1);
      });
    });
  });
  describe('getNumberOfFieldIssues', () => {
    let issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('returns 0', () => {
        expect(issues.getNumberOfFieldIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addFieldIssues([
          new FieldIssue({
            ruleName: Rules.RuleNames.FLD_DUPLICATED,
            fieldName: 'a',
            entityName: 'A'
          })
        ]);
      });

      it('returns the total amount', () => {
        expect(issues.getNumberOfFieldIssues()).to.equal(1);
      });
    });
  });
  describe('getNumberOfRelationshipIssues', () => {
    let issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('returns 0', () => {
        expect(issues.getNumberOfRelationshipIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addRelationshipIssues([
          new RelationshipIssue({
            ruleName: Rules.RuleNames.REL_INDIVIDUAL_DECL,
            from: 'A',
            to: 'A',
            type: RelationshipTypes.ONE_TO_ONE
          })
        ]);
      });

      it('returns the total amount', () => {
        expect(issues.getNumberOfRelationshipIssues()).to.equal(1);
      });
    });
  });
  describe('getIssues', () => {
    let issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('returns an empty object', () => {
        expect(issues.getIssues()).to.deep.equal({
          entities: [],
          enums: [],
          fields: [],
          relationships: []
        });
      });
    });
    describe('when there are issues', () => {
      let entityIssue;
      let enumIssue;
      let fieldIssue;
      let relationshipIssue;

      beforeEach(() => {
        entityIssue = new EntityIssue({
          ruleName: Rules.RuleNames.ENT_SHORTER_DECL,
          entityName: 'A'
        });
        enumIssue = new EnumIssue({
          ruleName: Rules.RuleNames.ENUM_DUPLICATED,
          enumName: 'SuperEnum'
        });
        fieldIssue = new FieldIssue({
          ruleName: Rules.RuleNames.FLD_DUPLICATED,
          fieldName: 'a',
          entityName: 'A'
        });
        relationshipIssue = new RelationshipIssue({
          ruleName: Rules.RuleNames.REL_INDIVIDUAL_DECL,
          from: 'A',
          to: 'A',
          type: RelationshipTypes.ONE_TO_ONE
        });

        issues.addEntityIssues([entityIssue]);
        issues.addEnumIssues([enumIssue]);
        issues.addFieldIssues([fieldIssue]);
        issues.addRelationshipIssues([relationshipIssue]);
      });

      it('returns the object containing the issues', () => {
        expect(issues.getIssues()).to.deep.equal({
          entities: [entityIssue],
          enums: [enumIssue],
          fields: [fieldIssue],
          relationships: [relationshipIssue]
        });
      });
    });
  });
});
