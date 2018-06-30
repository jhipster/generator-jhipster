/**
 * This file defines the exported JDL DSL related APIs
 * This file will be used as webpack entry point to produce a UMD bundle.
 */

const tokens = require('./lexer').tokens;
const JDLLexer = require('./lexer').JDLLexer;
const parse = require('./api').parse;
const getSyntacticAutoCompleteSuggestions = require('./api').getSyntacticAutoCompleteSuggestions;
const JDLParser = require('./jdl_parser');

module.exports = {
  tokens,
  JDLLexer,
  JDLParser,
  parse,
  getSyntacticAutoCompleteSuggestions
};
