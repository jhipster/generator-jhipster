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
import UnaryOptions from '../../../../jdl/jhipster/unary-options.js';
import BinaryOptions from '../../../../jdl/jhipster/binary-options.js';
import { convertOptions } from '../../../../jdl/converters/parsed-jdl-to-jdl-object/option-converter.js';
import EntityOptions from '../../../../jdl/jhipster/entity-options.js';
import SearchEngineTypes from '../../../../jdl/jhipster/search-engine-types.js';

const { MapperTypes, PaginationTypes } = EntityOptions;
const { COUCHBASE } = SearchEngineTypes;

const { MAPSTRUCT } = MapperTypes;
const { PAGINATION } = PaginationTypes;

describe('OptionConverter', () => {
  describe('convertOptions', () => {
    context('when not passing options', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => convertOptions()).toThrow(/^Options have to be passed so as to be converted\.$/);
      });
    });
    context('when passing options', () => {
      UnaryOptions.forEach(unaryOptionName => {
        context(`such as ${unaryOptionName}`, () => {
          let convertedOptions;

          before(() => {
            convertedOptions = convertOptions(
              {
                [unaryOptionName]: { list: ['A'], excluded: ['B'] },
              },
              []
            );
          });

          it('should convert it', () => {
            expect(convertedOptions).toMatchSnapshot();
          });
        });
      });
      const binaryOptions = new Map([
        [BinaryOptions.Options.DTO, BinaryOptions.Values.dto.MAPSTRUCT],
        [BinaryOptions.Options.SERVICE, BinaryOptions.Values.service.SERVICE_CLASS],
        [BinaryOptions.Options.PAGINATION, BinaryOptions.Values.pagination.PAGINATION],
        [BinaryOptions.Options.SEARCH, BinaryOptions.Values.search.ELASTICSEARCH],
        [BinaryOptions.Options.ANGULAR_SUFFIX, 'toto'],
        [BinaryOptions.Options.CLIENT_ROOT_FOLDER, 'toto'],
        [BinaryOptions.Options.MICROSERVICE, 'toto'],
      ]);
      binaryOptions.forEach((optionValue, optionName) => {
        context(`such as ${optionName}`, () => {
          let convertedOptions;

          before(() => {
            convertedOptions = convertOptions(
              {
                [optionName]: {
                  [optionValue!]: { list: ['A'], excluded: ['B'] },
                },
              },
              []
            );
          });

          it('should convert it', () => {
            expect(convertedOptions).toMatchSnapshot();
          });
        });
      });
    });
    context('when passing use options', () => {
      context('that exist', () => {
        let convertedOptions;

        before(() => {
          convertedOptions = convertOptions({}, [
            {
              optionValues: [MAPSTRUCT, COUCHBASE],
              list: ['*'],
              excluded: ['B'],
            },
            {
              optionValues: [PAGINATION],
              list: ['A', 'C'],
              excluded: [],
            },
          ]);
        });
        it('should convert them', () => {
          expect(convertedOptions).toMatchInlineSnapshot(`
Array [
  JDLBinaryOption {
    "entityNames": Set {
      "*",
    },
    "excludedNames": Set {
      "B",
    },
    "name": "dto",
    "value": "mapstruct",
  },
  JDLBinaryOption {
    "entityNames": Set {
      "*",
    },
    "excludedNames": Set {
      "B",
    },
    "name": "search",
    "value": "couchbase",
  },
  JDLBinaryOption {
    "entityNames": Set {
      "A",
      "C",
    },
    "excludedNames": Set {},
    "name": "pagination",
    "value": "pagination",
  },
]
`);
        });
      });
      context('that do not exist', () => {
        let convertedOptions;

        before(() => {
          convertedOptions = convertOptions({}, [
            {
              optionValues: [MAPSTRUCT],
              list: ['*'],
              excluded: ['B'],
            },
            {
              optionValues: ['oops'],
              list: ['A', 'C'],
              excluded: [],
            },
          ]);
        });
        it('should not convert them', () => {
          expect(convertedOptions).toMatchInlineSnapshot(`
Array [
  JDLBinaryOption {
    "entityNames": Set {
      "*",
    },
    "excludedNames": Set {
      "B",
    },
    "name": "dto",
    "value": "mapstruct",
  },
]
`);
        });
      });
    });
  });
});
