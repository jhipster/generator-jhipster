const chevrotain = require('chevrotain');
const _ = require('lodash');

const Lexer = chevrotain.Lexer;

const tokens = {};

// TODO: some of the original grammar names included parenthesis as possible characters.
// TODO: This will lead to ambiguities strange identifiers, e.g. "max)(age))()()(())A55" being a valid identifier.
const namePattern = /[a-zA-Z_][a-zA-Z_\d]*/;
// All the names tokens of the pegjs implementation have been merged into
// a single token type. This is because they would cause ambiguities
// when the lexing stage is separated from the parsing stage.
// They restrictions on the names should be implemented as semantic checks
// That approach could also provide a better experience in an Editor
// As semantic checks don't require fault tolerance and recovery like
// syntax errors do.
const NAME = chevrotain.createToken({ name: 'NAME', pattern: namePattern });

// by defining keywords to 'inherit' from NAME, keywords become unreserved at the parser level.
// so CONSUME(t.NAME) could now also match a token of type t.APPLICATION.
// - as I believe is the case with the PEGJS implementation.
// - Note that "parser level" is different than any validations performs after parsing i.e
//   in reserved_keywords.js
const KEYWORD = chevrotain.createToken({
  name: 'KEYWORD', pattern: Lexer.NA, longer_alt: NAME, parent: NAME
});

function createToken(config) {
  // JDL has a great many keywords. Keywords can conflict with identifiers in a parsing
  // library with a separate lexing phase.
  // See: https://github.com/SAP/chevrotain/blob/master/examples/lexer/keywords_vs_identifiers/keywords_vs_identifiers.js
  // a Concise way to resolve the problem without manually adding the "longer_alt" property dozens of times.
  if (_.isString(config.pattern) && namePattern.test(config.pattern)) {
    config.longer_alt = NAME;
    // 'application' IS-A KEYWORD which in turn IS-A NAME --> all keywords are now valid identifiers.
    config.parent = KEYWORD;
  }

  // concisely collects all tokens to be exported
  tokens[config.name] = chevrotain.createToken(config);
}

createToken({
  name: 'WHITESPACE',
  // TODO: uncertain why the original grammar disallowed newlines
  // TODO: in rules: "fieldDeclList: "and validationList"
  pattern: /\s+/,
  // HIGHLIGHT:
  // This special "group" causes the lexer to completely ignore
  // These tokens, In partical terms this means the parser
  // Does not have need to have hundreds of "SPACE*" everywhere (unlike pegjs).
  // With a single line we can make our language whitespace insensitive.
  group: Lexer.SKIPPED,
  line_breaks: true
});

// Comments
createToken({
  name: 'COMMENT',
  pattern: /\/\*[^]*?\*\//,
  line_breaks: true
});

// Constants
// Application constants
createToken({ name: 'APPLICATION', pattern: 'application' });
createToken({ name: 'BASE_NAME', pattern: 'baseName' });
createToken({ name: 'PATH', pattern: 'path' });
createToken({ name: 'PACKAGE_NAME', pattern: 'packageName' });
createToken({ name: 'AUTHENTICATION_TYPE', pattern: 'authenticationType' });
createToken({ name: 'HIBERNATE_CACHE', pattern: 'hibernateCache' });
createToken({ name: 'CLUSTERED_HTTP_SESSION', pattern: 'clusteredHttpSession' });
createToken({ name: 'WEBSOCKET', pattern: 'websocket' });
createToken({ name: 'DATABASE_TYPE', pattern: 'databaseType' });
createToken({ name: 'DEV_DATABASE_TYPE', pattern: 'devDatabaseType' });
createToken({ name: 'PROD_DATABASE_TYPE', pattern: 'prodDatabaseType' });
createToken({ name: 'USE_COMPASS', pattern: 'useCompass' });
createToken({ name: 'BUILD_TOOL', pattern: 'buildTool' });
createToken({ name: 'SEARCH_ENGINE', pattern: 'searchEngine' });
createToken({ name: 'ENABLE_TRANSLATION', pattern: 'enableTranslation' });
createToken({ name: 'APPLICATION_TYPE', pattern: 'applicationType' });
createToken({ name: 'TEST_FRAMEWORK', pattern: 'testFrameworks' });
createToken({ name: 'LANGUAGES', pattern: 'languages' });
createToken({ name: 'SERVER_PORT', pattern: 'serverPort' });
createToken({ name: 'ENABLE_SOCIAL_SIGN_IN', pattern: 'enableSocialSignIn' });
createToken({ name: 'USE_SASS', pattern: 'useSass' });
createToken({ name: 'JHI_PREFIX', pattern: 'jhiPrefix' });
createToken({ name: 'MESSAGE_BROKER', pattern: 'messageBroker' });
createToken({ name: 'SERVICE_DISCOVERY_TYPE', pattern: 'serviceDiscoveryType' });
createToken({ name: 'CLIENT_PACKAGE_MANAGER', pattern: 'clientPackageManager' });
createToken({ name: 'CLIENT_FRAMEWORK', pattern: 'clientFramework' });
createToken({ name: 'NATIVE_LANGUAGE', pattern: 'nativeLanguage' });
createToken({ name: 'FRONT_END_BUILDER', pattern: 'frontendBuilder' });
createToken({ name: 'SKIP_USER_MANAGEMENT', pattern: 'skipUserManagement' });
createToken({ name: 'ENABLE_SWAGGER_CODEGEN', pattern: 'enableSwaggerCodegen' });
// skipClient & skipServer are already defined
createToken({ name: 'TRUE', pattern: 'true' });
createToken({ name: 'FALSE', pattern: 'false' });
// Entity constants
createToken({ name: 'ENTITY', pattern: 'entity' });
createToken({ name: 'RELATIONSHIP', pattern: 'relationship' });
createToken({ name: 'ENUM', pattern: 'enum' });
// Relationship types
createToken({ name: 'ONE_TO_ONE', pattern: 'OneToOne' });
createToken({ name: 'ONE_TO_MANY', pattern: 'OneToMany' });
createToken({ name: 'MANY_TO_ONE', pattern: 'ManyToOne' });
createToken({ name: 'MANY_TO_MANY', pattern: 'ManyToMany' });

