/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const parse = require('../../../lib/dsl/poc/api').parse;


describe('Chevrotain Parser POC', () => {
  context('parsing', () => {
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

    it('Can parse a simple invalid JDL text with a SINGLE syntax error', () => {
      const input = `
        myConst1 = 1
        myConst2 = 3, /* <-- comma should not be here */
        myConst3 = 9
      `;

      const result = parse(input);
      expect(result.parseErrors).to.have.lengthOf(1);
      expect(result.parseErrors[0].message).to.equal('Expecting token of type --> EOF <-- but found --> \',\' <--');
    });

    it('Can parse a simple invalid JDL text with MULTIPLE syntax errors', () => {
      const input = `
        myConst1 = 1
        myConst2 = 3, /* <-- comma should not be here */
        myConst3 /* forgot the equals sign */ 9
      `;

      const result = parse(input);
      expect(result.parseErrors).to.have.lengthOf(2);
      expect(result.parseErrors[0].message).to.equal('Expecting token of type --> EOF <-- but found --> \',\' <--');
      expect(result.parseErrors[1].message).to.equal('Expecting token of type --> EQUALS <-- but found --> \'9\' <--');
    });

    // TODO: combine with syntax errors specs?
    it('Can recover from errors and continue parsing #1 (single token insertion)', () => {
      // TODO: TBD
    });

    it('Can recover from errors and continue parsing #2 (single token deletion)', () => {
      // TODO: TBD
    });

    it('Can recover from errors and continue parsing #3 (re-sync)', () => {
      // TODO: TBD
    });
  });

  context('AutoComplete', () => {
    // TODO: TBD
  });
});
