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

/* eslint-disable no-new, no-unused-expressions */
import { jestExpect } from 'mocha-expect-snapshot';
import { expect } from 'chai';
import { binaryOptions } from '../../../jdl/jhipster/index.mjs';

describe('BinaryOptions', () => {
  it('should match values', () => {
    jestExpect(binaryOptions.Values).toMatchInlineSnapshot(`
Object {
  "dto": Object {
    "MAPSTRUCT": "mapstruct",
    "NO": "no",
  },
  "pagination": Object {
    "INFINITE-SCROLL": "infinite-scroll",
    "NO": "no",
    "PAGINATION": "pagination",
  },
  "search": Object {
    "COUCHBASE": "couchbase",
    "ELASTICSEARCH": "elasticsearch",
    "NO": "no",
  },
  "service": Object {
    "NO": "no",
    "SERVICE_CLASS": "serviceClass",
    "SERVICE_IMPL": "serviceImpl",
  },
}
`);
  });
  describe('exists', () => {
    context('when checking for a valid binary option', () => {
      it('should return true', () => {
        expect(binaryOptions.exists(binaryOptions.Options.DTO, binaryOptions.Values.dto.MAPSTRUCT)).to.be.true;
      });
    });
    context('when checking for a custom binary option', () => {
      it('should return true', () => {
        expect(binaryOptions.exists('customOption')).to.be.true;
        expect(binaryOptions.exists('customOption', 'customValue')).to.be.true;
      });
    });
  });
  describe('forEach', () => {
    context('when not passing a function', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => binaryOptions.forEach()).to.throw(/^A function has to be passed to loop over the binary options\.$/);
      });
    });
    context('when passing a function', () => {
      let result;

      before(() => {
        result = [];
        binaryOptions.forEach(optionName => result.push(optionName));
      });

      it('should iterate over them', () => {
        jestExpect(result).toMatchInlineSnapshot(`
Array [
  "dto",
  "service",
  "pagination",
  "microservice",
  "search",
  "angularSuffix",
  "clientRootFolder",
]
`);
      });
    });
  });
});
