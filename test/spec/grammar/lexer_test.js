/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const lexerModule = require('../../../lib/dsl/lexer');

const JDLLexer = lexerModule.JDLLexer;

describe('Chevrotain Lexer POC', () => {
  it('Can lex a simple valid JDL text', () => {
    const input = `
   entity JobHistory {
     startDate ZonedDateTime,
     endDate ZonedDateTime,
     language Language
   }`;

    const lexResult = JDLLexer.tokenize(input);
    expect(lexResult.errors).to.be.empty;

    const tokens = lexResult.tokens;
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

  it('Can lex a simple IN-valid JDL text', () => {
    // invalid token but the lexing should continue
    const input = `
   entity JobHistory {
     startDate ZonedDateTime,
     @@@ 
     endDate ZonedDateTime
   }`;
    const lexResult = JDLLexer.tokenize(input);
    const errors = lexResult.errors;
    expect(errors).to.have.lengthOf(1);
    expect(errors[0].line).to.equal(4);
    expect(errors[0].column).to.equal(6);
    expect(errors[0].message).to.include('@');
    expect(errors[0].message).to.include('skipped 3 characters');

    expect(lexResult.tokens).to.have.lengthOf(
      9,
      'All 9 tokens should have been lexed even though "@@@" caused a syntax error'
    );
  });
});
