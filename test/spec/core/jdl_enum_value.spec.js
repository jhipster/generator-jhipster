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
const JDLEnumValue = require('../../../lib/core/jdl_enum_value');

describe('JDLEnumValue', () => {
  describe('new', () => {
    context('when not passing an enum value name', () => {
      it('should fail', () => {
        expect(() => new JDLEnumValue()).to.throw(/^The enum value name has to be passed to create an enum\.$/);
      });
    });
  });
  describe('toString', () => {
    context('without a specified enum value', () => {
      let enumValue;

      before(() => {
        enumValue = new JDLEnumValue('FRENCH');
      });

      it('should omit it', () => {
        expect(enumValue.toString()).to.equal('FRENCH');
      });
    });
    context('with a specified enum value', () => {
      let enumValue;

      before(() => {
        enumValue = new JDLEnumValue('FRENCH', 'frenchy');
      });

      it('should include it', () => {
        expect(enumValue.toString()).to.equal('FRENCH (frenchy)');
      });
    });
  });
});
