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
const JDLUnaryOption = require('../../../../lib/core/jdl_unary_option');
const { convertUnaryOptions } = require('../../../../lib/converters/parsedJDLToJDLObject/unary_option_converter');
const {
  FILTER,
  NO_FLUENT_METHOD,
  READ_ONLY,
  SKIP_CLIENT,
  SKIP_SERVER
} = require('../../../../lib/core/jhipster/unary_options');

describe('UnaryOptionConverter', () => {
  describe('convertUnaryOptions', () => {
    context('when not passing options', () => {
      it('should fail', () => {
        expect(() => convertUnaryOptions()).to.throw(/^Unary options have to be passed to be converted.$/);
      });
    });
    context('when passing the skipClient option', () => {
      let expectedOptions;
      let convertedOptions;

      before(() => {
        expectedOptions = [
          new JDLUnaryOption({
            name: SKIP_CLIENT,
            entityNames: ['A'],
            excludedNames: ['B']
          })
        ];
        convertedOptions = convertUnaryOptions({
          skipClientOption: { list: ['A'], excluded: ['B'] },
          skipServerOption: { list: [] },
          filterOption: { list: [] },
          noFluentMethodOption: { list: [] },
          readOnlyOption: { list: [] }
        });
      });

      it('should convert it', () => {
        expect(convertedOptions).to.deep.equal(expectedOptions);
      });
    });
    context('when passing the skipServer option', () => {
      let expectedOptions;
      let convertedOptions;

      before(() => {
        expectedOptions = [
          new JDLUnaryOption({
            name: SKIP_SERVER,
            entityNames: ['A'],
            excludedNames: ['B']
          })
        ];
        convertedOptions = convertUnaryOptions({
          skipClientOption: { list: [] },
          skipServerOption: { list: ['A'], excluded: ['B'] },
          filterOption: { list: [] },
          noFluentMethodOption: { list: [] },
          readOnlyOption: { list: [] }
        });
      });

      it('should convert it', () => {
        expect(convertedOptions).to.deep.equal(expectedOptions);
      });
    });
    context('when passing the filter option', () => {
      let expectedOptions;
      let convertedOptions;

      before(() => {
        expectedOptions = [
          new JDLUnaryOption({
            name: FILTER,
            entityNames: ['A'],
            excludedNames: ['B']
          })
        ];
        convertedOptions = convertUnaryOptions({
          skipClientOption: { list: [] },
          skipServerOption: { list: [] },
          filterOption: { list: ['A'], excluded: ['B'] },
          noFluentMethodOption: { list: [] },
          readOnlyOption: { list: [] }
        });
      });

      it('should convert it', () => {
        expect(convertedOptions).to.deep.equal(expectedOptions);
      });
    });
    context('when passing the noFluentMethod option', () => {
      let expectedOptions;
      let convertedOptions;

      before(() => {
        expectedOptions = [
          new JDLUnaryOption({
            name: NO_FLUENT_METHOD,
            entityNames: ['A'],
            excludedNames: ['B']
          })
        ];
        convertedOptions = convertUnaryOptions({
          skipClientOption: { list: [] },
          skipServerOption: { list: [] },
          filterOption: { list: [] },
          noFluentMethodOption: { list: ['A'], excluded: ['B'] },
          readOnlyOption: { list: [] }
        });
      });

      it('should convert it', () => {
        expect(convertedOptions).to.deep.equal(expectedOptions);
      });
    });
    context('when passing the readOnly option', () => {
      let expectedOptions;
      let convertedOptions;

      before(() => {
        expectedOptions = [
          new JDLUnaryOption({
            name: READ_ONLY,
            entityNames: ['A'],
            excludedNames: ['B']
          })
        ];
        convertedOptions = convertUnaryOptions({
          skipClientOption: { list: [] },
          skipServerOption: { list: [] },
          filterOption: { list: [] },
          noFluentMethodOption: { list: [] },
          readOnlyOption: { list: ['A'], excluded: ['B'] }
        });
      });

      it('should convert it', () => {
        expect(convertedOptions).to.deep.equal(expectedOptions);
      });
    });
  });
});
