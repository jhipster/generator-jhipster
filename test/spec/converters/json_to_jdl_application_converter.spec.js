/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const { expect } = require('chai');
const { convertApplicationsToJDL } = require('../../../lib/converters/json_to_jdl_application_converter');
const ValidatedJDLObject = require('../../../lib/core/validated_jdl_object');
const JDLMonolithApplication = require('../../../lib/core/jdl_monolith_application');
const ApplicationTypes = require('../../../lib/core/jhipster/application_types');

describe('JSONToJDLApplicationConverter', () => {
  describe('convert', () => {
    context('when not passing any argument', () => {
      let jdlObject;

      before(() => {
        jdlObject = convertApplicationsToJDL();
      });

      it('returns an empty jdl object', () => {
        expect(jdlObject.getApplicationQuantity()).to.equal(0);
      });
    });
    context('when not passing a jdl object', () => {
      let jdlObject;

      before(() => {
        jdlObject = convertApplicationsToJDL({
          applications: [{ 'generator-jhipster': { baseName: 'toto', applicationType: ApplicationTypes.MONOLITH } }]
        });
      });

      it('returns the converted applications', () => {
        expect(jdlObject.applications.toto).to.deep.equal(new JDLMonolithApplication({ config: { baseName: 'toto' } }));
      });
    });
    context('when passing a jdl object', () => {
      let jdlObject;

      before(() => {
        const previousJDLObject = new ValidatedJDLObject();
        previousJDLObject.addApplication(
          new JDLMonolithApplication({ config: { baseName: 'tata', applicationType: ApplicationTypes.MONOLITH } })
        );
        jdlObject = convertApplicationsToJDL({
          applications: [{ 'generator-jhipster': { baseName: 'toto', applicationType: ApplicationTypes.MONOLITH } }],
          jdl: previousJDLObject
        });
      });

      it('adds the converted applications', () => {
        expect(jdlObject.applications.tata).to.deep.equal(new JDLMonolithApplication({ config: { baseName: 'tata' } }));
        expect(jdlObject.applications.toto).to.deep.equal(new JDLMonolithApplication({ config: { baseName: 'toto' } }));
      });
    });
  });
});
