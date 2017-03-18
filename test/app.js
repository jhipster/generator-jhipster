/* global describe, before, beforeEach, it*/
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-generator').test;

describe('generator-jhipster-react:app', () => {
  before((done) => {
    helpers.run(path.join(__dirname, '../generators/app'))
      .withOptions({ someOption: true })
      .withPrompts({ someAnswer: true })
      .on('end', done);
  });

  it('creates files', () => {
    assert.file([
      'dummyfile.txt'
    ]);
  });
});
