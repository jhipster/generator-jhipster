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

/* eslint-disable no-new, no-unused-expressions */
import { jestExpect } from 'mocha-expect-snapshot';
import { expect } from 'chai';
import { JDLEnum } from '../../../jdl/models/index.mjs';

describe('jdl - JDLEnum', () => {
  describe('new', () => {
    context('when not passing any argument', () => {
      it('should fail', () => {
        expect(() => {
          // @ts-expect-error
          new JDLEnum();
        }).to.throw("The enum's name must be passed to create an enum.");
      });
    });
    context('when not passing a name', () => {
      it('should fail', () => {
        expect(() => {
          new JDLEnum({ values: ['ABC'], comment: 'My enumeration.' });
        }).to.throw("The enum's name must be passed to create an enum.");
      });
    });
    context('when passing arguments', () => {
      it('should use them', () => {
        new JDLEnum({ name: 'MyEnum', values: [{ key: 'ABC' }] });
      });
    });
  });
  describe('getValuesAsString', () => {
    let result;

    before(() => {
      const jdlEnum = new JDLEnum({ name: 'Toto', values: [{ key: 'A', value: 'aaaa' }, { key: 'B' }] });
      result = jdlEnum.getValuesAsString();
    });

    it('should return the values separated by a comma', () => {
      expect(result).to.equal('A (aaaa),B');
    });
  });
  describe('getValueJavadocs', () => {
    let result;

    before(() => {
      const jdlEnum = new JDLEnum({
        name: 'Toto',
        values: [
          { key: 'A', value: 'aaaa', comment: 'first comment' },
          { key: 'B', comment: 'second comment' },
        ],
      });
      result = jdlEnum.getValueJavadocs();
    });

    it('returns the comments by enum value', () => {
      jestExpect(result).toMatchInlineSnapshot(`
{
  "A": "first comment",
  "B": "second comment",
}
`);
    });
  });
  describe('toString', () => {
    context('with simple enum values', () => {
      let values: any[] = [];
      let jdlEnum;

      before(() => {
        values = [{ key: 'FRENCH' }, { key: 'ENGLISH' }, { key: 'ICELANDIC' }];
        jdlEnum = new JDLEnum({
          name: 'Language',
          values,
          comment: 'The language enumeration.',
        });
      });

      it('should stringify the enum', () => {
        expect(jdlEnum.toString()).to.equal(
          `/**
 * ${jdlEnum.comment}
 */
enum ${jdlEnum.name} {
  ${values.map(value => value.key).join(',\n  ')}
}`
        );
      });
    });
    context('with explicit enum values', () => {
      let values: any[] = [];
      let jdlEnum;

      before(() => {
        values = [{ key: 'FRENCH', value: 'french' }, { key: 'ENGLISH', value: 'english' }, { key: 'ICELANDIC' }];
        jdlEnum = new JDLEnum({
          name: 'Language',
          values,
          comment: 'The language enumeration.',
        });
      });

      it('should stringify the enum', () => {
        expect(jdlEnum.toString()).to.equal(
          `/**
 * ${jdlEnum.comment}
 */
enum ${jdlEnum.name} {
  FRENCH (french),
  ENGLISH (english),
  ICELANDIC
}`
        );
      });
    });
  });
});
