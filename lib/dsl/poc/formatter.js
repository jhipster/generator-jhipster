const JDLParser = require('./parser').JDLParser;
const _ = require('lodash');

/**
 * Will provide formatting suggestions in the form of
 * {
 *    start: number,
 *    end: number,
 *    newText: string
 * }
 *
 * examples:
 * 1. {start:44, end: 46, newText: " "} --> replace a double space with a single space
 * 2. {start:200, end: 201, newText: ","} --> replace a double space with a single space
 *
 *
 * This is just a naive implementation, a productive one may have additional logic
 * 1. Supporting DELETE/INSERT operation too.
 * 2. Being able to deal with multiple changes on interwoven offset ranges.
 * 3. Configurable to user's preferences.
 *
 * And a-lot more rules... :)
 */
function formatJDL(cst, orgText) {
// eslint-disable-next-line no-use-before-define
  const formatterVisitor = new JDLCstFormatterVisitor(orgText);
  formatterVisitor.visit(cst);
  const textChanges = formatterVisitor.replaces;

  let formattedText = orgText;
  let changeOffset = 0;
  textChanges.forEach((currReplace) => {
    const actualReplaceStart = currReplace.start + changeOffset + 1;
    const actualReplaceEnd = currReplace.end + changeOffset;

    formattedText = formattedText.substr(0, actualReplaceStart) + currReplace.newText + formattedText.substr(actualReplaceEnd + 1);
    changeOffset += -((currReplace.end - currReplace.start) - currReplace.newText.length);
  });
  return formattedText;
}


const BaseJDLCSTVisitor = new JDLParser().getBaseCstVisitorConstructorWithDefaults();

class JDLCstFormatterVisitor extends BaseJDLCSTVisitor {
  constructor(orgText) {
    super();
    this.orgText = orgText;
    this.replaces = [];
    this.validateVisitor();
  }

  entityDeclaration(ctx) {
    const entityKW = ctx.ENTITY[0];
    const entityName = ctx.NAME[0];

    if (
      // not separated by a single character
      entityKW.endOffset !== entityName.startOffset - 2 ||
    // separated by a single character, but it is not a space char.
    this.orgText[entityKW.endOffset + 1] !== ' ') {
      this.replaces.push({
        start: entityKW.endOffset,
        end: entityName.startOffset - 1,
        newText: ' '
      });
    }

    this.visit(ctx.entityBody);
  }

  entityBody(ctx) {
    const commas = ctx.COMMA;
    // the last field does not have a comma
    const fieldsWithCommas = _.dropRight(ctx.fieldDeclaration);

    _.forEach(commas, (currentComma, index) => {
      const currField = fieldsWithCommas[index];
      const fieldEndOffset = findEndOffset(currField);
      if (fieldEndOffset !== currentComma.startOffset - 1) {
        this.replaces.push({
          start: fieldEndOffset,
          end: currentComma.startOffset - 1,
          newText: ''
        });
      }
    });
  }
}

function findEndOffset(cstOrCstElemArray, oldMax = -1) {
  let newMax = oldMax;
  if (cstOrCstElemArray.children) {
    _.forEach(cstOrCstElemArray.children, (item) => {
      _.forEach(item, () => {
        newMax = Math.max(newMax, findEndOffset(item, newMax));
      });
    });
    return newMax;
  } else if (_.isArray(cstOrCstElemArray)) {
    // relying on knowledge that Chevrotain built the CST children arrays in the order encountered.
    // but that is not an official API...
    const lastElement = _.last(cstOrCstElemArray);
    // concrete tokens.
    if (lastElement.tokenType) {
      return Math.max(newMax, lastElement.endOffset);
    }
    // a cst subnode
    return Math.max(newMax, findEndOffset(lastElement));
  }

  throw Error('non exhaustive match');
}


module.exports = {
  formatJDL
};
