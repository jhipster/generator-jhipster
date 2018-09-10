/** Copyright 2013-2018 the original author or authors from the JHipster project.
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
const Issues = require('../../../lib/linter/issues/issues');
const EntityIssue = require('../../../lib/linter/issues/entity_issue');

describe('Issues', () => {
  describe('getEntityIssuesForEntityName', () => {
    context('when not having any issue', () => {
      it('returns an empty array', () => {
        expect(new Issues().getEntityIssuesForEntityName('A')).to.have.lengthOf(0);
      });
    });
    context('when having issues', () => {
      let issues = null;

      before(() => {
        issues = new Issues();
        issues.addEntityIssue(new EntityIssue({ ruleName: 'Toto', entityName: 'A' }));
        issues.addEntityIssue(new EntityIssue({ ruleName: 'Titi', entityName: 'A' }));
        issues.addEntityIssue(new EntityIssue({ ruleName: 'Titi', entityName: 'B' }));
      });

      it('returns them', () => {
        expect(issues.getEntityIssuesForEntityName('A')).to.have.lengthOf(2);
        expect(
          issues
            .getEntityIssuesForEntityName('A')
            .map(issue => issue.ruleName)
            .join(', ')
        ).to.equal('Toto, Titi');
      });
    });
  });
});
