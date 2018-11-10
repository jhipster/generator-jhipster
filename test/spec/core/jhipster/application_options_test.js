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

/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const { exists, isType, doesValueExists } = require('../../../../lib/core/jhipster/application_options');

describe('ApplicationOptions', () => {
  context('::exists', () => {
    context('when passing an option that does not exist', () => {
      it('returns false', () => {
        expect(exists('toto')).to.be.false;
      });
    });
    context('when passing an option that exists', () => {
      it('returns true', () => {
        expect(exists('testFrameworks')).to.be.true;
      });
    });
  });
  context('::isType', () => {
    context('when the option and type do not match', () => {
      it('returns false', () => {
        expect(isType('skipClient', 'string')).to.be.false;
      });
    });
    context('when the option and type match', () => {
      it('returns true', () => {
        expect(isType('skipClient', 'boolean')).to.be.true;
      });
    });
  });
  context('::doesValueExists', () => {
    context('when the value does not exist', () => {
      it('returns false', () => {
        expect(doesValueExists('serviceDiscoveryType', 'toto')).to.be.false;
      });
    });
    context('when the value exists', () => {
      it('returns true', () => {
        expect(doesValueExists('serviceDiscoveryType', 'consul')).to.be.true;
      });
    });
  });
});
