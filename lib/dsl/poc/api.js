const JDLLexer = require('./lexer').JDLLexer;
const JDLParser = require('./parser').JDLParser;


const parserSingleton = new JDLParser([]);

function parse(input, startRule = 'prog') {
  const lexResult = JDLLexer.tokenize(input);

  // ".input" is a setter which will reset the parser's internal state.
  parserSingleton.input = lexResult.tokens;

  // 1. We can dynamically any of the parser rules, They are just methods on the parser instance...
  // 2. The JDL Parser is configured to automatically output a ParseTree, a.k.a Concrete Syntax Tree (CST).
  //    This allows us to keep the grammar as a "pure" grammar without any embedded semantic actions.
  const cst = parserSingleton[startRule]();

  return {
    cst,
    lexErrors: lexResult.errors,
    parseErrors: parserSingleton.errors,
    comments: lexResult.groups.comments
  };
}

function getSyntaticAutoCompleteSuggestions(input, startRule = 'prog') {

}

module.exports = {
  parse,
  getSyntaticAutoCompleteSuggestions
};
