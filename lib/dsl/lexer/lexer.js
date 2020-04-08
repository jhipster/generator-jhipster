/** Copyright 2013-2020 the original author or authors from the JHipster project.
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

const { Lexer } = require('chevrotain');
const {
  NAME,
  sharedCategoryTokens: { UNARY_OPTION, BINARY_OPTION }
} = require('./shared_tokens');
const ValidationTokens = require('./validation_tokens');
const ApplicationTokens = require('./application_tokens');
const DeploymentTokens = require('./deployment_tokens');
const RelationshipTypeTokens = require('./relationship_type_tokens');
const OptionTokens = require('./option_tokens');
const createTokenFromConfigCreator = require('./token_creator').createTokenFromConfig;

const tokens = {};

function createTokenFromConfig(config) {
  const newToken = createTokenFromConfigCreator(config);
  tokens[config.name] = newToken;
  return newToken;
}

// Some categories to make the grammar easier to read
const BOOLEAN = createTokenFromConfig({
  name: 'BOOLEAN',
  pattern: Lexer.NA
});

// Category for the Application Configuration key names
const CONFIG_KEY = ApplicationTokens.categoryToken;

// Category For the Application deployment key names
const DEPLOYMENT_KEY = DeploymentTokens.categoryToken;

createTokenFromConfig({
  name: 'WHITESPACE',
  pattern: /[\n\t\r \u2028\u2029]+/,
  // Whitespace insensitivity for the win.
  group: Lexer.SKIPPED
});

// Comments
createTokenFromConfig({
  name: 'JAVADOC',
  pattern: /\/\*\*([\s\S]*?)\*\//
});

// Comments
createTokenFromConfig({
  name: 'BLOCK_COMMENT',
  pattern: /\/\*([\s\S]*?)\*\//,
  group: Lexer.SKIPPED
});

// Constants
// Application constants
createTokenFromConfig({ name: 'CONFIG', pattern: 'config' });
createTokenFromConfig({ name: 'ENTITIES', pattern: 'entities' });

ApplicationTokens.tokens.forEach(token => {
  tokens[token.name] = token;
});

// application must appear AFTER "applicationType" due to shorter common prefix.
createTokenFromConfig({ name: 'APPLICATION', pattern: 'application' });

// this is used in application config and deployment
createTokenFromConfig({
  name: 'SERVICE_DISCOVERY_TYPE',
  pattern: 'serviceDiscoveryType',
  categories: [CONFIG_KEY, DEPLOYMENT_KEY]
});

DeploymentTokens.tokens.forEach(token => {
  tokens[token.name] = token;
});

createTokenFromConfig({ name: 'DEPLOYMENT', pattern: 'deployment' });

// boolean value constants
createTokenFromConfig({ name: 'TRUE', pattern: 'true', categories: [BOOLEAN] });
createTokenFromConfig({ name: 'FALSE', pattern: 'false', categories: [BOOLEAN] });
// Entity constants
createTokenFromConfig({ name: 'ENTITY', pattern: 'entity' });
createTokenFromConfig({ name: 'ENUM', pattern: 'enum' });
// Relationship-related
createTokenFromConfig({ name: 'RELATIONSHIP', pattern: 'relationship' });
createTokenFromConfig({ name: 'JPA_DERIVED_IDENTIFIER', pattern: 'jpaDerivedIdentifier' });

// Category For the relationship type key names
RelationshipTypeTokens.tokens.forEach(token => {
  tokens[token.name] = token;
});

createTokenFromConfig({ name: 'STAR', pattern: '*' });

// Options
OptionTokens.tokens.forEach(token => {
  tokens[token.name] = token;
});

// validations
ValidationTokens.tokens.forEach(token => {
  tokens[token.name] = token;
});

createTokenFromConfig({ name: 'REGEX', pattern: /\/[^\n\r]*\// });
createTokenFromConfig({ name: 'DECIMAL', pattern: /-?\d+\.\d+/ });
createTokenFromConfig({ name: 'INTEGER', pattern: /-?\d+/ });
// No escaping, no unicode, just a plain string literal
createTokenFromConfig({ name: 'STRING', pattern: /"(?:[^"])*"/ });

// punctuation
createTokenFromConfig({ name: 'LPAREN', pattern: '(' });
createTokenFromConfig({ name: 'RPAREN', pattern: ')' });
createTokenFromConfig({ name: 'LCURLY', pattern: '{' });
createTokenFromConfig({ name: 'RCURLY', pattern: '}' });
createTokenFromConfig({ name: 'LSQUARE', pattern: '[' });
createTokenFromConfig({ name: 'RSQUARE', pattern: ']' });
createTokenFromConfig({ name: 'COMMA', pattern: ',' });
createTokenFromConfig({ name: 'COMMA_WITHOUT_NEWLINE', pattern: /,[^\n\r]/ });
createTokenFromConfig({ name: 'EQUALS', pattern: '=' });
createTokenFromConfig({ name: 'DOT', pattern: '.' });

createTokenFromConfig({ name: 'TO', pattern: 'to' });

// annotations
createTokenFromConfig({ name: 'AT', pattern: '@' });

tokens.UNARY_OPTION = UNARY_OPTION;
tokens.BINARY_OPTION = BINARY_OPTION;
// Imperative the "NAME" token will be added after all the keywords to resolve keywords vs identifier conflict.
tokens.NAME = NAME;

// with 'ensureOptimizations' the lexer initialization will throw a descriptive error
// instead of silently reverting to an unoptimized algorithm.
// This will avoid performance regressions.
const JDLLexer = new Lexer(Object.values(tokens), { ensureOptimizations: true });

// Cannot exporters constants before they have been defined (unlike functions...)
module.exports = {
  tokens,
  JDLLexer
};
