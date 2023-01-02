/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { expect } from 'chai';
import Issues from '../../../../jdl/linters/issues/issues.js';
import { rulesNames } from '../../../../jdl/linters/rules.js';
import { relationshipTypes } from '../../../../jdl/jhipster/index.mjs';
import EntityIssue from '../../../../jdl/linters/issues/entity-issue.js';
import FieldIssue from '../../../../jdl/linters/issues/field-issue.js';
import EnumIssue from '../../../../jdl/linters/issues/enum-issue.js';
import RelationshipIssue from '../../../../jdl/linters/issues/relationship-issue.js';

describe('Issues', () => {
  describe('getNumberOfIssues', () => {
    let issues: Issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('should return 0', () => {
        expect(issues.getNumberOfIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addEntityIssues([
          new EntityIssue({
            ruleName: rulesNames.ENT_SHORTER_DECL,
            entityName: 'A',
          }),
        ]);
        issues.addEnumIssues([
          new EnumIssue({
            ruleName: rulesNames.ENUM_DUPLICATED,
            enumName: 'SuperEnum',
          }),
        ]);
        issues.addFieldIssues([
          new FieldIssue({
            ruleName: rulesNames.FLD_DUPLICATED,
            fieldName: 'a',
            entityName: 'A',
          }),
        ]);
        issues.addRelationshipIssues([
          new RelationshipIssue({
            ruleName: rulesNames.REL_INDIVIDUAL_DECL,
            from: 'A',
            to: 'A',
            type: relationshipTypes.ONE_TO_ONE,
          }),
        ]);
      });

      it('should return the total amount', () => {
        expect(issues.getNumberOfIssues()).to.equal(4);
      });
    });
  });
  describe('getNumberOfEntityIssues', () => {
    let issues: Issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('should return 0', () => {
        expect(issues.getNumberOfEntityIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addEntityIssues([
          new EntityIssue({
            ruleName: rulesNames.ENT_SHORTER_DECL,
            entityName: 'A',
          }),
        ]);
      });

      it('should return the total amount', () => {
        expect(issues.getNumberOfEntityIssues()).to.equal(1);
      });
    });
  });
  describe('getNumberOfEnumIssues', () => {
    let issues: Issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('should return 0', () => {
        expect(issues.getNumberOfEnumIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addEnumIssues([
          new EnumIssue({
            ruleName: rulesNames.ENUM_DUPLICATED,
            enumName: 'SuperEnum',
          }),
        ]);
      });

      it('should return the total amount', () => {
        expect(issues.getNumberOfEnumIssues()).to.equal(1);
      });
    });
  });
  describe('getNumberOfFieldIssues', () => {
    let issues: Issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('should return 0', () => {
        expect(issues.getNumberOfFieldIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addFieldIssues([
          new FieldIssue({
            ruleName: rulesNames.FLD_DUPLICATED,
            fieldName: 'a',
            entityName: 'A',
          }),
        ]);
      });

      it('should return the total amount', () => {
        expect(issues.getNumberOfFieldIssues()).to.equal(1);
      });
    });
  });
  describe('getNumberOfRelationshipIssues', () => {
    let issues: Issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('should return 0', () => {
        expect(issues.getNumberOfRelationshipIssues()).to.equal(0);
      });
    });
    describe('when there are issues', () => {
      beforeEach(() => {
        issues.addRelationshipIssues([
          new RelationshipIssue({
            ruleName: rulesNames.REL_INDIVIDUAL_DECL,
            from: 'A',
            to: 'A',
            type: relationshipTypes.ONE_TO_ONE,
          }),
        ]);
      });

      it('should return the total amount', () => {
        expect(issues.getNumberOfRelationshipIssues()).to.equal(1);
      });
    });
  });
  describe('getIssues', () => {
    let issues: Issues;

    beforeEach(() => {
      issues = new Issues();
    });

    describe('when there is no issue', () => {
      it('should return an empty object', () => {
        expect(issues.getIssues()).to.deep.equal({
          entities: [],
          enums: [],
          fields: [],
          relationships: [],
        });
      });
    });
    describe('when there are issues', () => {
      let entityIssue: EntityIssue;
      let enumIssue: EnumIssue;
      let fieldIssue: FieldIssue;
      let relationshipIssue: RelationshipIssue;

      beforeEach(() => {
        entityIssue = new EntityIssue({
          ruleName: rulesNames.ENT_SHORTER_DECL,
          entityName: 'A',
        });
        enumIssue = new EnumIssue({
          ruleName: rulesNames.ENUM_DUPLICATED,
          enumName: 'SuperEnum',
        });
        fieldIssue = new FieldIssue({
          ruleName: rulesNames.FLD_DUPLICATED,
          fieldName: 'a',
          entityName: 'A',
        });
        relationshipIssue = new RelationshipIssue({
          ruleName: rulesNames.REL_INDIVIDUAL_DECL,
          from: 'A',
          to: 'A',
          type: relationshipTypes.ONE_TO_ONE,
        });

        issues.addEntityIssues([entityIssue]);
        issues.addEnumIssues([enumIssue]);
        issues.addFieldIssues([fieldIssue]);
        issues.addRelationshipIssues([relationshipIssue]);
      });

      it('should return the object containing the issues', () => {
        expect(issues.getIssues()).to.deep.equal({
          entities: [entityIssue],
          enums: [enumIssue],
          fields: [fieldIssue],
          relationships: [relationshipIssue],
        });
      });
    });
  });
});
