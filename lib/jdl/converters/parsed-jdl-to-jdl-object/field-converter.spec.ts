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

import { before, describe, expect, it } from 'esmocha';
import type JDLField from '../../core/models/jdl-field.js';
import { convertField } from './field-converter.ts';

describe('jdl - FieldConverter', () => {
  describe('convertField', () => {
    describe('when not passing anything', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => convertField()).toThrow(/^A field has to be passed so as to be converted.$/);
      });
    });
    describe('when passing a parsed field', () => {
      describe('with all the attributes', () => {
        let convertedField;

        before(() => {
          convertedField = convertField({
            validations: [],
            name: 'anAwesomeField',
            type: 'String',
          });
        });

        it('should convert it', () => {
          expect(convertedField).toMatchInlineSnapshot(`
JDLField {
  "comment": undefined,
  "name": "anAwesomeField",
  "options": {},
  "type": "String",
  "validations": {},
}
`);
        });
      });
      describe('with a capitalized name', () => {
        let nameFromConvertedField;

        before(() => {
          const convertedField: JDLField = convertField({
            validations: [],
            name: 'AnAwesomeField',
            type: 'String',
          });
          nameFromConvertedField = convertedField.name;
        });

        it('should lowercase it', () => {
          expect(nameFromConvertedField).toEqual('anAwesomeField');
        });
      });
      describe('with a comment', () => {
        let commentFromConvertedField;

        before(() => {
          const convertedField = convertField({
            name: 'AnAwesomeField',
            validations: [],
            type: 'String',
            documentation: 'An awesome comment!',
          });
          commentFromConvertedField = convertedField.comment;
        });

        it('should use it', () => {
          expect(commentFromConvertedField).toEqual('An awesome comment!');
        });
      });
    });
  });
});
