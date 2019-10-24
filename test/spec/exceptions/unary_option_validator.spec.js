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
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const UnaryOptionValidator = require('../../../lib/exceptions/unary_option_validator');

describe('UnaryOptionValidator', () => {
  let validator;

  before(() => {
    validator = new UnaryOptionValidator();
  });

  describe('validate', () => {
    context('when not passing anything', () => {
      it('should fail', () => {
        expect(() => validator.validate()).to.throw(/^No unary option\.$/);
      });
    });
    context('when passing an unary option', () => {
      context('with all its required attributes', () => {
        it('should not fail', () => {
          expect(() => validator.validate(new JDLUnaryOption({ name: 'skipClient' }))).not.to.throw();
        });
      });
      context('without any of its required attributes', () => {
        it('should fail', () => {
          expect(() => validator.validate({})).to.throw(
            /^The unary option attributes name, entityNames, excludedNames, getType were not found\.$/
          );
        });
      });
    });
  });
});
