/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { afterEach, before, describe, expect as jestExpect, it } from 'esmocha';

import { expect } from 'chai';

import { binaryOptions, unaryOptions } from '../built-in-options/index.ts';

import JDLBinaryOption from './jdl-binary-option.ts';
import JDLOptions from './jdl-options.ts';
import JDLUnaryOption from './jdl-unary-option.ts';

describe('jdl - JDLOptions', () => {
  describe('addOption', () => {
    describe('when passing an invalid option', () => {
      let options: JDLOptions;

      before(() => {
        options = new JDLOptions();
      });

      it('should fail', () => {
        expect(() => {
          // @ts-expect-error invalid api test
          options.addOption(null);
        }).to.throw(/^Can't add nil option.$/);
      });
    });
    describe('when passing a valid option', () => {
      let options: JDLOptions;
      let option1: JDLUnaryOption;
      let option2: JDLUnaryOption;

      before(() => {
        options = new JDLOptions();
        option1 = new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
          entityNames: new Set(['A', 'B', 'C']),
          excludedNames: new Set(['M']),
        });
        option2 = new JDLUnaryOption({ name: unaryOptions.SKIP_SERVER, entityNames: new Set(['D']) });
        options.addOption(option1);
        options.addOption(option2);
      });

      describe('that has not been added before', () => {
        it('should add it', () => {
          expect(options.getOptions()[0]).to.deep.eq(option1);
          expect(options.getOptions()[1]).to.deep.eq(option2);
        });
      });

      describe('that has been added before', () => {
        before(() => {
          options.addOption(
            new JDLUnaryOption({ name: unaryOptions.SKIP_CLIENT, entityNames: new Set(['A', 'J']), excludedNames: new Set(['N', 'O']) }),
          );
        });

        it('should not duplicate it', () => {
          expect(options.getOptions().length).to.equal(2);
        });
        it('should merge the entity names and excluded names', () => {
          expect(options.getOptions()[0]).to.deep.eq(
            new JDLUnaryOption({
              name: unaryOptions.SKIP_CLIENT,
              entityNames: new Set(['A', 'B', 'C', 'J']),
              excludedNames: new Set(['M', 'N', 'O']),
            }),
          );
        });
      });
    });
  });
  describe('has', () => {
    describe('with an invalid input', () => {
      it('should return false', () => {
        expect(new JDLOptions().has()).to.be.false;
      });
    });
    describe('with a valid input', () => {
      let options: JDLOptions;

      before(() => {
        options = new JDLOptions();
      });

      it('should return whether the option is present', () => {
        options.addOption(
          new JDLUnaryOption({
            name: unaryOptions.SKIP_CLIENT,
            entityNames: new Set(['A']),
          }),
        );
        expect(options.has(unaryOptions.SKIP_CLIENT)).to.be.true;
        expect(options.has(unaryOptions.SKIP_SERVER)).to.be.false;
      });
    });
  });
  describe('size', () => {
    let options: JDLOptions;

    before(() => {
      options = new JDLOptions();
    });

    it('should return the number of options', () => {
      expect(options.size()).to.equal(0);
      options.addOption(
        new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
          entityNames: new Set(['A', 'B', 'C']),
          excludedNames: new Set(['M']),
        }),
      );
      expect(options.size()).to.equal(1);
    });
  });
  describe('forEach', () => {
    let jdlOptions: JDLOptions;

    before(() => {
      jdlOptions = new JDLOptions();
      jdlOptions.addOption(
        new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
        }),
      );
      jdlOptions.addOption(
        new JDLUnaryOption({
          name: unaryOptions.SKIP_SERVER,
        }),
      );
    });

    describe('when not passing a function', () => {
      it('should not fail', () => {
        // @ts-expect-error invalid api test
        jdlOptions.forEach();
      });
    });
    describe('when passing a function', () => {
      const result: any[] = [];

      before(() => {
        jdlOptions.forEach(jdlOption => {
          result.push(jdlOption.name);
        });
      });

      it('should use each option', () => {
        jestExpect(result).toMatchInlineSnapshot(`
[
  "skipClient",
  "skipServer",
]
`);
      });
    });
  });
  describe('getOptionsForName', () => {
    let jdlOptions: JDLOptions;

    before(() => {
      jdlOptions = new JDLOptions();
    });

    afterEach(() => {
      jdlOptions = new JDLOptions();
    });

    describe('when passing an invalid name', () => {
      it('should return an empty array', () => {
        // @ts-expect-error invalid api test
        expect(jdlOptions.getOptionsForName()).to.be.empty;
      });
    });
    describe('when checking for an absent option', () => {
      it('should return an empty array', () => {
        expect(jdlOptions.getOptionsForName(unaryOptions.SKIP_CLIENT)).to.be.empty;
      });
    });
    describe('when checking for a present option', () => {
      let option1: JDLUnaryOption;
      let option2: JDLBinaryOption;
      let option3: JDLBinaryOption;

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
          entityNames: new Set(['A', 'B', 'C']),
          excludedNames: new Set(['M']),
        }),
      );
      options.addOption(new JDLUnaryOption({ name: unaryOptions.SKIP_SERVER, entityNames: new Set(['D']) }));
      options.addOption(
        new JDLUnaryOption({
          name: unaryOptions.SKIP_CLIENT,
          entityNames: new Set(['A', 'J']),
          excludedNames: new Set(['N', 'O']),
        }),
      );
    });

    describe('when not passing an indentation level', () => {
      it('should stringify the options without indent', () => {
        expect(options.toString()).to.equal('skipClient A, B, C, J except M, N, O\nskipServer D');
      });
    });
    describe('when passing an indentation level', () => {
      it('should stringify the options with indent', () => {
        expect(options.toString(2)).to.equal('  skipClient A, B, C, J except M, N, O\n  skipServer D');
      });
    });
  });
});
