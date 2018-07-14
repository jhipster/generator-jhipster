/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const lexerModule = require('../../../lib/dsl/lexer');

const JDLLexer = lexerModule.JDLLexer;

describe('JDLLexer', () => {
  context('when passing a valid JDL input', () => {
    let lexingResult = null;

    before(() => {
      const input = `
   entity JobHistory {
     startDate ZonedDateTime,
     endDate ZonedDateTime,
     language Language
   }`;
      lexingResult = JDLLexer.tokenize(input);
    });

    it('does not fail', () => {
      expect(lexingResult.errors).to.be.empty;
    });

    it('can lex a simple valid JDL text', () => {
      const tokens = lexingResult.tokens;
      expect(tokens.length).to.equal(12);
      expect(tokens[0].image).to.equal('entity');
      expect(tokens[1].image).to.equal('JobHistory');
      expect(tokens[2].image).to.equal('{');
      expect(tokens[3].image).to.equal('startDate');
      expect(tokens[4].image).to.equal('ZonedDateTime');
      expect(tokens[5].image).to.equal(',');
      expect(tokens[6].image).to.equal('endDate');
      expect(tokens[7].image).to.equal('ZonedDateTime');
      expect(tokens[8].image).to.equal(',');
      expect(tokens[9].image).to.equal('language');
      expect(tokens[10].image).to.equal('Language');
      expect(tokens[11].image).to.equal('}');
    });
  });

  context('when passing an invalid JDL input', () => {
    let lexingResult = null;

    before(() => {
      const input = `
   entity JobHistory {
     startDate ZonedDateTime,
     ###
     endDate ZonedDateTime
   }`;
      lexingResult = JDLLexer.tokenize(input);
    });

    it('reports the errors', () => {
      const errors = lexingResult.errors;
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].line).to.equal(4);
      expect(errors[0].column).to.equal(6);
      expect(errors[0].message).to.include('#');
      expect(errors[0].message).to.include('skipped 3 characters');
    });

    it('can lex a simple invalid JDL text', () => {
      expect(lexingResult.tokens).to.have.lengthOf(
        9,
        'All 9 tokens should have been lexed even though "@@@" caused a syntax error'
      );
    });
  });
});
