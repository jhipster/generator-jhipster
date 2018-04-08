/* global describe, beforeEach, it */

const assert = require('yeoman-assert');
const utils = require('../generators/utils');

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
    describe('::escapeRegExp', () => {
        describe('when the string is not a java class name', () => {
            it('converts string into proper java class name', () => {
                assert.textEqual(utils.classify('class name'), 'ClassName');
            });
        });
        describe('when the string is already a java class name', () => {
            it('will not convert the string', () => {
                assert.textEqual(utils.classify('ClassName'), 'ClassName');
            });
        });
    });
    describe('::copyObjectProps', () => {
        it('expects all the pairs (key, value) of the source to be in destination', () => {
            const src = { foo: 'foo', foo2: 'foo2' };
            const dst = { foo3: 'foo3' };
            utils.copyObjectProps(dst, src);
            assert.objectContent(dst, src);
        });
    });
    describe('::buildEnumFunction', () => {
        it('describes all the properties of the entity', () => {
            const packageName = 'com.package';
            const angularAppName = 'myApp';
            const clientRootFolder = 'root';
            const entity = { enumName: 'entityName', fieldValues: 'field1, field2' };
            const infos = utils.buildEnumInfo(entity, angularAppName, packageName, clientRootFolder);
            assert.objectContent(infos, { packageName, angularAppName, clientRootFolder: `${clientRootFolder}-` });
        });
    });
    describe('::deepFind function', () => {
        const jsonData = {
            foo11: 'foo11value',
            fooNested:
                { foo21: 'foo21value' },
            foo21: 'foo21value'
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
});
