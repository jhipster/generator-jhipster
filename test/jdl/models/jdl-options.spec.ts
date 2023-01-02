/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

/* eslint-disable no-unused-expressions */
import { jestExpect } from 'mocha-expect-snapshot';
import { expect } from 'chai';
import { unaryOptions, binaryOptions } from '../../../jdl/jhipster/index.mjs';
import JDLOptions from '../../../jdl/models/jdl-options.js';
import JDLUnaryOption from '../../../jdl/models/jdl-unary-option.js';
import JDLBinaryOption from '../../../jdl/models/jdl-binary-option.js';

describe('JDLOptions', () => {
  describe('addOption', () => {
    context('when passing an invalid option', () => {
      let options;

      before(() => {
        options = new JDLOptions();
      });

      it('should fail', () => {
        expect(() => {
          options.addOption(null);
        }).to.throw(/^Can't add nil option.$/);
      });
    });
    context('when passing a valid option', () => {
      let options;
      let option1;
      let option2;

      before(() => {
        options = new JDLOptions();
        option1 = new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
          entityNames: ['A', 'B', 'C'],
          excludedNames: ['M'],
        });
        option2 = new JDLUnaryOption({ name: unaryOptions.SKIP_SERVER, entityNames: ['D'] });
        options.addOption(option1);
        options.addOption(option2);
      });

      context('that has not been added before', () => {
        it('should add it', () => {
          expect(options.getOptions()[0]).to.deep.eq(option1);
          expect(options.getOptions()[1]).to.deep.eq(option2);
        });
      });

      context('that has been added before', () => {
        before(() => {
          options.addOption(new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT, entityNames: ['A', 'J'], excludedNames: ['N', 'O'] }));
        });

        it('should not duplicate it', () => {
          expect(options.getOptions().length).to.equal(2);
        });
        it('should merge the entity names and excluded names', () => {
          expect(options.getOptions()[0]).to.deep.eq(
            new JDLUnaryOption({
              name: unaryOptions.SKIP_CLIENT,
              entityNames: ['A', 'B', 'C', 'J'],
              excludedNames: ['M', 'N', 'O'],
            })
          );
        });
      });
    });
  });
  describe('has', () => {
    context('with an invalid input', () => {
      it('should return false', () => {
        expect(new JDLOptions().has(null)).to.be.false;
      });
    });
    context('with a valid input', () => {
      let options;

      before(() => {
        options = new JDLOptions();
      });

      it('should return whether the option is present', () => {
        options.addOption(
          new JDLUnaryOption({
            name: unaryOptions.SKIP_CLIENT,
            entityNames: ['A'],
          })
        );
        expect(options.has(unaryOptions.SKIP_CLIENT)).to.be.true;
        expect(options.has(unaryOptions.SKIP_SERVER)).to.be.false;
      });
    });
  });
  describe('size', () => {
    let options;

    before(() => {
      options = new JDLOptions();
    });

    it('should return the number of options', () => {
      expect(options.size()).to.equal(0);
      options.addOption(
        new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
          entityNames: ['A', 'B', 'C'],
          excludedNames: ['M'],
        })
      );
      expect(options.size()).to.equal(1);
    });
  });
  describe('forEach', () => {
    let jdlOptions;

    before(() => {
      jdlOptions = new JDLOptions();
      jdlOptions.addOption(
        new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
        })
      );
      jdlOptions.addOption(
        new JDLUnaryOption({
          name: unaryOptions.SKIP_SERVER,
        })
      );
    });

    context('when not passing a function', () => {
      it('should not fail', () => {
        jdlOptions.forEach();
      });
    });
    context('when passing a function', () => {
      const result: any[] = [];

      before(() => {
        jdlOptions.forEach(jdlOption => {
          result.push(jdlOption.name);
        });
      });

      it('should use each option', () => {
        jestExpect(result).toMatchInlineSnapshot(`
Array [
  "skipClient",
  "skipServer",
]
`);
      });
    });
  });
  describe('getOptionsForName', () => {
    let jdlOptions;

    before(() => {
      jdlOptions = new JDLOptions();
    });

    afterEach(() => {
      jdlOptions = new JDLOptions();
    });

    context('when passing an invalid name', () => {
      it('should return an empty array', () => {
        expect(jdlOptions.getOptionsForName()).to.be.empty;
      });
    });
    context('when checking for an absent option', () => {
      it('should return an empty array', () => {
        expect(jdlOptions.getOptionsForName(unaryOptions.SKIP_CLIENT)).to.be.empty;
      });
    });
    context('when checking for a present option', () => {
      let option1;
      let option2;
      let option3;

      before(() => {
        option1 = new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
        });
        option2 = new JDLBinaryOption({
          name: binaryOptions.Options.SERVICE,
          value: binaryOptions.Values.service.SERVICE_CLASS,
        });
        option3 = new JDLBinaryOption({
          name: binaryOptions.Options.SERVICE,
          value: binaryOptions.Values.service.SERVICE_IMPL,
        });

        jdlOptions.addOption(option1);
        jdlOptions.addOption(option2);
        jdlOptions.addOption(option3);
      });

      it('should return it', () => {
        expect(jdlOptions.getOptionsForName(unaryOptions.SKIP_CLIENT)).to.deep.equal([option1]);
        expect(jdlOptions.getOptionsForName(binaryOptions.Options.SERVICE)).to.deep.equal([option2, option3]);
      });
    });
  });
  describe('toString', () => {
    const options = new JDLOptions();

    before(() => {
      options.addOption(
        new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
          entityNames: ['A', 'B', 'C'],
          excludedNames: ['M'],
        })
      );
      options.addOption(new JDLUnaryOption({ name: unaryOptions.SKIP_SERVER, entityNames: ['D'] }));
      options.addOption(
        new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
          entityNames: ['A', 'J'],
          excludedNames: ['N', 'O'],
        })
      );
    });

    context('when not passing an indentation level', () => {
      it('should stringify the options without indent', () => {
        expect(options.toString()).to.equal('skipClient A, B, C, J except M, N, O\nskipServer D');
      });
    });
    context('when passing an indentation level', () => {
      it('should stringify the options with indent', () => {
        expect(options.toString(2)).to.equal('  skipClient A, B, C, J except M, N, O\n  skipServer D');
      });
    });
  });
});
