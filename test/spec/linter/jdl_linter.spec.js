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

/* eslint-disable no-new, no-unused-expressions */

const { writeFileSync, unlinkSync } = require('fs');
const path = require('path');
const { expect } = require('chai');
const { createJDLLinterFromFile, createJDLLinterFromContent } = require('../../../lib/linter/jdl_linter');

describe('JDLLinter', () => {
  describe('createJDLLinterFromFile', () => {
    context('when not passing a file', () => {
      it('should fail', () => {
        expect(() => createJDLLinterFromFile(undefined)).to.throw(
          /^A JDL file must be passed to create a new JDL linter\.$/
        );
      });
    });
    context('when passing a file', () => {
      let path;

      before(() => {
        path = 'test.jdl';
        writeFileSync(path, 'entity A');
      });

      after(() => {
        unlinkSync(path);
      });

      it('should not fail', () => {
        expect(() => createJDLLinterFromFile(path)).not.to.throw();
      });
    });
  });
  describe('createJDLLinterFromContent', () => {
    context('when not passing a content', () => {
      it('should fail', () => {
        expect(() => createJDLLinterFromContent(undefined)).to.throw(
          /^A JDL content must be passed to create a new JDL linter.$/
        );
      });
    });
    context('when passing a content', () => {
      it('should not fail', () => {
        expect(() => createJDLLinterFromContent('entity A')).not.to.throw();
      });
    });
  });
  describe('#check', () => {
    context('when checking for useless entity braces', () => {
      let linter;
      let issue;
      let reportedIssues;

      before(() => {
        linter = createJDLLinterFromFile(path.join('test', 'test_files', 'lint', 'useless_entity_curly_braces.jdl'));
        reportedIssues = linter.check();
        const issues = reportedIssues.getIssues();
        issue = issues.entities[0];
      });

      it('reports the issue', () => {
        expect(reportedIssues.getNumberOfIssues()).to.equal(1);
        expect(issue.ruleName).to.equal('ENT_SHORTER_DECL');
      });
    });
    context('when checking for useless table names', () => {
      let linter;
      let issueForB;
      let issueForToto;
      let issueForSuperToto;
      let reportedIssues;

      before(() => {
        linter = createJDLLinterFromFile(path.join('test', 'test_files', 'lint', 'useless_table_names.jdl'));
        reportedIssues = linter.check();
        const issues = reportedIssues.getIssues();
        issueForB = issues.entities[0];
        issueForToto = issues.entities[1];
        issueForSuperToto = issues.entities[2];
      });

      it('reports the issues', () => {
        expect(reportedIssues.getNumberOfIssues()).to.equal(3);
        expect(issueForB.ruleName).to.equal('ENT_OPTIONAL_TABLE_NAME');
        expect(issueForToto.ruleName).to.equal('ENT_OPTIONAL_TABLE_NAME');
        expect(issueForSuperToto.ruleName).to.equal('ENT_OPTIONAL_TABLE_NAME');
      });
    });
    context('when checking for duplicated', () => {
      context('entities', () => {
        let linter;
        let reportedIssues;
        let issueForA;
        let issueForB;

        before(() => {
          linter = createJDLLinterFromFile(path.join('test', 'test_files', 'lint', 'duplicate_entities.jdl'));
          reportedIssues = linter.check();
          const issues = reportedIssues.getIssues();
          issueForA = issues.entities[0];
          issueForB = issues.entities[1];
        });

        it('reports the issues', () => {
          expect(reportedIssues.getNumberOfIssues()).to.equal(2);
          expect(issueForA.ruleName).to.equal('ENT_DUPLICATED');
          expect(issueForB.ruleName).to.equal('ENT_DUPLICATED');
        });
      });
      context('fields', () => {
        let linter;
        let reportedIssues;
        let issueForAa;
        let issueForBb;

        before(() => {
          linter = createJDLLinterFromFile(path.join('test', 'test_files', 'lint', 'duplicate_fields.jdl'));
          reportedIssues = linter.check();
          const issues = reportedIssues.getIssues();
          issueForAa = issues.fields[0];
          issueForBb = issues.fields[1];
        });

        it('reports the issues', () => {
          expect(reportedIssues.getNumberOfIssues()).to.equal(2);
          expect(issueForAa.ruleName).to.equal('FLD_DUPLICATED');
          expect(issueForBb.ruleName).to.equal('FLD_DUPLICATED');
        });
      });
      context('enums', () => {
        let linter;
        let reportedIssues;
        let issueForA;

        before(() => {
          linter = createJDLLinterFromFile(path.join('test', 'test_files', 'lint', 'duplicate_enums.jdl'));
          reportedIssues = linter.check();
          const issues = reportedIssues.getIssues();
          issueForA = issues.enums[0];
        });

        it('reports the issues', () => {
          expect(reportedIssues.getNumberOfIssues()).to.equal(1);
          expect(issueForA.ruleName).to.equal('ENUM_DUPLICATED');
        });
      });
    });
    context('when checking for unused enums', () => {
      let linter;
      let reportedIssues;
      let issueFor2;
      let issueFor3;

      before(() => {
        linter = createJDLLinterFromFile(path.join('test', 'test_files', 'lint', 'unused_enums.jdl'));
        reportedIssues = linter.check();
        const issues = reportedIssues.getIssues();
        issueFor2 = issues.enums[0];
        issueFor3 = issues.enums[1];
      });

      it('reports the issues', () => {
        expect(reportedIssues.getNumberOfIssues()).to.equal(2);
        expect(issueFor2.ruleName).to.equal('ENUM_UNUSED');
        expect(issueFor3.ruleName).to.equal('ENUM_UNUSED');
      });
    });
    context('when checking for collapsible relationships', () => {
      let linter;
      let reportedIssues;
      let issueForAToB;
      let issueForBToC;
      let issueForAToC;

      before(() => {
        linter = createJDLLinterFromFile(path.join('test', 'test_files', 'lint', 'ungrouped_relationships.jdl'));
        reportedIssues = linter.check();
        const issues = reportedIssues.getIssues();
        issueForAToB = issues.relationships[0];
        issueForBToC = issues.relationships[1];
        issueForAToC = issues.relationships[2];
      });

      it('reports the issues', () => {
        expect(reportedIssues.getNumberOfIssues()).to.equal(3);
        expect(issueForAToB).to.deep.equal({
          from: 'A',
          ruleName: 'REL_INDIVIDUAL_DECL',
          to: 'B',
          type: 'OneToMany'
        });
        expect(issueForBToC).to.deep.equal({
          from: 'B',
          ruleName: 'REL_INDIVIDUAL_DECL',
          to: 'C',
          type: 'OneToMany'
        });
        expect(issueForAToC).to.deep.equal({
          from: 'A',
          ruleName: 'REL_INDIVIDUAL_DECL',
          to: 'C',
          type: 'OneToMany'
        });
      });
    });
  });
});
