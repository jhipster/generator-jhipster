/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const JDLOptions = require('../../../lib/core/jdl_options');
const JDLUnaryOption = require('../../../lib/core/jdl_unary_option');
const UNARY_OPTIONS = require('../../../lib/core/jhipster/unary_options').UNARY_OPTIONS;

describe('JDLOptions', () => {
  describe('#addOption', () => {
    describe('when passing an invalid option', () => {
      it('fails', () => {
        const options = new JDLOptions();
        try {
          options.addOption(null);
          fail();
        } catch (error) {
          expect(error.name).to.equal('InvalidObjectException');
        }
      });
    });
    describe('when passing a valid option', () => {
      const options = new JDLOptions();
      const option1 = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT, entityNames: ['A', 'B', 'C'], excludedNames: ['M'] });
      const option2 = new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_SERVER, entityNames: ['D'] });

      before(() => {
        options.addOption(option1);
        options.addOption(option2);
      });

      describe('that has not been added before', () => {
        it('adds it', () => {
          expect(options.getOptions()[0]).to.deep.eq(option1);
          expect(options.getOptions()[1]).to.deep.eq(option2);
        });
      });

      describe('that has been added before', () => {
        before(() => {
          options.addOption(new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_CLIENT, entityNames: ['A', 'J'], excludedNames: ['N', 'O'] }));
        });

        it('does not duplicate it', () => {
          expect(options.getOptions().length).to.equal(2);
        });
        it('merges the entity names and excluded names', () => {
          expect(
            options.getOptions()[0]
          ).to.deep.eq(new JDLUnaryOption({
            name: UNARY_OPTIONS.SKIP_CLIENT,
            entityNames: ['A', 'B', 'C', 'J'],
            excludedNames: ['M', 'N', 'O']
          }));
        });
      });
    });
  });
  describe('#has', () => {
    describe('with an invalid input', () => {
      it('returns false', () => {
        expect(new JDLOptions().has(null)).to.be.false;
      });
    });
    describe('with a valid input', () => {
      it('returns whether the option is present', () => {
        const options = new JDLOptions();
        options.addOption(new JDLUnaryOption({
          name: UNARY_OPTIONS.SKIP_CLIENT,
          entityNames: ['A']
        }));
        expect(options.has(UNARY_OPTIONS.SKIP_CLIENT)).to.be.true;
        expect(options.has(UNARY_OPTIONS.SKIP_SERVER)).to.be.false;
      });
    });
  });
  describe('#toString', () => {
    const options = new JDLOptions();
    before(() => {
      options.addOption(new JDLUnaryOption({
        name: UNARY_OPTIONS.SKIP_CLIENT,
        entityNames: ['A', 'B', 'C'],
        excludedNames: ['M']
      }));
      options.addOption(new JDLUnaryOption({ name: UNARY_OPTIONS.SKIP_SERVER, entityNames: ['D'] }));
      options.addOption(new JDLUnaryOption({
        name: UNARY_OPTIONS.SKIP_CLIENT,
        entityNames: ['A', 'J'],
        excludedNames: ['N', 'O']
      }));
    });
    it('stringifies the options', () => {
      expect(options.toString()).to.eq('skipClient for A, B, C, J except M, N, O\nskipServer for D');
    });
  });
});
