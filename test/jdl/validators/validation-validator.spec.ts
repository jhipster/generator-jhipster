/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { expect } from 'chai';
import JDLValidation from '../../../jdl/models/jdl-validation.js';
import ValidationValidator from '../../../jdl/validators/validation-validator.js';

describe('jdl - ValidationValidator', () => {
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
            value: 0,
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
            value: 0,
          });
          delete validation.value;
        });

        it('should fail', () => {
          expect(() => validator.validate(validation)).to.throw(/^The validation min requires a value\.$/);
        });
      });
      context('when passing a decimal value for a numeric validation', () => {
        context('such as minlength', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate(
                new JDLValidation({
                  name: 'minlength',
                  value: 0.001,
                })
              )
            ).to.throw(/^Decimal values are forbidden for the minlength validation.$/);
          });
        });
        context('such as maxlength', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate(
                new JDLValidation({
                  name: 'maxlength',
                  value: 0.001,
                })
              )
            ).to.throw(/^Decimal values are forbidden for the maxlength validation.$/);
          });
        });
        context('such as minbytes', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate(
                new JDLValidation({
                  name: 'minbytes',
                  value: 0.001,
                })
              )
            ).to.throw(/^Decimal values are forbidden for the minbytes validation.$/);
          });
        });
        context('such as maxbytes', () => {
          it('should fail', () => {
            expect(() =>
              validator.validate(
                new JDLValidation({
                  name: 'maxbytes',
                  value: 0.001,
                })
              )
            ).to.throw(/^Decimal values are forbidden for the maxbytes validation.$/);
          });
        });
      });
    });
  });
});
