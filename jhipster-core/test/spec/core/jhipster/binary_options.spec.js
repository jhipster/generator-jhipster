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

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');
const BinaryOptions = require('../../../../lib/core/jhipster/binary_options');

describe('BinaryOptions', () => {
  describe('exists', () => {
    context('when checking for a valid binary option', () => {
      it('should return true', () => {
        expect(BinaryOptions.exists(BinaryOptions.Options.DTO, BinaryOptions.Values.dto.MAPSTRUCT)).to.be.true;
      });
    });
    context('when checking for a custom binary option', () => {
      it('should return true', () => {
        expect(BinaryOptions.exists('customOption')).to.be.true;
        expect(BinaryOptions.exists('customOption', 'customValue')).to.be.true;
      });
    });
  });
  describe('forEach', () => {
    context('when not passing a function', () => {
      it('should fail', () => {
        expect(() => BinaryOptions.forEach()).to.throw(
          /^A function has to be passed to loop over the binary options\.$/
        );
      });
    });
    context('when passing a function', () => {
      let result;

      before(() => {
        result = [];
        BinaryOptions.forEach(optionName => result.push(optionName));
      });

      it('should iterate over them', () => {
        expect(result).to.deep.equal([
          'dto',
          'service',
          'pagination',
          'microservice',
          'search',
          'angularSuffix',
          'clientRootFolder'
        ]);
      });
    });
  });
});
