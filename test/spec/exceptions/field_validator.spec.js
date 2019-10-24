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
const JDLField = require('../../../lib/core/jdl_field');
const FieldValidator = require('../../../lib/exceptions/field_validator');

describe('FieldValidator', () => {
  let validator;

  before(() => {
    validator = new FieldValidator();
  });

  describe('validate', () => {
    context('when not passing anything', () => {
      it('should fail', () => {
        expect(() => validator.validate()).to.throw(/^No field\.$/);
      });
    });
    context('when passing a field', () => {
      context('with all its required attributes', () => {
        let field;

        before(() => {
          field = new JDLField({
            name: 'a',
            type: 'String'
          });
        });

        it('should not fail', () => {
          expect(() => validator.validate(field)).not.to.throw();
        });
      });
      context('when not passing any attribute', () => {
        it('should fail', () => {
          expect(() => validator.validate({})).to.throw(/^The field attributes name, type were not found\.$/);
        });
      });
    });
  });
});
