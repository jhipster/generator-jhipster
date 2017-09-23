/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const tokens = require('../../../lib/dsl/poc/lexer').tokens;
const parse = require('../../../lib/dsl/poc/api').parse;
const getSyntaticAutoCompleteSuggestions = require('../../../lib/dsl/poc/api').getSyntaticAutoCompleteSuggestions;


describe('Chevrotain Parser POC', () => {
  context('parsing', () => {
    context('happy path', () => {
      it('Can parse a simple valid JDL text', () => {
        const input = `
       entity JobHistory {
         startDate ZonedDateTime,
         endDate ZonedDateTime,
         language Language
       }`;

        // debug and step into this to experience debugging the parser's code directly without
        // the abstraction of a 10,000 lines of generated source code in the way.
        const result = parse(input);
        expect(result.parseErrors).to.be.empty;

        const cst = result.cst;
        // We can now explore the automatically created Concrete Syntax Tree.
        // See detailed CST docs here: https://github.com/SAP/chevrotain/blob/master/docs/concrete_syntax_tree.md
        expect(cst.name).to.equal('prog');
        expect(cst.children.constantDecl).to.be.empty;
        expect(cst.children.entityDecl).to.have.lengthOf(1);
        expect(cst.children.entityDecl[0].children.NAME[0].image).to.equal('JobHistory');
        // ...
      });

      it('Can parse a simple valid JDL text using a custom startRule', () => {
        const input = `{
        startDate ZonedDateTime,
        endDate ZonedDateTime,
        language Language
      }`;

        const result = parse(input, 'entityBody');
        expect(result.parseErrors).to.be.empty;

        const cst = result.cst;
        expect(cst.name).to.equal('entityBody');
        expect(cst.children.fieldDec[0].children.NAME[0].image).to.equal('startDate');
        expect(cst.children.fieldDec[1].children.NAME[0].image).to.equal('endDate');
        expect(cst.children.fieldDec[2].children.NAME[0].image).to.equal('language');
      });
    });

    context('errors and recovery', () => {
      it('Can report & recover gracefully from a single syntax error', () => {
        const input = `
        myConst1 = 1
        myConst2 = 3, /* <-- comma should not be here */
        myConst3 = 9
      `;

        const result = parse(input);
        expect(result.parseErrors).to.have.lengthOf(1);
        expect(result.parseErrors[0].message).to.equal('Expecting token of type --> EOF <-- but found --> \',\' <--');

        const cst = result.cst;
        // Even though a syntax error occurred, the parser still outputs a completely valid CST.
        expect(cst.name).to.equal('prog');
        expect(cst.children.constantDecl[0].children.NAME[0].image).to.equal('myConst1');
        expect(cst.children.constantDecl[1].children.NAME[0].image).to.equal('myConst2');
        expect(cst.children.constantDecl[2].children.NAME[0].image).to.equal('myConst3');

        expect(cst.children.constantDecl[0].children.INTEGER[0].image).to.equal('1');
        expect(cst.children.constantDecl[1].children.INTEGER[0].image).to.equal('3');
        expect(cst.children.constantDecl[2].children.INTEGER[0].image).to.equal('9');
      });

      it('Can report & recover gracefully from multiple syntax errors', () => {
        const input = `
        myConst1 = 1
        myConst2 = 3, /* <-- comma should not be here */
        myConst3 /* forgot the equals sign */ 9
      `;

        const result = parse(input);
        expect(result.parseErrors).to.have.lengthOf(2);
        expect(result.parseErrors[0].message).to.equal('Expecting token of type --> EOF <-- but found --> \',\' <--');
        expect(result.parseErrors[1].message).to.equal('Expecting token of type --> EQUALS <-- but found --> \'9\' <--');

        const cst = result.cst;
        // Even though a syntax error occurred, the parser still outputs a completely valid CST.
        expect(cst.name).to.equal('prog');
        expect(cst.children.constantDecl[0].children.NAME[0].image).to.equal('myConst1');
        expect(cst.children.constantDecl[1].children.NAME[0].image).to.equal('myConst2');
        expect(cst.children.constantDecl[2].children.NAME[0].image).to.equal('myConst3');

        expect(cst.children.constantDecl[0].children.INTEGER[0].image).to.equal('1');
        expect(cst.children.constantDecl[1].children.INTEGER[0].image).to.equal('3');
        expect(cst.children.constantDecl[2].children.INTEGER[0].image).to.equal('9');

        // this "=" token was inserted during error recovery, thus it will have no position information
        // and will be marked using the "isInsertedInRecovery" flag.
        expect(cst.children.constantDecl[2].children.EQUALS[0].isInsertedInRecovery).to.be.true;
      });

      it('Can report and PARTIALLY recover from syntax errors', () => {
        const input = `
        myConst1 = 1
        myConst2 = = = = = /* <- too many equal signs*/ 3, 
        myConst3 /= 9
      `;

        const result = parse(input);
        expect(result.parseErrors).to.have.lengthOf(1);
        expect(result.parseErrors[0].message).to.equal('Expecting token of type --> INTEGER <-- but found --> \'=\' <--');

        const cst = result.cst;
        // Even though a syntax error occurred, the parser still outputs a MOSTLY valid CST.
        expect(cst.name).to.equal('prog');
        expect(cst.children.constantDecl[0].children.NAME[0].image).to.equal('myConst1');
        // The error occurred in this constantDecl, but we still have it's name...
        expect(cst.children.constantDecl[1].children.NAME[0].image).to.equal('myConst2');
        expect(cst.children.constantDecl[2].children.NAME[0].image).to.equal('myConst3');

        expect(cst.children.constantDecl[0].children.INTEGER[0].image).to.equal('1');
        // This syntax error was more complex and forced the parser to throw away tokens in a re-sync recovery
        // So the "3" token was "lost to the void".
        expect(cst.children.constantDecl[1].children.INTEGER).to.be.empty;
        expect(cst.children.constantDecl[2].children.INTEGER[0].image).to.equal('9');
      });
    });
  });

  context('AutoComplete', () => {
    it('Can provide suggestions for an empty text', () => {
      // Our JDL grammar subset can start with either a NAME (constant declaration) or the ENTITY keyword.
      const input = '';

      const result = getSyntaticAutoCompleteSuggestions(input);
      expect(result).to.have.lengthOf(2);
      expect(result).to.have.members([tokens.NAME, tokens.ENTITY]);
    });

    it('Can provide suggestions for a partial JDL text with a custom startRule', () => {
      // Our JDL grammar subset can start with either a NAME (constant declaration) or the ENTITY keyword.
      const input = 'lastName string ';

      const result = getSyntaticAutoCompleteSuggestions(input, 'fieldDec');
      expect(result).to.have.lengthOf(3);
      // Note that because we are using token Inheritance with the MIN_MAX_KEYWORD an auto-complete provider would have
      // to translate this to concrete tokens (MIN/MAX/MAX_BYTES/MIN_BYTES/...)
      expect(result).to.have.members([tokens.REQUIRED, tokens.MIN_MAX_KEYWORD, tokens.PATTERN]);
    });

    it('Can provide suggestions for a partial JDL text with the default startRule', () => {
      // Our JDL grammar subset can start with either a NAME (constant declaration) or the ENTITY keyword.
      const input = `
      entity person {
        lastName string `;

      const result = getSyntaticAutoCompleteSuggestions(input);
      expect(result).to.have.lengthOf(5);
      // Note that because we are using token Inheritance with the MIN_MAX_KEYWORD an auto-complete provider would have
      // to translate this to concrete tokens (MIN/MAX/MAX_BYTES/MIN_BYTES/...)
      expect(result).to.have.members([
        tokens.REQUIRED,
        tokens.MIN_MAX_KEYWORD,
        tokens.PATTERN,
        // Note that this will have more suggestions than the previous spec as there is a deeper rule stack.
        tokens.COMMA,
        tokens.RCURLY]);
    });
  });
});
