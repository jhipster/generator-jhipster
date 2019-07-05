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
const JDLEnum = require('../../../lib/core/jdl_enum');

describe('JDLEnum', () => {
  describe('::new', () => {
    context('when not passing any argument', () => {
      it('fails', () => {
        expect(() => {
          new JDLEnum();
        }).to.throw("The enum's name must be passed to create an enum.");
      });
    });
    context('when not passing a name', () => {
      it('fails', () => {
        expect(() => {
          new JDLEnum({ values: ['ABC'], comment: 'My enumeration.' });
        }).to.throw("The enum's name must be passed to create an enum.");
      });
    });
    context('when passing arguments', () => {
      it('uses them', () => {
        new JDLEnum({ name: 'MyEnum', values: ['ABC'] });
      });
    });
  });
  describe('#addValue', () => {
    let jdlEnum = null;

    before(() => {
      jdlEnum = new JDLEnum({ name: 'MyEnum' });
    });

    context('when not passing a value', () => {
      it('fails', () => {
        expect(() => {
          jdlEnum.addValue(null);
        }).to.throw('A valid value must be passed to be added to the enum, got nil');
      });
    });
    context('when passing a value', () => {
      before(() => {
        jdlEnum.addValue(42);
      });

      it('adds it', () => {
        expect(jdlEnum.toString()).to.equal('enum MyEnum {\n  42\n}');
      });
    });
  });
  describe('#getValuesAsString', () => {
    let result;

    before(() => {
      const jdlEnum = new JDLEnum({ name: 'Toto', values: ['A', 'B'] });
      result = jdlEnum.getValuesAsString();
    });

    it('returns the values separated by a comma', () => {
      expect(result).to.equal('A,B');
    });
  });
  describe('::isValid', () => {
    context('when validating an invalid object', () => {
      context('with no name', () => {
        it('returns false', () => {
          expect(JDLEnum.isValid({ values: ['A', 'B'] })).to.be.false;
        });
      });
    });
  });
  describe('#toString', () => {
    let values = [];
    let jdlEnum = null;

    before(() => {
      values = ['FRENCH', 'ENGLISH', 'ICELANDIC'];
      jdlEnum = new JDLEnum({
        name: 'Language',
        values,
        comment: 'The language enumeration.'
      });
    });

    it('stringifies the enum', () => {
      expect(jdlEnum.toString()).to.eq(
        `/**
 * ${jdlEnum.comment}
 */
enum ${jdlEnum.name} {
  ${values.join(',\n  ')}
}`
      );
    });
  });
});
