/** Copyright 2013-2019 the original author or authors from the JHipster project.
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
const JDLEnum = require('../../../lib/core/jdl_enum');
const EnumValidator = require('../../../lib/exceptions/enum_validator');

describe('EnumValidator', () => {
  let validator;

  before(() => {
    validator = new EnumValidator();
  });

  describe('validate', () => {
    context('when not passing anything', () => {
      it('should fail', () => {
        expect(() => validator.validate()).to.throw(/^No enum\.$/);
      });
    });
    context('when passing an enum', () => {
      context('with all its required attributes', () => {
        let jdlEnum;

        before(() => {
          jdlEnum = new JDLEnum({
            name: 'a'
          });
        });

        it('should not fail', () => {
          expect(() => validator.validate(jdlEnum)).not.to.throw();
        });
      });
      context('when not passing any attribute', () => {
        it('should fail', () => {
          expect(() => validator.validate({})).to.throw(/^The enum attribute name was not found\.$/);
        });
      });
      context('with a reserved class name as name', () => {
        it('should fail', () => {
          expect(() => {
            validator.validate(new JDLEnum({ name: 'Catch' }));
          }).to.throw(/^The enum name 'Catch' is reserved keyword and can not be used as enum class name\.$/);
        });
      });
    });
  });
});
