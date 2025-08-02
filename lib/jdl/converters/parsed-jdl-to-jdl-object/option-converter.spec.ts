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
import { binaryOptions, unaryOptions } from '../../core/built-in-options/index.ts';
import type { ParsedJDLOption } from '../../core/types/parsed.js';
import { convertOptions } from './option-converter.ts';

describe('jdl - OptionConverter', () => {
  describe('convertOptions', () => {
    describe('when not passing options', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => convertOptions()).toThrow(/^Options have to be passed so as to be converted\.$/);
      });
    });
    describe('when passing options', () => {
      unaryOptions.forEach(unaryOptionName => {
        describe(`such as ${unaryOptionName}`, () => {
          let convertedOptions;

          before(() => {
            convertedOptions = convertOptions(
              {
                [unaryOptionName]: { list: ['A'], excluded: ['B'] } as ParsedJDLOption,
              },
              [],
            );
          });

          it('should convert it', () => {
            expect(convertedOptions).toMatchSnapshot();
          });
        });
      });
      const BinaryOptions = new Map([
        [binaryOptions.Options.DTO, binaryOptions.Values.dto.MAPSTRUCT],
        [binaryOptions.Options.SERVICE, binaryOptions.Values.service.SERVICE_CLASS],
        [binaryOptions.Options.PAGINATION, binaryOptions.Values.pagination.PAGINATION],
        [binaryOptions.Options.SEARCH, binaryOptions.Values.search.ELASTICSEARCH],
        [binaryOptions.Options.ANGULAR_SUFFIX, 'toto'],
        [binaryOptions.Options.CLIENT_ROOT_FOLDER, 'toto'],
        [binaryOptions.Options.MICROSERVICE, 'toto'],
      ]);
      BinaryOptions.forEach((optionValue, optionName) => {
        describe(`such as ${optionName}`, () => {
          let convertedOptions;

          before(() => {
            convertedOptions = convertOptions(
              {
                [optionName]: {
                  [optionValue]: { list: ['A'], excluded: ['B'] } as ParsedJDLOption,
                },
              },
              [],
            );
          });

          it('should convert it', () => {
            expect(convertedOptions).toMatchSnapshot();
          });
        });
      });
    });
    describe('when passing use options', () => {
      describe('that exist', () => {
        let convertedOptions;

        before(() => {
          convertedOptions = convertOptions({}, [
            {
              optionValues: ['mapstruct', 'elasticsearch'],
              list: ['*'],
              excluded: ['B'],
            },
            {
              optionValues: ['pagination'],
              list: ['A', 'C'],
              excluded: [],
            },
          ]);
        });
        it('should convert them', () => {
          expect(convertedOptions).toMatchInlineSnapshot(`
[
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
    "value": "elasticsearch",
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
      describe('that do not exist', () => {
        let convertedOptions;

        before(() => {
          convertedOptions = convertOptions({}, [
            {
              optionValues: ['mapstruct'],
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
[
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
