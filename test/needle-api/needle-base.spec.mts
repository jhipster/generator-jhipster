import assert from 'yeoman-assert';
import NeedleApiBase from '../../generators/needle-base.mjs';

describe('needle-api - base', () => {
  let needleApiBase;
  before(() => {
    needleApiBase = new NeedleApiBase();
  });
  describe('generate a file model without path', () => {
    let generatedModel;
    before(() => {
      generatedModel = needleApiBase.generateFileModel('dummyFile', 'a-needle-tag', '<p>My content added</p>');
    });
    it('creates expected default files for server and angular', () => {
      assert.textEqual(generatedModel.file, 'dummyFile');
      assert.textEqual(generatedModel.needle, 'a-needle-tag');
      assert.objectContent(generatedModel.splicable, new Array('<p>My content added</p>'));
    });
  });

  describe('generate a file model with a path', () => {
    let generatedModel;
    before(() => {
      generatedModel = needleApiBase.generateFileModelWithPath('aPath', 'dummyFile', 'a-needle-tag', '<p>My content added</p>');
    });

    it('creates expected default files for server and angular', () => {
      assert.textEqual(generatedModel.path, 'aPath');
      assert.textEqual(generatedModel.file, 'dummyFile');
      assert.textEqual(generatedModel.needle, 'a-needle-tag');
      assert.objectContent(generatedModel.splicable, new Array('<p>My content added</p>'));
    });
  });
});
