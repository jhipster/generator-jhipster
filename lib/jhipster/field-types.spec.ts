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

import { describe, it } from 'esmocha';
import { expect } from 'chai';

import validations from '../jdl/core/built-in-options/validations.js';
import fieldTypes from './field-types.js';

const {
  Validations: { MIN, MAXLENGTH, PATTERN },
} = validations;

describe('jdl - FieldTypes', () => {
  describe('isCommonDBType', () => {
    describe('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error invalid argument
          fieldTypes.isCommonDBType(null);
        }).to.throw(/^The passed type must not be nil\.$/);
        expect(() => {
          fieldTypes.isCommonDBType('');
        }).to.throw(/^The passed type must not be nil\.$/);
      });
    });
    describe('when passing a false type', () => {
      it('should return false', () => {
        expect(fieldTypes.isCommonDBType('UNKNOWN-TYPE')).to.be.false;
      });
    });
    describe('when passing a valid type', () => {
      it('should return true', () => {
        expect(fieldTypes.isCommonDBType(fieldTypes.CommonDBTypes.BIG_DECIMAL)).to.be.true;
      });
    });
  });
  describe('getIsType', () => {
    describe('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          fieldTypes.getIsType(null);
        }).to.throw(/^The passed type must not be nil\.$/);
        expect(() => {
          // @ts-expect-error
          fieldTypes.getIsType(null, () => {
            // do nothing
          });
        }).to.throw(/^The passed type must not be nil\.$/);
      });
    });
  });
  describe('hasValidation', () => {
    describe('when passing an invalid argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          fieldTypes.hasValidation();
        }).to.throw(/^The passed type and value must not be nil\.$/);
        expect(() => {
          // @ts-expect-error invalid argument
          fieldTypes.hasValidation(null, MAXLENGTH);
        }).to.throw(/^The passed type and value must not be nil\.$/);
        expect(() => {
          // @ts-expect-error
          fieldTypes.hasValidation('UNKNOWN-TYPE');
        }).to.throw(/^The passed type and value must not be nil\.$/);
      });
    });
    describe('when passing a false argument', () => {
      it('should return false', () => {
        expect(fieldTypes.hasValidation(fieldTypes.CommonDBTypes.BIG_DECIMAL, PATTERN)).to.be.false;
      });
    });
    describe('when passing a valid argument', () => {
      it('should return true', () => {
        expect(fieldTypes.hasValidation(fieldTypes.CommonDBTypes.BIG_DECIMAL, MIN)).to.be.true;
      });
    });
  });
});
