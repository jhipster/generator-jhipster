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

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const VALIDATIONS = require('../../../../lib/core/jhipster/validations').VALIDATIONS;
const exists = require('../../../../lib/core/jhipster/validations').exists;
const needsValue = require('../../../../lib/core/jhipster/validations').needsValue;

describe('VALIDATIONS', () => {
  describe('::exists', () => {
    describe('when checking for a valid validation', () => {
      it('returns true', () => {
        expect(exists(VALIDATIONS.MAXBYTES)).to.be.true;
      });
    });
    describe('when checking for an invalid validation', () => {
      it('returns false', () => {
        expect(exists('NOTHING')).to.be.false;
      });
    });
  });
  describe('::needsValue', () => {
    describe('when checking whether a validation needs a value', () => {
      it('returns so', () => {
        expect(needsValue(VALIDATIONS.MAXLENGTH)).to.be.true;
        expect(needsValue(VALIDATIONS.REQUIRED)).to.be.false;
      });
    });
  });
});
