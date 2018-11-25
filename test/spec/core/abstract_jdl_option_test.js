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
const { expect } = require('chai');
const AbstractJDLOption = require('../../../lib/core/abstract_jdl_option');
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');
const BinaryOptions = require('../../../lib/core/jhipster/binary_options');

describe('AbstractJDLOption', () => {
  describe('::resolveEntityNames', () => {
    context('when not passing an option', () => {
      it('fails', () => {
        expect(() => {
          AbstractJDLOption.resolveEntityNames(null, ['A', 'B']);
        }).to.throw('An option has to be passed to resolve its entity names.');
      });
    });
    context('when not passing entity names', () => {
      it('fails', () => {
        expect(() => {
          AbstractJDLOption.resolveEntityNames(
            new JDLBinaryOption({
              name: BinaryOptions.Options.SERVICE,
              value: BinaryOptions.Values.service.SERVICE_CLASS
            })
          );
        }).to.throw("Entity names have to be passed to resolve the option's entities.");
      });
    });
    context('when passing valid values', () => {
      it("resolves the option's entity names", () => {
        expect(
          AbstractJDLOption.resolveEntityNames(
            new JDLBinaryOption({
              name: BinaryOptions.Options.SERVICE,
              value: BinaryOptions.Values.service.SERVICE_CLASS,
              excludedNames: ['C']
            }),
            ['A', 'B', 'C']
          ).toArray()
        ).to.deep.equal(['A', 'B']);
      });
    });
  });
});
