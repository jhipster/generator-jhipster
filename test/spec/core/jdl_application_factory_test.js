/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const { createJDLApplication } = require('../../../lib/core/jdl_application_factory');
const { MONOLITH, MICROSERVICE, GATEWAY, UAA } = require('../../../lib/core/jhipster/application_types');

describe('JDLApplicationFactory', () => {
  describe('createJDLApplication', () => {
    context('when passing an invalid config', () => {
      it('fails', () => {
        expect(() => {
          createJDLApplication({ applicationType: 'toto' });
        }).to.throw('Unknown application type: toto');
      });
    });
    context(`when passing a ${MICROSERVICE} config`, () => {
      let application;

      before(() => {
        application = createJDLApplication({ applicationType: MICROSERVICE });
      });

      it('creates the app', () => {
        expect(application.config.applicationType).to.equal(MICROSERVICE);
      });
    });
    context(`when passing a ${GATEWAY} config`, () => {
      let application;

      before(() => {
        application = createJDLApplication({ applicationType: GATEWAY });
      });

      it('creates the app', () => {
        expect(application.config.applicationType).to.equal(GATEWAY);
      });
    });
    context(`when passing a ${MONOLITH} config`, () => {
      let application;

      before(() => {
        application = createJDLApplication({ applicationType: MONOLITH });
      });

      it('creates the app', () => {
        expect(application.config.applicationType).to.equal(MONOLITH);
      });
    });
    context(`when passing a ${UAA} config`, () => {
      let application;

      before(() => {
        application = createJDLApplication({ applicationType: UAA });
      });

      it('creates the app', () => {
        expect(application.config.applicationType).to.equal(UAA);
      });
    });
  });
});
