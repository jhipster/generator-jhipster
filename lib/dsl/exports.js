/**
 * This file defines the exported JDL DSL related APIs
 * This file will be used as webpack entry point to produce a UMD bundle.
 */
const lexer = require('./lexer');
const api = require('./api');
const JDLParser = require('./jdl_parser');

const tokens = lexer.tokens;
const JDLLexer = lexer.JDLLexer;
const parse = api.parse;
const getSyntacticAutoCompleteSuggestions = api.getSyntacticAutoCompleteSuggestions;

module.exports = {
  tokens,
  JDLLexer,
  JDLParser,
  parse,
  getSyntacticAutoCompleteSuggestions
};
