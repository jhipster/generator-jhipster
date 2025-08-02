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

import { beforeEach, describe, expect as jestExpect, it } from 'esmocha';
import { readFileSync, writeFileSync } from 'node:fs';

import { expect } from 'chai';
import helpers from 'yeoman-test';

import { createJDLLinterFromContent, getTestFile } from '.././__test-support__/index.ts';

import type EntityIssue from './issues/entity-issue.js';
import type EnumIssue from './issues/enum-issue.js';
import type Issues from './issues/issues.js';
import type relationshipIssue from './issues/relationship-issue.js';
import type { JDLLinter } from './jdl-linter.js';

/**
 * Creates a new JDL linters from a JDL file.
 * @param file - the JDL file.
 * @return {Object} the JDL linters.
 * @throws {Error} if the JDL file isn't passed.
 */
export function createJDLLinterFromFile(file: string): JDLLinter {
  if (!file) {
    throw new Error('A JDL file must be passed to create a new JDL linter.');
  }
  const jdlString = readFileSync(file, 'utf-8');
  return createJDLLinterFromContent(jdlString);
}

describe('jdl - JDLLinter', () => {
  beforeEach(async () => {
    await helpers.prepareTemporaryDir();
  });
  describe('createJDLLinterFromFile', () => {
    describe('when not passing a file', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => createJDLLinterFromFile(undefined)).to.throw(/^A JDL file must be passed to create a new JDL linter\.$/);
      });
    });
    describe('when passing a file', () => {
      let path: string;

      beforeEach(() => {
        path = 'test.jdl';
        writeFileSync(path, 'entity A');
      });

      it('should not fail', () => {
        expect(() => createJDLLinterFromFile(path)).not.to.throw();
      });
    });
  });
  describe('createJDLLinterFromContent', () => {
    describe('when not passing a content', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => createJDLLinterFromContent(undefined)).to.throw(/^A JDL content must be passed to create a new JDL linter\.$/);
      });
    });
    describe('when passing a content', () => {
      it('should not fail', () => {
        expect(() => createJDLLinterFromContent('entity A')).not.to.throw();
      });
    });
  });
  describe('check', () => {
    describe('when checking for useless entity braces', () => {
      let linter: JDLLinter;
      let issue: EntityIssue;
      let reportedIssues: Issues;

      beforeEach(() => {
        linter = createJDLLinterFromFile(getTestFile('lint', 'useless_entity_curly_braces.jdl'));
        reportedIssues = linter.check();
        const issues = reportedIssues.getIssues();
        issue = issues.entities[0];
      });

      it('reports the issue', () => {
        expect(reportedIssues.getNumberOfIssues()).to.equal(1);
        expect(issue.ruleName).to.equal('ENT_SHORTER_DECL');
      });
    });
    describe('when checking for duplicated', () => {
      describe('entities', () => {
        let linter: JDLLinter;
        let reportedIssues: { getIssues: () => any; getNumberOfIssues: () => any };
        let issueForA: { ruleName: any };
        let issueForB: { ruleName: any };

        beforeEach(() => {
          linter = createJDLLinterFromFile(getTestFile('lint', 'duplicate_entities.jdl'));
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
      describe('fields', () => {
        let linter: JDLLinter;
        let reportedIssues: { getIssues: () => any; getNumberOfIssues: () => any };
        let issueForAa: { ruleName: any };
        let issueForBb: { ruleName: any };

        beforeEach(() => {
          linter = createJDLLinterFromFile(getTestFile('lint', 'duplicate_fields.jdl'));
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
      describe('enums', () => {
        let linter: JDLLinter;
        let reportedIssues: { getIssues: () => any; getNumberOfIssues: () => any };
        let issueForA: { ruleName: any };

        beforeEach(() => {
          linter = createJDLLinterFromFile(getTestFile('lint', 'duplicate_enums.jdl'));
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
    describe('when checking for unused enums', () => {
      let linter: JDLLinter;
      let reportedIssues: Issues;
      let issueFor2: EnumIssue;
      let issueFor3: EnumIssue;

      beforeEach(() => {
        linter = createJDLLinterFromFile(getTestFile('lint', 'unused_enums.jdl'));
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
    describe('when checking for collapsible relationships', () => {
      let linter: JDLLinter;
      let reportedIssues: Issues;
      let issueForAToB: relationshipIssue;
      let issueForBToC: relationshipIssue;
      let issueForAToC: relationshipIssue;

      beforeEach(() => {
        linter = createJDLLinterFromFile(getTestFile('lint', 'ungrouped_relationships.jdl'));
        reportedIssues = linter.check();
        const issues = reportedIssues.getIssues();
        issueForAToB = issues.relationships[0];
        issueForBToC = issues.relationships[1];
        issueForAToC = issues.relationships[2];
      });

      it('reports the issues', () => {
        expect(reportedIssues.getNumberOfIssues()).to.equal(3);
        jestExpect(issueForAToB).toMatchInlineSnapshot(`
RelationshipIssue {
  "from": "A",
  "ruleName": "REL_INDIVIDUAL_DECL",
  "to": "B",
  "type": "OneToMany",
}
`);
        jestExpect(issueForBToC).toMatchInlineSnapshot(`
RelationshipIssue {
  "from": "B",
  "ruleName": "REL_INDIVIDUAL_DECL",
  "to": "C",
  "type": "OneToMany",
}
`);
        jestExpect(issueForAToC).toMatchInlineSnapshot(`
RelationshipIssue {
  "from": "A",
  "ruleName": "REL_INDIVIDUAL_DECL",
  "to": "C",
  "type": "OneToMany",
}
`);
      });
    });
  });
});
