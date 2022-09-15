/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const _ = require('lodash');
const { EOF } = require('chevrotain');
const JDLAstBuilderVisitor = require('./jdl-ast-builder-visitor');
const { JDLLexer, tokens } = require('./lexer/lexer');
const JDLParser = require('./jdl-parser');
const { performAdditionalSyntaxChecks } = require('./validator');
const { checkTokens } = require('./self-checks/parsing-system-checker');

module.exports = {
  parse,
  getCst,
  getSyntacticAutoCompleteSuggestions,
};

const parserSingleton = JDLParser.getParser();
parserSingleton.parse();
const rules = parserSingleton.getGAstProductions();
checkTokens(Object.values(tokens), Object.values(rules));

function parse(input, startRule = 'prog') {
  const cst = getCst(input, startRule);
  const astBuilderVisitor = new JDLAstBuilderVisitor();
  return astBuilderVisitor.visit(cst);
}

function getCst(input, startRule = 'prog') {
  const lexResult = JDLLexer.tokenize(input);

  if (lexResult.errors.length > 0) {
    throw Error(lexResult.errors[0].message);
  }

  parserSingleton.input = lexResult.tokens;

  const cst = parserSingleton[startRule]();

  if (parserSingleton.errors.length > 0) {
    throwParserError(parserSingleton.errors);
  }

  const extraSyntaxErrors = performAdditionalSyntaxChecks(cst);

  if (extraSyntaxErrors.length > 0) {
    throwSyntaxError(extraSyntaxErrors);
  }

  return cst;
}

function throwParserError(errors) {
  const parserError = errors[0];
  if (parserError.name === 'MismatchedTokenException') {
    throwErrorAboutInvalidToken(parserError);
  }
  const errorMessage = `${parserError.name}: ${parserError.message}`;
  const { token } = parserError;
  const errorMessageLocation = token.tokenType !== EOF ? `\n\tat line: ${token.startLine}, column: ${token.startColumn}` : '';
  throw Error(`${errorMessage}${errorMessageLocation}`);
}

function throwErrorAboutInvalidToken(parserError) {
  const { token } = parserError;
  const errorMessageBeginning = `Found an invalid token '${token.image}'`;
  const errorMessageLocation = token.tokenType !== EOF ? `, at line: ${token.startLine} and column: ${token.startColumn}` : '';
  const errorMessageComplement = 'Please make sure your JDL content does not use invalid characters, keywords or options.';
  throw Error(`${parserError.name}: ${errorMessageBeginning}${errorMessageLocation}.\n\t${errorMessageComplement}`);
}

function throwSyntaxError(errors) {
  throw Error(errors.map(error => `${error.message}\n\tat line: ${error.token.startLine}, column: ${error.token.startColumn}`).join('\n'));
}

// A more complete example can be found here:
// https://github.com/SAP/chevrotain/blob/master/examples/parser/content_assist/official_feature_content_assist.js#L134
function getSyntacticAutoCompleteSuggestions(input, startRule = 'prog') {
  const lexResult = JDLLexer.tokenize(input);

  // ".input" is a setter which will reset the parsers' internal state.
  parserSingleton.input = lexResult.tokens;

  const syntacticSuggestions = parserSingleton.computeContentAssist(startRule, lexResult.tokens);

  // Each suggestion includes additional information such as the "Rule Stack" at suggestion point.
  // This may be handy for advanced implementations, e.g: different logic for suggesting a NAME token in an entity
  // or a field. But it is irrelevant in the scope of the POC.
  return _.uniq(syntacticSuggestions.map(suggestion => suggestion.nextTokenType));
}
