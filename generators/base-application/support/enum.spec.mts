import assert from 'assert';
import { getEnumInfo } from './enum.mjs';

describe('base-application - support - enum', () => {
  describe('::getEnumInfo', () => {
    describe('when passing field data', () => {
      let enumInfo;

      before(() => {
        const clientRootFolder = 'root';
        const field = { enumName: 'fieldName', fieldType: 'BigLetters', fieldValues: 'AAA, BBB', fieldTypeJavadoc: 'enum comment' };
        enumInfo = getEnumInfo(field, clientRootFolder);
      });

      it("returns the enum's name", () => {
        assert.strictEqual(enumInfo.enumName, 'BigLetters');
      });
      it("returns the enum's instance", () => {
        assert.strictEqual(enumInfo.enumInstance, 'bigLetters');
      });
      it('returns the enums values', () => {
        assert.deepStrictEqual(enumInfo.enums, ['AAA', 'BBB']);
      });
      it('returns the enums comment', () => {
        assert.deepStrictEqual(enumInfo.javadoc, '/**\n * enum comment\n */');
      });
    });
    describe("when the enums don't have custom values", () => {
      let enumInfo;

      before(() => {
        const clientRootFolder = 'root';
        const field = { enumName: 'fieldName', fieldValues: 'AAA, BBB' };
        enumInfo = getEnumInfo(field, clientRootFolder);
      });

      it('returns whether there are custom enums', () => {
        assert.strictEqual(enumInfo.withoutCustomValues, true);
        assert.strictEqual(enumInfo.withSomeCustomValues, false);
        assert.strictEqual(enumInfo.withCustomValues, false);
      });
      it('returns the enums values', () => {
        assert.deepStrictEqual(enumInfo.enumValues, [
          { name: 'AAA', value: 'AAA', comment: undefined },
          { name: 'BBB', value: 'BBB', comment: undefined },
        ]);
      });
    });
    describe('when some enums have custom values', () => {
      let enumInfo;

      before(() => {
        const clientRootFolder = 'root';
        const field = { enumName: 'fieldName', fieldValues: 'AAA(aaa), BBB' };
        enumInfo = getEnumInfo(field, clientRootFolder);
      });

      it('returns whether there are custom enums', () => {
        assert.strictEqual(enumInfo.withoutCustomValues, false);
        assert.strictEqual(enumInfo.withSomeCustomValues, true);
        assert.strictEqual(enumInfo.withCustomValues, false);
      });
      it('returns the enums values', () => {
        assert.deepStrictEqual(enumInfo.enumValues, [
          {
            name: 'AAA',
            value: 'aaa',
            comment: undefined,
          },
          { name: 'BBB', value: 'BBB', comment: undefined },
        ]);
      });
    });
    describe('when all the enums have custom values', () => {
      describe('without spaces inside them', () => {
        let enumInfo;

        before(() => {
          const clientRootFolder = 'root';
          const field = { enumName: 'fieldName', fieldValues: 'AAA(aaa), BBB(bbb)' };
          enumInfo = getEnumInfo(field, clientRootFolder);
        });

        it('returns whether there are custom enums', () => {
          assert.strictEqual(enumInfo.withoutCustomValues, false);
          assert.strictEqual(enumInfo.withSomeCustomValues, false);
          assert.strictEqual(enumInfo.withCustomValues, true);
        });
        it('returns the enums values', () => {
          assert.deepStrictEqual(enumInfo.enumValues, [
            {
              name: 'AAA',
              value: 'aaa',
              comment: undefined,
            },
            { name: 'BBB', value: 'bbb', comment: undefined },
          ]);
        });
      });
      describe('with spaces inside them', () => {
        let enumInfo;

        before(() => {
          const clientRootFolder = 'root';
          const field = { enumName: 'fieldName', fieldValues: 'AAA(aaa), BBB(bbb and b)' };
          enumInfo = getEnumInfo(field, clientRootFolder);
        });

        it('returns whether there are custom enums', () => {
          assert.strictEqual(enumInfo.withoutCustomValues, false);
          assert.strictEqual(enumInfo.withSomeCustomValues, false);
          assert.strictEqual(enumInfo.withCustomValues, true);
        });
        it('returns the enums values', () => {
          assert.deepStrictEqual(enumInfo.enumValues, [
            {
              name: 'AAA',
              value: 'aaa',
              comment: undefined,
            },
            { name: 'BBB', value: 'bbb and b', comment: undefined },
          ]);
        });
      });
      describe('with comments over them', () => {
        let enumInfo;

        before(() => {
          const clientRootFolder = 'root';
          const field = {
            enumName: 'fieldName',
            fieldValues: 'AAA(aaa), BBB(bbb and b)',
            fieldValuesJavadocs: {
              AAA: 'first comment',
              BBB: 'second comment',
            },
          };
          enumInfo = getEnumInfo(field, clientRootFolder);
        });

        it('returns whether there are custom enums', () => {
          assert.strictEqual(enumInfo.withoutCustomValues, false);
          assert.strictEqual(enumInfo.withSomeCustomValues, false);
          assert.strictEqual(enumInfo.withCustomValues, true);
        });
        it('returns the enums values', () => {
          assert.deepStrictEqual(enumInfo.enumValues, [
            {
              name: 'AAA',
              value: 'aaa',
              comment: '    /**\n     * first comment\n     */',
            },
            { name: 'BBB', value: 'bbb and b', comment: '    /**\n     * second comment\n     */' },
          ]);
        });
      });
    });
    describe('when not passing a client root folder', () => {
      let enumInfo;

      before(() => {
        const field = { enumName: 'fieldName', fieldValues: 'AAA, BBB' };
        enumInfo = getEnumInfo(field);
      });

      it('returns an empty string for the clientRootFolder property', () => {
        assert.strictEqual(enumInfo.clientRootFolder, '');
      });
    });
    describe('when passing a client root folder', () => {
      let enumInfo;

      before(() => {
        const field = { enumName: 'fieldName', fieldValues: 'AAA, BBB' };
        const clientRootFolder = 'root';
        enumInfo = getEnumInfo(field, clientRootFolder);
      });

      it('returns the clientRootFolder property suffixed by a dash', () => {
        assert.strictEqual(enumInfo.clientRootFolder, 'root-');
      });
    });
  });
});
