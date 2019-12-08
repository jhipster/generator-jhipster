/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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
const { convertValidation } = require('../../../../lib/converters/parsedJDLToJDLObject/validation_converter');

describe('ValidationConverter', () => {
  describe('convertValidation', () => {
    context('when not passing a validation', () => {
      it('should fail', () => {
        expect(() => convertValidation()).to.throw(/^A validation has to be passed so as to be converted.$/);
      });
    });
    context('when passing a validation', () => {
      context('with all the attributes', () => {
        let expectedValidation;
        let convertedJDLValidation;

        before(() => {
          convertedJDLValidation = convertValidation({ key: 'min', value: 0 }, () => {});
          expectedValidation = new JDLValidation({ name: 'min', value: 0 });
        });

        it('should convert it', () => {
          expect(convertedJDLValidation).to.deep.equal(expectedValidation);
        });
      });
      context('having for value a constant', () => {
        let valueFromTheConvertedValidation;

        before(() => {
          const getConstantValue = () => 42;
          const convertedJDLValidation = convertValidation(
            { key: 'min', value: 'MINIMUM', constant: true },
            getConstantValue
          );
          valueFromTheConvertedValidation = convertedJDLValidation.value;
        });

        it('should use it', () => {
          expect(valueFromTheConvertedValidation).to.equal(42);
        });
      });
      context('having for name the pattern validation', () => {
        context('with the pattern not having single quotes', () => {
          let valueFromTheConvertedValidation;

          before(() => {
            const convertedJDLValidation = convertValidation(
              {
                key: 'pattern',
                value: '/d+/'
              },
              () => {}
            );
            valueFromTheConvertedValidation = convertedJDLValidation.value;
          });

          it('should not format the value', () => {
            expect(valueFromTheConvertedValidation).to.equal('/d+/');
          });
        });
        context('with the pattern having single quotes', () => {
          let valueFromTheConvertedValidation;

          before(() => {
            const convertedJDLValidation = convertValidation(
              {
                key: 'pattern',
                value: "/[A-Z']/"
              },
              () => {}
            );
            valueFromTheConvertedValidation = convertedJDLValidation.value;
          });

          it('should format it', () => {
            expect(valueFromTheConvertedValidation).to.equal("/[A-Z\\\\']/\\");
          });
        });
      });
    });
  });
});