// Options
createToken({ name: 'TO', pattern: 'to' });
createToken({ name: 'ALL', pattern: 'all' });
createToken({ name: 'STAR', pattern: '*' });
createToken({ name: 'FOR', pattern: 'for' });
createToken({ name: 'WITH', pattern: 'with' });
createToken({ name: 'EXCEPT', pattern: 'except' });
createToken({ name: 'NO_FLUENT_METHOD', pattern: 'noFluentMethod' });
createToken({ name: 'DTO', pattern: 'dto' });
createToken({ name: 'PAGINATE', pattern: 'paginate' });
createToken({ name: 'SERVICE', pattern: 'service' });
createToken({ name: 'MICROSERVICE', pattern: 'microservice' });
createToken({ name: 'SEARCH', pattern: 'search' });
createToken({ name: 'SKIP_CLIENT', pattern: 'skipClient' });
createToken({ name: 'SKIP_SERVER', pattern: 'skipServer' });
createToken({ name: 'ANGULAR_SUFFIX', pattern: 'angularSuffix' });
createToken({ name: 'FILTER', pattern: 'filter' });

// validations
createToken({ name: 'REQUIRED', pattern: 'required' });
createToken({ name: 'MIN_MAX_KEYWORD', pattern: Lexer.NA });
createToken({ name: 'MINLENGTH', pattern: 'minlength', parent: tokens.MIN_MAX_KEYWORD });
createToken({ name: 'MAXLENGTH', pattern: 'maxlength', parent: tokens.MIN_MAX_KEYWORD });
createToken({ name: 'MINBYTES', pattern: 'minbytes', parent: tokens.MIN_MAX_KEYWORD });
createToken({ name: 'MAXBYTES', pattern: 'maxbytes', parent: tokens.MIN_MAX_KEYWORD });
createToken({ name: 'MAX', pattern: 'max', parent: tokens.MIN_MAX_KEYWORD });
createToken({ name: 'MIN', pattern: 'min', parent: tokens.MIN_MAX_KEYWORD });
createToken({ name: 'PATTERN', pattern: 'pattern' });

createToken({ name: 'REGEX', pattern: /\/[^\n\r/]*\// });
createToken({ name: 'INTEGER', pattern: /-?\d+/ });

// punctuation
createToken({ name: 'LPAREN', pattern: '(' });
createToken({ name: 'RPAREN', pattern: ')' });
createToken({ name: 'LCURLY', pattern: '{' });
createToken({ name: 'RCURLY', pattern: '}' });
createToken({ name: 'LSQUARE', pattern: '[' });
createToken({ name: 'RSQUARE', pattern: ']' });
createToken({ name: 'COMMA', pattern: ',' });
createToken({ name: 'COLON', pattern: ':' });
createToken({ name: 'EQUALS', pattern: '=' });
createToken({ name: 'DOT', pattern: '.' });

// Imperative the "NAME" token will be added after all the keywords to resolve keywords vs identifier conflict.
tokens.NAME = NAME;

// TODO: The debug flag should not be enabled in productive envs for performance reasons.
// It is useful to help debug the token vector results.
const JDLLexer = new Lexer(_.values(tokens), { debug: true });

module.exports = {
  tokens,
  JDLLexer
};
