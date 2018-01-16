/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const expect = require('chai').expect;
const BINARY_OPTIONS = require('../../../../lib/core/jhipster/binary_options').BINARY_OPTIONS;
const BINARY_OPTION_VALUE = require('../../../../lib/core/jhipster/binary_options').BINARY_OPTION_VALUES;
const exists = require('../../../../lib/core/jhipster/binary_options').exists;

describe('BINARY_OPTIONS', () => {
  describe('::exists', () => {
    describe('when checking for a valid binary option', () => {
      it('returns true', () => {
        expect(exists(BINARY_OPTIONS.DTO, BINARY_OPTION_VALUE.dto.MAPSTRUCT)).to.be.true;
      });
    });
    describe('when checking for an invalid binary option', () => {
      it('returns false', () => {
        expect(exists('NOTHING')).to.be.false;
      });
    });
  });
});
