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

import JDLBinaryOption from '../../core/models/jdl-binary-option.ts';

import BinaryOptionValidator from './binary-option-validator.ts';

describe('jdl - BinaryOptionValidator', () => {
  let validator: BinaryOptionValidator;

  before(() => {
    validator = new BinaryOptionValidator();
  });

  describe('validate', () => {
    describe('when not passing anything', () => {
      it('should fail', () => {
        // @ts-expect-error FIXME
        expect(() => validator.validate()).to.throw(/^No binary option\.$/);
      });
    });
    it('should fail', () => {
      // @ts-expect-error FIXME
      expect(() => validator.validate({})).to.throw(
        /^The binary option attributes name, entityNames, excludedNames, getType, value were not found\.$/,
      );
    });
    describe('when passing a binary option', () => {
      describe('with all its required attributes', () => {
        it('should not fail', () => {
          expect(() => validator.validate(new JDLBinaryOption({ name: 'dto', value: 'mapstruct' }))).not.to.throw();
        });
      });
      describe('with an invalid value', () => {
        it('should fail', () => {
          expect(() => validator.validate(new JDLBinaryOption({ name: 'dto', value: 'toto' }))).to.throw(
            /^The 'dto' option is not valid for value 'toto'\.$/,
          );
        });
      });
    });
  });
});
