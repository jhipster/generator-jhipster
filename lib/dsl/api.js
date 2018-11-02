/** Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const { EOF } = require('chevrotain');
const { JDLLexer, tokens } = require('./lexer');
const JDLParser = require('./jdl_parser');
const { performAdditionalSyntaxChecks } = require('./validator');
const { buildAst } = require('./ast_builder');
const { checkTokens } = require('./self_checks/parsing_system_checker');

module.exports = {
  parse,
  getSyntacticAutoCompleteSuggestions
};

const parserSingleton = JDLParser.getParser();
parserSingleton.parse();
const rules = parserSingleton.getGAstProductions().values();
checkTokens(Object.values(tokens), rules);

function parse(input, startRule = 'prog') {
  const lexResult = JDLLexer.tokenize(input);

  if (lexResult.errors.length > 0) {
    throw Error(lexResult.errors[0].message);
  }

  // ".input" is a setter which will reset the parser's internal state.
  parserSingleton.input = lexResult.tokens;

  // 1. We can dynamically set any of the parser rules, They are just methods on the parser instance...
  // 2. The JDL Parser is configured to automatically output a ParseTree, a.k.a Concrete Syntax Tree (CST).
  //    This allows us to keep the grammar as a "pure" grammar without any embedded semantic actions.
  const cst = parserSingleton[startRule]();

  if (parserSingleton.errors.length > 0) {
    throwParserError(parserSingleton.errors);
  }

  const extraSyntaxErrors = performAdditionalSyntaxChecks(cst);

  if (extraSyntaxErrors.length > 0) {
    throwSyntaxError(extraSyntaxErrors);
  }

  return buildAst(cst);
}

function throwParserError(errors) {
  const parseError = errors[0];
  const errorMessage = `${parseError.name}: ${parseError.message}`;
  const token = parseError.token;
  const errorMessageLocation =
    token.tokenType !== EOF ? `\n\tat line: ${token.startLine}, column: ${token.startColumn}` : '';
  throw Error(`${errorMessage}${errorMessageLocation}`);
}

function throwSyntaxError(errors) {
  throw Error(
    errors
      .map(error => `${error.message}\n\tat line: ${error.token.startLine}, column: ${error.token.startColumn}`)
      .join('\n')
  );
}

// A more complete example can be found here:
// https://github.com/SAP/chevrotain/blob/master/examples/parser/content_assist/official_feature_content_assist.js#L134
function getSyntacticAutoCompleteSuggestions(input, startRule = 'prog') {
  const lexResult = JDLLexer.tokenize(input);

  // ".input" is a setter which will reset the parser's internal state.
  parserSingleton.input = lexResult.tokens;

  const syntacticSuggestions = parserSingleton.computeContentAssist(startRule, lexResult.tokens);

  // Each suggestion includes additional information such as the "Rule Stack" at suggestion point.
  // This may be handy for advanced implementations, e.g: different logic for suggesting a NAME token in an entity
  // or a field. But it is irrelevant in the scope of the POC.
  return _.uniq(syntacticSuggestions.map(suggestion => suggestion.nextTokenType));
}
