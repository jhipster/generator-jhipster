const assert = require('yeoman-assert');
const NeedleApiBase = require('../../generators/needle-base');

describe('Unit tests for needle-base API', () => {
    before(done => {
        this.needleApiBase = new NeedleApiBase();
        done();
    });
    describe('generate a file model without path', () => {
        before(done => {
            this.generatedModel = this.needleApiBase.generateFileModel('dummyFile', 'a-needle-tag', '<p>My content added</p>');
            done();
        });
        it('creates expected default files for server and angularX', () => {
            assert.textEqual(this.generatedModel.file, 'dummyFile');
            assert.textEqual(this.generatedModel.needle, 'a-needle-tag');
            assert.objectContent(this.generatedModel.splicable, new Array('<p>My content added</p>'));
        });
    });

    describe('generate a file model with a path', () => {
        before(done => {
            this.generatedModel = this.needleApiBase.generateFileModelWithPath(
                'aPath',
                'dummyFile',
                'a-needle-tag',
                '<p>My content added</p>'
            );
            done();
        });

        it('creates expected default files for server and angularX', () => {
            assert.textEqual(this.generatedModel.path, 'aPath');
            assert.textEqual(this.generatedModel.file, 'dummyFile');
            assert.textEqual(this.generatedModel.needle, 'a-needle-tag');
            assert.objectContent(this.generatedModel.splicable, new Array('<p>My content added</p>'));
        });
    });
});
