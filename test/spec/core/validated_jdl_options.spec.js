/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

const ValidatedJDLOptions = require('../../../lib/core/validated_jdl_options');
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const JDLBinaryOption = require('../../../lib/core/jdl_binary_option');
const UnaryOptions = require('../../../lib/core/jhipster/unary_options');
const BinaryOptions = require('../../../lib/core/jhipster/binary_options');

describe('ValidatedJDLOptions', () => {
  describe('#addOption', () => {
    context('when passing an invalid option', () => {
      let options = null;

      before(() => {
        options = new ValidatedJDLOptions();
      });

      it('fails', () => {
        expect(() => {
          options.addOption(null);
        }).to.throw(/^Can't add nil option.$/);
      });
    });
    context('when passing a valid option', () => {
      let options = null;
      let option1 = null;
      let option2 = null;

      before(() => {
        options = new ValidatedJDLOptions();
        option1 = new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT,
          entityNames: ['A', 'B', 'C'],
          excludedNames: ['M']
        });
        option2 = new JDLUnaryOption({ name: UnaryOptions.SKIP_SERVER, entityNames: ['D'] });
        options.addOption(option1);
        options.addOption(option2);
      });

      context('that has not been added before', () => {
        it('adds it', () => {
          expect(options.getOptions()[0]).to.deep.eq(option1);
          expect(options.getOptions()[1]).to.deep.eq(option2);
        });
      });

      context('that has been added before', () => {
        before(() => {
          options.addOption(
            new JDLUnaryOption({ name: UnaryOptions.SKIP_CLIENT, entityNames: ['A', 'J'], excludedNames: ['N', 'O'] })
          );
        });

        it('does not duplicate it', () => {
          expect(options.getOptions().length).to.equal(2);
        });
        it('merges the entity names and excluded names', () => {
          expect(options.getOptions()[0]).to.deep.eq(
            new JDLUnaryOption({
              name: UnaryOptions.SKIP_CLIENT,
              entityNames: ['A', 'B', 'C', 'J'],
              excludedNames: ['M', 'N', 'O']
            })
          );
        });
      });
    });
  });
  describe('#has', () => {
    context('with an invalid input', () => {
      it('returns false', () => {
        expect(new ValidatedJDLOptions().has(null)).to.be.false;
      });
    });
    context('with a valid input', () => {
      let options = null;

      before(() => {
        options = new ValidatedJDLOptions();
      });

      it('returns whether the option is present', () => {
        options.addOption(
          new JDLUnaryOption({
            name: UnaryOptions.SKIP_CLIENT,
            entityNames: ['A']
          })
        );
        expect(options.has(UnaryOptions.SKIP_CLIENT)).to.be.true;
        expect(options.has(UnaryOptions.SKIP_SERVER)).to.be.false;
      });
    });
  });
  describe('#size', () => {
    let options = null;

    before(() => {
      options = new ValidatedJDLOptions();
    });

    it('returns the number of options', () => {
      expect(options.size()).to.equal(0);
      options.addOption(
        new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT,
          entityNames: ['A', 'B', 'C'],
          excludedNames: ['M']
        })
      );
      expect(options.size()).to.equal(1);
    });
  });
  describe('#forEach', () => {
    let jdlOptions = null;

    before(() => {
      jdlOptions = new ValidatedJDLOptions();
      jdlOptions.addOption(
        new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT
        })
      );
      jdlOptions.addOption(
        new JDLUnaryOption({
          name: UnaryOptions.SKIP_SERVER
        })
      );
    });

    context('when not passing a function', () => {
      it('does not fail', () => {
        jdlOptions.forEach();
      });
    });
    context('when passing a function', () => {
      const result = [];

      before(() => {
        jdlOptions.forEach(jdlOption => {
          result.push(jdlOption.name);
        });
      });

      it('uses each option', () => {
        expect(result).to.deep.equal(['skipClient', 'skipServer']);
      });
    });
  });
  describe('#getOptionsForName', () => {
    let jdlOptions = null;

    before(() => {
      jdlOptions = new ValidatedJDLOptions();
    });

    afterEach(() => {
      jdlOptions = new ValidatedJDLOptions();
    });

    context('when passing an invalid name', () => {
      it('returns an empty array', () => {
        expect(jdlOptions.getOptionsForName()).to.be.empty;
      });
    });
    context('when checking for an absent option', () => {
      it('returns an empty array', () => {
        expect(jdlOptions.getOptionsForName(UnaryOptions.SKIP_CLIENT)).to.be.empty;
      });
    });
    context('when checking for a present option', () => {
      let option1 = null;
      let option2 = null;
      let option3 = null;

      before(() => {
        option1 = new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT
        });
        option2 = new JDLBinaryOption({
          name: BinaryOptions.Options.SERVICE,
          value: BinaryOptions.Values.service.SERVICE_CLASS
        });
        option3 = new JDLBinaryOption({
          name: BinaryOptions.Options.SERVICE,
          value: BinaryOptions.Values.service.SERVICE_IMPL
        });

        jdlOptions.addOption(option1);
        jdlOptions.addOption(option2);
        jdlOptions.addOption(option3);
      });

      it('returns it', () => {
        expect(jdlOptions.getOptionsForName(UnaryOptions.SKIP_CLIENT)).to.deep.equal([option1]);
        expect(jdlOptions.getOptionsForName(BinaryOptions.Options.SERVICE)).to.deep.equal([option2, option3]);
      });
    });
  });
  describe('#toString', () => {
    const options = new ValidatedJDLOptions();

    before(() => {
      options.addOption(
        new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT,
          entityNames: ['A', 'B', 'C'],
          excludedNames: ['M']
        })
      );
      options.addOption(new JDLUnaryOption({ name: UnaryOptions.SKIP_SERVER, entityNames: ['D'] }));
      options.addOption(
        new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT,
          entityNames: ['A', 'J'],
          excludedNames: ['N', 'O']
        })
      );
    });

    it('stringifies the options', () => {
      expect(options.toString()).to.eq('skipClient A, B, C, J except M, N, O\nskipServer D');
    });
  });
});
