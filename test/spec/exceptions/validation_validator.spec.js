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
const JDLValidation = require('../../../lib/core/jdl_validation');
const ValidationValidator = require('../../../lib/exceptions/validation_validator');

describe('ValidationValidator', () => {
  let validator;

  before(() => {
    validator = new ValidationValidator();
  });

  describe('validate', () => {
    context('when not passing anything', () => {
      it('should fail', () => {
        expect(() => validator.validate()).to.throw(/^No validation\.$/);
      });
    });
    context('when passing a validation', () => {
      context('with all its required attributes', () => {
        it('should not fail', () => {
          expect(() => validator.validate({ name: 'required' })).not.to.throw();
        });
      });
      context('without any of its required attributes', () => {
        it('should fail', () => {
          expect(() => validator.validate({})).to.throw(/^The validation attribute name was not found\.$/);
        });
      });
      context('when passing an invalid name for a validation', () => {
        let validation;

        before(() => {
          validation = new JDLValidation({
            name: 'min',
            value: 0
          });
          validation.name = 'toto';
        });

        it('should fail', () => {
          expect(() => validator.validate(validation)).to.throw(/^The validation toto doesn't exist\.$/);
        });
      });
      context('when not passing a value when required', () => {
        let validation;

        before(() => {
          validation = new JDLValidation({
            name: 'min',
            value: 0
          });
          delete validation.value;
        });

        it('should fail', () => {
          expect(() => validator.validate(validation)).to.throw(/^The validation min requires a value\.$/);
        });
      });
    });
  });
});
