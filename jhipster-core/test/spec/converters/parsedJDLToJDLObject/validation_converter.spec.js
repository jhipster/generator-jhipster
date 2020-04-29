/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const JDLValidation = require('../../../../lib/core/jdl_validation');
const { convertValidations } = require('../../../../lib/converters/parsedJDLToJDLObject/validation_converter');

describe('ValidationConverter', () => {
  describe('convertValidations', () => {
    context('when not passing validations', () => {
      it('should fail', () => {
        expect(() => convertValidations()).to.throw(/^Validations have to be passed so as to be converted.$/);
      });
    });
    context('when passing validations', () => {
      context('with all the attributes', () => {
        let expectedValidations;
        let convertedJDLValidations;

        before(() => {
          convertedJDLValidations = convertValidations([{ key: 'min', value: 0 }], () => {});
          expectedValidations = [new JDLValidation({ name: 'min', value: 0 })];
        });

        it('should convert it', () => {
          expect(convertedJDLValidations).to.deep.equal(expectedValidations);
        });
      });
      context('having for value a constant', () => {
        let valueFromTheConvertedValidation;

        before(() => {
          const getConstantValue = () => 42;
          const convertedJDLValidations = convertValidations(
            [{ key: 'min', value: 'MINIMUM', constant: true }],
            getConstantValue
          );
          valueFromTheConvertedValidation = convertedJDLValidations[0].value;
        });

        it('should use it', () => {
          expect(valueFromTheConvertedValidation).to.equal(42);
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
                  value: '/d+/'
                }
              ],
              () => {}
            );
            valueFromTheConvertedValidation = convertedJDLValidations[0].value;
          });

          it('should not format the value', () => {
            expect(valueFromTheConvertedValidation).to.equal('/d+/');
          });
        });
        context('with the pattern having single quotes', () => {
          let valueFromTheConvertedValidation;

          before(() => {
            const convertedJDLValidations = convertValidations(
              [
                {
                  key: 'pattern',
                  value: "/[A-Z']/"
                }
              ],
              () => {}
            );
            valueFromTheConvertedValidation = convertedJDLValidations[0].value;
          });

          it('should format it', () => {
            expect(valueFromTheConvertedValidation).to.equal("/[A-Z\\\\']/\\");
          });
        });
      });
      context('having one falsy element', () => {
        let expectedValidations;
        let convertedJDLValidations;

        before(() => {
          convertedJDLValidations = convertValidations([null, { key: 'min', value: 0 }, undefined], () => {});
          expectedValidations = [new JDLValidation({ name: 'min', value: 0 })];
        });

        it('should ignore it', () => {
          expect(convertedJDLValidations).to.deep.equal(expectedValidations);
        });
      });
    });
  });
});
