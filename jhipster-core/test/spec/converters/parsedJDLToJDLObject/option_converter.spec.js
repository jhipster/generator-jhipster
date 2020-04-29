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
const JDLUnaryOption = require('../../../../lib/core/jdl_unary_option');
const JDLBinaryOption = require('../../../../lib/core/jdl_binary_option');
const UnaryOptions = require('../../../../lib/core/jhipster/unary_options');
const BinaryOptions = require('../../../../lib/core/jhipster/binary_options');
const { convertOptions } = require('../../../../lib/converters/parsedJDLToJDLObject/option_converter');

describe('OptionConverter', () => {
  describe('convertOptions', () => {
    context('when not passing options', () => {
      it('should fail', () => {
        expect(() => convertOptions()).to.throw(/^Options have to be passed so as to be converted\.$/);
      });
    });
    context('when passing options', () => {
      UnaryOptions.forEach(unaryOptionName => {
        context(`such as ${unaryOptionName}`, () => {
          let expectedOptions;
          let convertedOptions;

          before(() => {
            expectedOptions = [
              new JDLUnaryOption({
                name: unaryOptionName,
                entityNames: ['A'],
                excludedNames: ['B']
              })
            ];
            convertedOptions = convertOptions({
              [unaryOptionName]: { list: ['A'], excluded: ['B'] }
            });
          });

          it('should convert it', () => {
            expect(convertedOptions).to.deep.equal(expectedOptions);
          });
        });
      });
      const binaryOptions = new Map([
        [BinaryOptions.Options.DTO, BinaryOptions.Values.dto.MAPSTRUCT],
        [BinaryOptions.Options.SERVICE, BinaryOptions.Values.service.SERVICE_CLASS],
        [BinaryOptions.Options.PAGINATION, BinaryOptions.Values.pagination.PAGINATION],
        [BinaryOptions.Options.SEARCH, BinaryOptions.Values.search.ELASTIC_SEARCH],
        [BinaryOptions.Options.ANGULAR_SUFFIX, 'toto'],
        [BinaryOptions.Options.CLIENT_ROOT_FOLDER, 'toto'],
        [BinaryOptions.Options.MICROSERVICE, 'toto']
      ]);
      binaryOptions.forEach((optionValue, optionName) => {
        context(`such as ${optionName}`, () => {
          let expectedOptions;
          let convertedOptions;

          before(() => {
            expectedOptions = [
              new JDLBinaryOption({
                name: optionName,
                value: optionValue,
                entityNames: ['A'],
                excludedNames: ['B']
              })
            ];
            convertedOptions = convertOptions(
              {
                [optionName]: {
                  [optionValue]: { list: ['A'], excluded: ['B'] }
                }
              },
              () => ({ entityList: ['A'], excludedEntityList: ['B'] })
            );
          });

          it('should convert it', () => {
            expect(convertedOptions).to.deep.equal(expectedOptions);
          });
        });
      });
    });
  });
});
