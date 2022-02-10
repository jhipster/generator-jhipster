const assert = require('yeoman-assert');
const utils = require('../utils/blueprint');

describe('JHipster Blueprint Utils', () => {
  describe('::parseBluePrints', () => {
    it('does nothing if an array', () => {
      const expected = [{ name: 'generator-jhipster-foo', version: 'latest' }];
      const actual = utils.parseBluePrints(expected);
      assert.deepStrictEqual(actual, expected);
    });
    it('returns a array if empty string', () => {
      const expected = [];
      const actual = utils.parseBluePrints('');
      assert.deepStrictEqual(actual, expected);
    });
    it('returns a array if not string', () => {
      assert.deepStrictEqual(utils.parseBluePrints(), []);
      assert.deepStrictEqual(utils.parseBluePrints(1), []);
      assert.deepStrictEqual(utils.parseBluePrints(1.1), []);
    });
    it('adds generator-jhipster prefix if it is absent', () => {
      const expected = [{ name: 'generator-jhipster-foo' }];
      const actual = utils.parseBluePrints('foo');
      assert.deepStrictEqual(actual, expected);
    });
    it('keeps generator-jhipster prefix if it is present', () => {
      const expected = [{ name: 'generator-jhipster-foo', version: '1.0.1' }];
      const actual = utils.parseBluePrints('generator-jhipster-foo@1.0.1');
      assert.deepStrictEqual(actual, expected);
    });
    it("doesn't modify scoped package and extracts version", () => {
      const expected = [{ name: '@corp/foo', version: '1.0.1' }];
      const actual = utils.parseBluePrints('@corp/foo@1.0.1');
      assert.deepStrictEqual(actual, expected);
    });
    it('parses comma separated list', () => {
      const expected = [{ name: 'generator-jhipster-foo' }, { name: 'generator-jhipster-bar', version: '1.0.1' }, { name: '@corp/foo' }];
      const actual = utils.parseBluePrints('foo,bar@1.0.1,@corp/foo');
      assert.deepStrictEqual(actual, expected);
    });
  });
  describe('::mergeBlueprints', () => {
    describe('not passing arguments', () => {
      it('returns a empty array', () => {
        const expected = [];
        const actual = utils.mergeBlueprints();
        assert.deepStrictEqual(actual, expected);
      });
    });
    describe('passing undefined', () => {
      const argument = undefined;
      it('throws an error', done => {
        try {
          utils.mergeBlueprints(argument);
        } catch (error) {
          assert.equal(error.message, 'Only arrays are supported.');
          done();
        }
      });
    });
    describe('passing array and undefined', () => {
      const argumentsToPass = [[], undefined];
      it('throws an error', done => {
        try {
          utils.mergeBlueprints(...argumentsToPass);
        } catch (error) {
          assert.equal(error.message, 'Only arrays are supported.');
          done();
        }
      });
    });
    describe('passing unique blueprints', () => {
      const argumentsToPass = [
        [{ name: 'generator-jhipster-foo', version: 'latest' }],
        [{ name: 'generator-jhipster-bar', version: '1.0.1' }],
      ];
      it('returns them concatenated', () => {
        const expected = [
          { name: 'generator-jhipster-foo', version: 'latest' },
          { name: 'generator-jhipster-bar', version: '1.0.1' },
        ];
        const actual = utils.mergeBlueprints(...argumentsToPass);
        assert.deepStrictEqual(actual, expected);
      });
    });
    describe('passing non unique blueprints', () => {
      it('prefers prior version', () => {
        const argumentsToPass = [
          [
            { name: 'generator-jhipster-foo', version: 'latest' },
            { name: 'generator-jhipster-bar', version: '1.0.1' },
          ],
          [{ name: 'generator-jhipster-foo', version: '1.0.1' }],
        ];
        const expected = [
          { name: 'generator-jhipster-foo', version: 'latest' },
          { name: 'generator-jhipster-bar', version: '1.0.1' },
        ];
        const actual = utils.mergeBlueprints(...argumentsToPass);
        assert.deepStrictEqual(actual, expected);
      });
      it('uses later version when prior version is not defined', () => {
        const argumentsToPass = [
          [{ name: 'generator-jhipster-foo' }, { name: 'generator-jhipster-bar', version: '1.0.1' }],
          [{ name: 'generator-jhipster-foo', version: '1.0.1' }],
        ];
        const expected = [
          { name: 'generator-jhipster-foo', version: '1.0.1' },
          { name: 'generator-jhipster-bar', version: '1.0.1' },
        ];
        const actual = utils.mergeBlueprints(...argumentsToPass);
        assert.deepStrictEqual(actual, expected);
      });
    });
  });
  describe('::removeBlueprintDuplicates', () => {
    it('keeps blueprints with undefined version', () => {
      const argumentsToPass = [{ name: 'generator-jhipster-foo' }];
      const expected = [{ name: 'generator-jhipster-foo' }];
      const actual = utils.removeBlueprintDuplicates(argumentsToPass);
      assert.deepStrictEqual(actual, expected);
    });
  });
  describe('::normalizeBlueprintName', () => {
    it('adds generator-jhipster prefix if it is absent', () => {
      const generatorName = utils.normalizeBlueprintName('foo');
      assert.textEqual(generatorName, 'generator-jhipster-foo');
    });
    it('keeps generator-jhipster prefix if it is present', () => {
      const generatorName = utils.normalizeBlueprintName('generator-jhipster-foo');
      assert.textEqual(generatorName, 'generator-jhipster-foo');
    });
    it("doesn't  do anything for scoped package", () => {
      const generatorName = utils.normalizeBlueprintName('@corp/foo');
      assert.textEqual(generatorName, '@corp/foo');
    });
  });
});
