import assert from 'yeoman-assert';
import { mergeBlueprints, normalizeBlueprintName, parseBluePrints, removeBlueprintDuplicates } from '../utils/blueprint.mjs';

describe('utils - blueprint', () => {
  describe('::parseBluePrints', () => {
    it('does nothing if an array', () => {
      const expected = [{ name: 'generator-jhipster-foo', version: 'latest' }];
      const actual = parseBluePrints(expected);
      assert.deepStrictEqual(actual, expected);
    });
    it('returns a array if empty string', () => {
      const expected = [];
      const actual = parseBluePrints('');
      assert.deepStrictEqual(actual, expected);
    });
    it('returns a array if not string', () => {
      assert.deepStrictEqual(parseBluePrints(), []);
    });
    it('adds generator-jhipster prefix if it is absent', () => {
      const expected = [{ name: 'generator-jhipster-foo' }];
      const actual = parseBluePrints('foo');
      assert.deepStrictEqual(actual, expected);
    });
    it('keeps generator-jhipster prefix if it is present', () => {
      const expected = [{ name: 'generator-jhipster-foo', version: '1.0.1' }];
      const actual = parseBluePrints('generator-jhipster-foo@1.0.1');
      assert.deepStrictEqual(actual, expected);
    });
    it('adds generator-jhipster prefix to scoped package and extracts version', () => {
      const expected = [{ name: '@corp/generator-jhipster-foo', version: '1.0.1' }];
      const actual = parseBluePrints('@corp/foo@1.0.1');
      assert.deepStrictEqual(actual, expected);
    });
    it('parses comma separated list', () => {
      const expected = [
        { name: 'generator-jhipster-foo' },
        { name: 'generator-jhipster-bar', version: '1.0.1' },
        { name: '@corp/generator-jhipster-foo' },
      ];
      const actual = parseBluePrints('foo,bar@1.0.1,@corp/foo');
      assert.deepStrictEqual(actual, expected);
    });
  });
  describe('::mergeBlueprints', () => {
    describe('not passing arguments', () => {
      it('returns a empty array', () => {
        const expected = [];
        const actual = mergeBlueprints();
        assert.deepStrictEqual(actual, expected);
      });
    });
    describe('passing undefined', () => {
      it('throws an error', done => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mergeBlueprints(undefined as any);
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (mergeBlueprints as any)(...argumentsToPass);
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
        const actual = mergeBlueprints(...argumentsToPass);
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
        const actual = mergeBlueprints(...argumentsToPass);
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
        const actual = mergeBlueprints(...argumentsToPass);
        assert.deepStrictEqual(actual, expected);
      });
    });
  });
  describe('::removeBlueprintDuplicates', () => {
    it('keeps blueprints with undefined version', () => {
      const argumentsToPass = [{ name: 'generator-jhipster-foo' }];
      const expected = [{ name: 'generator-jhipster-foo' }];
      const actual = removeBlueprintDuplicates(argumentsToPass);
      assert.deepStrictEqual(actual, expected);
    });
  });
  describe('::normalizeBlueprintName', () => {
    it('adds generator-jhipster prefix if it is absent', () => {
      const generatorName = normalizeBlueprintName('foo');
      assert.textEqual(generatorName, 'generator-jhipster-foo');
    });
    it('keeps generator-jhipster prefix if it is present', () => {
      const generatorName = normalizeBlueprintName('generator-jhipster-foo');
      assert.textEqual(generatorName, 'generator-jhipster-foo');
    });
    it('adds generator-jhipster prefix for scoped package', () => {
      const generatorName = normalizeBlueprintName('@corp/foo');
      assert.textEqual(generatorName, '@corp/generator-jhipster-foo');
    });
  });
});
