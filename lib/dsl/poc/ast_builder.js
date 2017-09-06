const JDLParser = require('./parser').JDLParser;
const _ = require('lodash');


function buildAst(cst) {
  // eslint-disable-next-line no-use-before-define
  const astBuilderVisitor = new JDLAstBuilderVisitor();
  const ast = astBuilderVisitor.visit(cst);
  return ast;
}

const BaseJDLCSTVisitor = new JDLParser().getBaseCstVisitorConstructor();

/**
 * Note that the logic here assumes the input CST is valid.
 * To make this work with partially formed CST created during automatic error recovery
 * would require refactoring for greater robustness.
 * Meaning we can never assume at least one element exists in a ctx child array
 * e.g:
 * 1. ctx.NAME[0].image --> ctx.NAME[0] ? ctx.NAME[0].image : "???"
 */
class JDLAstBuilderVisitor extends BaseJDLCSTVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  prog(ctx) {
    return {
      entities: _.map(ctx.entityDecl, elm => this.visit(elm)),
      constants: _.map(ctx.constantDecl, elm => this.visit(elm))
    };
  }

  constantDecl(ctx) {
    return {
      name: ctx.NAME[0].image,
      value: parseInt(ctx.INTEGER[0].image, 10)
    };
  }

  entityDecl(ctx) {
    return {
      name: ctx.NAME[0].image,
      // ctx.entityTableNameDecl is optional which means
      // either an empty array or an array of a single element
      // the "this.visit" API will handle this transparently and return
      // undefined in the case of empty array.
      tableName: this.visit(ctx.entityTableNameDecl),
      fields: this.visit(ctx.entityBody)
    };
  }

  entityTableNameDecl(ctx) {
    return ctx.NAME[0].image;
  }

  entityBody(ctx) {
    return _.map(ctx.fieldDec, elm => this.visit(elm));
  }

  fieldDec(ctx) {
    return {
      name: ctx.NAME[0].image,
      // ctx.type is an array with a single item.
      // in that case:
      // this.visit(ctx.type) is equivalent to this.visit(ctx.type[0])
      type: this.visit(ctx.type),
      validations: _.map(ctx.validation, elm => this.visit(elm))
    };
  }

  type(ctx) {
    return ctx.NAME[0].image;
  }

  validation(ctx) {
    // only one of these alternatives can exist at the same time.
    if (!_.isEmpty(ctx.REQUIRED)) {
      return {
        validationType: 'required'
      };
    } else if (!_.isEmpty(ctx.minMaxValidation)) {
      return this.visit(ctx.minMaxValidation);
    }
    return this.visit(ctx.pattern);
  }

  minMaxValidation(ctx) {
    return {
      validationType: ctx.MIN_MAX_KEYWORD[0].image,
      limit: _.isEmpty(ctx.NAME) ?
        parseInt(ctx.INTEGER[0].image, 10) :
        ctx.NAME[0].image
    };
  }

  pattern(ctx) {
    return {
      validationType: 'pattern',
      pattern: ctx.REGEX[0].image
    };
  }
}

module.exports = {
  buildAst
};
