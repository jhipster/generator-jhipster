const expect = require('chai').expect;
const _ = require('lodash');
const distBundle = require('../../../dist/jhipster.min');
/**
 * Smoke Test for the Grammar UMD bundle.
 */
describe('JDL DSL UMD bundle', () => {
  it('only exports a specific set of properties', () => {
    const actualPropNames = _.keys(distBundle);
    expect(actualPropNames)
      .to
      .have
      .members(['tokens', 'JDLLexer', 'JDLParser', 'parse', 'getSyntacticAutoCompleteSuggestions']);
    expect(actualPropNames).to.have.lengthOf(5);
  });

  context('smoke tests', () => {
    context('JDLLexer', () => {
      // TODO: TBD
    });

    context('JDLParser', () => {
      // TODO: TBD
    });

    context('parse', () => {
      // TODO: TBD
    });

    context('getSyntacticAutoCompleteSuggestions', () => {
      // TODO: TBD
    });
  });
});
