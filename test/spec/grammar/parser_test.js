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
      // TODO: TBD
    });

    it('Can parse a simple invalid JDL text with a single syntax error', () => {
      // TODO: TBD
    });

    it('Can parse a simple invalid JDL text with multiple syntax errors', () => {
      // TODO: TBD
    });

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
