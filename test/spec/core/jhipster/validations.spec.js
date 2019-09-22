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

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');
const Validations = require('../../../../lib/core/jhipster/validations');

describe('Validations', () => {
  describe('::exists', () => {
    describe('when checking for a valid validation', () => {
      it('returns true', () => {
        expect(Validations.exists(Validations.MAXBYTES)).to.be.true;
      });
    });
    describe('when checking for an invalid validation', () => {
      it('returns false', () => {
        expect(Validations.exists('NOTHING')).to.be.false;
      });
    });
  });
  describe('::needsValue', () => {
    describe('when checking whether a validation needs a value', () => {
      it('returns so', () => {
        expect(Validations.needsValue(Validations.MAXLENGTH)).to.be.true;
        expect(Validations.needsValue(Validations.REQUIRED)).to.be.false;
      });
    });
  });
});
