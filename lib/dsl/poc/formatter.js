const JDLParser = require('./parser').JDLParser;

/**
 * Will provide formatting suggestions in the form of
 * {
 *    start: number,
 *    stop: number,
 *    newText: string
 * }
 *
 * examples:
 * 1. {start:44, stop: 46, newText: " "} --> replace a double space with a single space
 * 1. {start:200, stop: 201, newText: ","} --> replace a double space with a single space
 */
function formatJDL(cst, orgText) {
  // TODO: TBD
}


const BaseJDLCSTVisitor = new JDLParser().getBaseCstVisitorConstructorWithDefaults();

class JDLCstFormatterVisitor extends BaseJDLCSTVisitor() {
  constructor(orgText) {
    super();
    this.orgText = orgText;
    this.replaces = [];
    this.validateVisitor();
  }

  entityDecl(ctx) {
    const entityKW = ctx.ENTITY[0];
    const entityName = ctx.NAME[0];

    if (
      // not separated by a single character
      entityKW.startOffset !== entityName.startOffset - 1 ||
    // separated by a single character, but it is not a space char.
    this.orgText[entityKW.endOffset] !== ' ') {
      this.replaces.push({
        start: entityKW.endOffset,
        end: entityName.startOffset - 1,
        newText: ' '
      });
    }
  }

  entityBody(ctx) {
    const commas = ctx.COMMA;
    const fieldNames = ctx.fieldDec.map(currField => currField.NAME[0]);

    commas.forEach((currComma, idx) => {
      const currFieldName = fieldNames[idx];
      if (currFieldName.endOffset !== currComma.startOffset) {
        this.replaces.push({
          start: currFieldName.endOffset,
          end: currComma.startOffset - 1,
          newText: ''
        });
      }
    });
  }
}

module.exports = {
  formatJDL
};
