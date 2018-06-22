/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const parse = require('../../../lib/dsl//api').parse;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const pegjsParser = require('../../../lib/dsl/old/pegjs_parser');

const sampleFolder = '../../test_files/';

// external to the repo, some samples should not be made private
// const sampleFolder = '../../../../jdl/';

function removeInternalJDLComments(content) {
  return content.replace(/\/\/[^\n\r]*/gm, '');
}

function filterJDLDirectives(content) {
  return content.replace(/^\u0023.*\n?/gm, '');
}

describe('the compatibility test harness for chevrotain migration', () => {
  context('all the existing JDL samples in the test folder', () => {
    const sampleFolderPath = path.resolve(__dirname, sampleFolder);
    const jdlSamples = fs
      .readdirSync(sampleFolderPath)
      .filter(file => _.endsWith(file, '.jdl'));

    jdlSamples.forEach((currSample) => {
      // uncomment the "skip" to run the compatibility tests locally.
      it(`can parse sample: '${currSample}'`, () => {
        const sampleText = fs.readFileSync(
          path.resolve(__dirname, `${sampleFolder}${currSample}`),
          'utf8'
        );

        const processedSampleText = removeInternalJDLComments(
          filterJDLDirectives(sampleText)
        );

        const astFromChev = parse(processedSampleText);
        const astFromPeg = pegjsParser.parse(processedSampleText);

        expect(astFromChev).to.deep.eql(astFromPeg);
      });
    });
  });
});
