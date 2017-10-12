/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const parse = require('../../../lib/dsl/poc/api').parse;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

describe('Chevrotain Migration compatibility harness', () => {
  describe('Can Parse all the existing JDL samples in the test folder', () => {
    const samplesDir = path.resolve(__dirname, '../../test_files/');
    const jdlSamples = fs.readdirSync(samplesDir).filter(file => _.endsWith(file, '.jdl'));

    jdlSamples.forEach((currSample) => {
      // uncomment the "skip" to run the compatibility tests locally.
      it.skip(`Sample: '${currSample}'`, () => {
        const sampleText = fs.readFileSync(path.resolve(__dirname, `../../test_files/${currSample}`), 'utf8');
        const parseResult = parse(sampleText);
        expect(parseResult.parseErrors).to.be.empty;
      });
    });
  });
});
