const JDLLexer = require('./lexer').JDLLexer;
const JDLParser = require('./parser').JDLParser;


const parserSingleton = new JDLParser([]);

function parse(input, startRule = 'prog') {
  const lexResult = JDLLexer.tokenize(input);

  // ".input" is a setter which will reset the parser's internal state.
  parserSingleton.input = lexResult.tokens;

  // 1. We can dynamically set any of the parser rules, They are just methods on the parser instance...
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

// TODO: this is a very naive implementation, for example if the content assist was requested
// while typing an identifier or keyword we may need to drop the last element in the token vector
// and filter the results according to the existing prefix.
// A more complete example can be found here:
// https://github.com/SAP/chevrotain/blob/master/examples/parser/content_assist/official_feature_content_assist.js#L134
function getSyntacticAutoCompleteSuggestions(input, startRule = 'prog') {
  const lexResult = JDLLexer.tokenize(input);

  // ".input" is a setter which will reset the parser's internal state.
  parserSingleton.input = lexResult.tokens;

  const syntacticSuggestions = parserSingleton.computeContentAssist(
    startRule,
    lexResult.tokens
  );

  // Each suggestion includes additional information such as the "Rule Stack" at suggestion point.
  // This may be handy for advanced implementations, e.g: different logic for suggesting a NAME token in an entity
  // or a field. But it is irrelevant in the scope of the POC.
  return syntacticSuggestions.map(suggestion => suggestion.nextTokenType);
}

module.exports = {
  parse,
  getSyntacticAutoCompleteSuggestions
};
