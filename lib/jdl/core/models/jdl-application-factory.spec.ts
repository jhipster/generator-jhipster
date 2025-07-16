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

import { before, describe, it } from 'esmocha';
import { expect } from 'chai';
import { createJDLApplication } from '../models/jdl-application-factory.js';
import { createRuntime } from '../runtime.js';
import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MICROSERVICE, APPLICATION_TYPE_MONOLITH } from '../../../core/application-types.js';

const runtime = createRuntime();

describe('jdl - JDLApplicationFactory', () => {
  describe('createJDLApplication', () => {
    describe(`when passing a ${APPLICATION_TYPE_MICROSERVICE} config`, () => {
      let application;

      before(() => {
        application = createJDLApplication({ applicationType: APPLICATION_TYPE_MICROSERVICE }, undefined, runtime);
      });

      it('should create the app', () => {
        expect(application.getConfigurationOptionValue('applicationType')).to.equal(APPLICATION_TYPE_MICROSERVICE);
      });
    });
    describe(`when passing a ${APPLICATION_TYPE_GATEWAY} config`, () => {
      let application;

      before(() => {
        application = createJDLApplication({ applicationType: APPLICATION_TYPE_GATEWAY }, undefined, runtime);
      });

      it('should create the app', () => {
        expect(application.getConfigurationOptionValue('applicationType')).to.equal(APPLICATION_TYPE_GATEWAY);
      });
    });
    describe(`when passing a ${APPLICATION_TYPE_MONOLITH} config`, () => {
      let application;

      before(() => {
        application = createJDLApplication({ applicationType: APPLICATION_TYPE_MONOLITH }, undefined, runtime);
      });

      it('should create the app', () => {
        expect(application.getConfigurationOptionValue('applicationType')).to.equal(APPLICATION_TYPE_MONOLITH);
      });
    });
  });
});
