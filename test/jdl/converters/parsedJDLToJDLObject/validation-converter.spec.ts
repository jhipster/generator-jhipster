/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import { jestExpect as expect } from 'mocha-expect-snapshot';
import { convertValidations } from '../../../../jdl/converters/parsed-jdl-to-jdl-object/validation-converter.js';

describe('ValidationConverter', () => {
  describe('convertValidations', () => {
    context('when not passing validations', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => convertValidations()).toThrow(/^Validations have to be passed so as to be converted.$/);
      });
    });
    context('when passing validations', () => {
      context('with all the attributes', () => {
        let convertedJDLValidations;

        before(() => {
          convertedJDLValidations = convertValidations([{ key: 'min', value: 0 }], () => {});
        });

        it('should convert it', () => {
          expect(convertedJDLValidations).toMatchInlineSnapshot(`
Array [
  JDLValidation {
    "name": "min",
    "value": 0,
  },
]
`);
        });
      });
      context('having for value a constant', () => {
        let valueFromTheConvertedValidation;

        before(() => {
          const getConstantValue = () => 42;
          const convertedJDLValidations = convertValidations([{ key: 'min', value: 'MINIMUM', constant: true }], getConstantValue);
          valueFromTheConvertedValidation = convertedJDLValidations[0].value;
        });

        it('should use it', () => {
          expect(valueFromTheConvertedValidation).toEqual(42);
        });
      });
      context('having for name the pattern validation', () => {
        context('with the pattern not having single quotes', () => {
          let valueFromTheConvertedValidation;

          before(() => {
            const convertedJDLValidations = convertValidations(
              [
                {
                  key: 'pattern',
                  value: '/d+/',
                },
              ],
              () => {}
            );
            valueFromTheConvertedValidation = convertedJDLValidations[0].value;
          });

          it('should not format the value', () => {
            expect(valueFromTheConvertedValidation).toMatch('/d+/');
          });
        });
        context('with the pattern having single quotes', () => {
          let valueFromTheConvertedValidation;

          before(() => {
            const convertedJDLValidations = convertValidations(
              [
                {
                  key: 'pattern',
                  value: "/[A-Z']/",
                },
              ],
              () => {}
            );
            valueFromTheConvertedValidation = convertedJDLValidations[0].value;
          });

          it('should format it', () => {
            expect(valueFromTheConvertedValidation).toMatch("/[A-Z\\\\']/\\");
          });
        });
      });
      context('having one falsy element', () => {
        let convertedJDLValidations;

        before(() => {
          convertedJDLValidations = convertValidations([null, { key: 'min', value: 0 }, undefined], () => {});
        });

        it('should ignore it', () => {
          expect(convertedJDLValidations).toMatchInlineSnapshot(`
Array [
  JDLValidation {
    "name": "min",
    "value": 0,
  },
]
`);
        });
      });
    });
  });
});
