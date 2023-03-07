import { jestExpect as expect } from 'mocha-expect-snapshot';
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
      expect(generatedModel.file).toBe('dummyFile');
      expect(generatedModel.needle).toBe('a-needle-tag');
      expect(generatedModel.splicable).toEqual(['<p>My content added</p>']);
    });
  });

  describe('generate a file model with a path', () => {
    let generatedModel;
    before(() => {
      generatedModel = needleApiBase.generateFileModelWithPath('aPath', 'dummyFile', 'a-needle-tag', '<p>My content added</p>');
    });

    it('creates expected default files for server and angular', () => {
      expect(generatedModel.path).toBe('aPath');
      expect(generatedModel.file).toBe('dummyFile');
      expect(generatedModel.needle).toBe('a-needle-tag');
      expect(generatedModel.splicable).toEqual(new Array('<p>My content added</p>'));
    });
  });
});
