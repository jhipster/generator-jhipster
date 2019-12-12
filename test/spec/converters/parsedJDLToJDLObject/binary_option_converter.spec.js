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
const JDLBinaryOption = require('../../../../lib/core/jdl_binary_option');
const { Options, Values } = require('../../../../lib/core/jhipster/binary_options');
const { convertBinaryOptions } = require('../../../../lib/converters/parsedJDLToJDLObject/binary_option_converter');

describe('BinaryOptionConverter', () => {
  describe('convertBinaryOptions', () => {
    context('when not passing binary options', () => {
      it('should fail', () => {
        expect(() => convertBinaryOptions()).to.throw(/^Binary options have to be passed so as to be converted\.$/);
      });
    });
    context('when passing options', () => {
      context('that exist', () => {
        const options = new Map([
          [Options.DTO, Values.dto.MAPSTRUCT],
          [Options.SERVICE, Values.service.SERVICE_CLASS],
          [Options.PAGINATION, Values.pagination.PAGINATION],
          [Options.SEARCH, Values.search.ELASTIC_SEARCH],
          [Options.ANGULAR_SUFFIX, 'toto'],
          [Options.CLIENT_ROOT_FOLDER, 'toto'],
          [Options.MICROSERVICE, 'toto']
        ]);

        options.forEach((optionValue, optionName) => {
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
              convertedOptions = convertBinaryOptions(
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
      context('that do not exist', () => {
        it('should return an empty list', () => {
          expect(convertBinaryOptions({ anOptionThatWillNeverExist: { aWeirdValue: '' } })).to.deep.equal([]);
        });
      });
    });
  });
});
