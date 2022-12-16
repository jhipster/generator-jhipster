import { fileURLToPath } from 'url';

import assert from 'yeoman-assert';
import path, { dirname } from 'path';

import utils from '../generators/utils.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('JHipster Utils', () => {
  describe('::getJavadoc', () => {
    describe('when passing a negative or nil increment', () => {
      it('returns the comment with no increment', () => {
        assert.textEqual(utils.getJavadoc('whatever', -42), '/**\n * whatever\n */');
        assert.textEqual(utils.getJavadoc('whatever', 0), '/**\n * whatever\n */');
      });
    });
    describe('when passing a positive increment', () => {
      it('returns the comment with the increment', () => {
        assert.textEqual(utils.getJavadoc('whatever', 1), ' /**\n  * whatever\n  */');
      });
    });
    describe('when passing a nil comment', () => {
      it('inserts an empty comment instead of failing', () => {
        assert.textEqual(utils.getJavadoc(null, 1), ' /**\n  * \n  */');
      });
    });
    describe('when passing a comment containing double quotes', () => {
      it('escapes the quotes', () => {
        assert.textEqual(utils.getJavadoc('Comment="KO"', 1), ' /**\n  * Comment=\\"KO\\"\n  */');
      });
    });
  });
  describe('::getEnumInfo', () => {
    describe('when passing field data', () => {
      let enumInfo;

      before(() => {
        const clientRootFolder = 'root';
        const field = { enumName: 'fieldName', fieldType: 'BigLetters', fieldValues: 'AAA, BBB', fieldTypeJavadoc: 'enum comment' };
        enumInfo = utils.getEnumInfo(field, clientRootFolder);
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
        enumInfo = utils.getEnumInfo(field, clientRootFolder);
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
        enumInfo = utils.getEnumInfo(field, clientRootFolder);
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
          enumInfo = utils.getEnumInfo(field, clientRootFolder);
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
          enumInfo = utils.getEnumInfo(field, clientRootFolder);
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
          enumInfo = utils.getEnumInfo(field, clientRootFolder);
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
        enumInfo = utils.getEnumInfo(field);
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
        enumInfo = utils.getEnumInfo(field, clientRootFolder);
      });

      it('returns the clientRootFolder property suffixed by a dash', () => {
        assert.strictEqual(enumInfo.clientRootFolder, 'root-');
      });
    });
  });
  describe('::deepFind function', () => {
    const jsonData = {
      foo11: 'foo11value',
      fooNested: { foo21: 'foo21value' },
      foo21: 'foo21value',
    };
    describe('the key is found in the object that is searched', () => {
      it('returns the value associated to the key', () => {
        const value = utils.deepFind(jsonData, 'foo21');
        assert.textEqual(value, 'foo21value');
      });
    });
    describe('the key is not found in the object that is searched', () => {
      it('returns undefined', () => {
        const value = utils.deepFind(jsonData, 'foo123');
        assert.textEqual(`${value}`, 'undefined');
      });
    });
  });
  describe('::stringHashCode', () => {
    it('calculates hash', () => {
      assert.equal(utils.stringHashCode('some text'), 642107175);
    });
  });
  describe('::renderContent', () => {
    const fixturesPath = path.join(__dirname, 'fixtures', 'renderContent');
    it('should render the included content', done => {
      utils.renderContent(
        path.join(fixturesPath, 'include.ejs'),
        { templatePath: tmpl => tmpl },
        {},
        { root: [path.join(fixturesPath, 'common')] },
        res => {
          assert.equal(res, 'common');
          done();
        }
      );
    });
    it('when 2 roots are provided, first should have precedence', done => {
      utils.renderContent(
        path.join(fixturesPath, 'include.ejs'),
        { templatePath: tmpl => tmpl },
        {},
        { root: [path.join(fixturesPath, 'specific'), path.join(fixturesPath, 'common')] },
        res => {
          assert.equal(res, 'specific');
          done();
        }
      );
    });
    it('when 2 roots are provided, should find the template in the second folder if does not exists in the first', done => {
      utils.renderContent(
        path.join(fixturesPath, 'include_common.ejs'),
        { templatePath: tmpl => tmpl },
        {},
        { root: [path.join(fixturesPath, 'specific'), path.join(fixturesPath, 'common')] },
        res => {
          assert.equal(res, 'common');
          done();
        }
      );
    });
  });
});
