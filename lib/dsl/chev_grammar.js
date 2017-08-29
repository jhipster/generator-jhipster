const chevrotain = require('chevrotain');
const _ = require('lodash');


const Lexer = chevrotain.Lexer;
const Parser = chevrotain.Parser;

// ----------------- lexer -----------------
const tokens = {};

function createToken(config) {
  tokens[config.name] = chevrotain.createToken(config);
}

createToken({
  name: 'WhiteSpace',
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
  name: 'Comment',
  pattern: /\/\*[^]*?\*\//,
  // HIGHLIGHT:
  // By using the "group" option, the comments
  // will be collected into a separate array property
  // This means comments can do both (unlike pegjs):
  // 1. Appear anywhere.
  // 2. can be completely ignored when implementing the grammar.
  group: 'comments',
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

// validations
createToken({ name: 'REQUIRED', pattern: 'required' });

// HIGHLIGHT:
// "MIN_MAX_KEYWORD" is an "abstract" token which other concrete tokens inherit from.
// This can be used to reduce verbosity in the parser.
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

// All the names tokens of the pegjs implementation have been merged into
// a single token type. This is because they would cause ambiguities
// when the lexing stage is separated from the parsing stage.
// They restrictions on the names should be implemented as semantic checks
// That approach could also provide a better experience in an Editor
// As semantic checks don't require fault tolerance and recovery like
// syntax errors do.
// TODO: looks like the parenthesis should not be part of the name, but a suffix, eg: "maxlength(25)"
// TODO: because if it is part of the name than this is also valid "max))((Length()1)))"...
createToken({ name: 'NAME', pattern: /[a-zA-Z_][a-zA-Z_\d()]*/ });

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

// TODO: The debug flag should not be enabled in productive envs for performance reasons.
// It is useful to help debug the token vector results.
const JDLLexer = new Lexer(_.values(tokens), { debug: true });

// short prefix to reduce verbosity.
const t = tokens;

class JDLParser extends Parser {
  constructor(input) {
    super(input, tokens);

    const $ = this;

    // HIGHLIGHTS1: Any rule may be used as a start rule, there is no artificial limit
    // like in pegjs. This capability is useful for partial parsing, e.g.:
    // 1. Code snippets
    // 2. Incremental parsing of only the changed parts of an active Editor.
    // 3. writing Unit tests for micro code samples.
    $.RULE('prog', () => {
      $.OR([
        { ALT: () => { $.SUBRULE($.constantDecl); } },
        { ALT: () => { $.SUBRULE($.entityDecl); } }
      ]);
    });

    $.RULE('constantDecl', () => {
      $.CONSUME(t.NAME);
      $.CONSUME(t.EQUALS);
      $.CONSUME(t.INTEGER);
    });

    $.RULE('entityDecl', () => {
      $.CONSUME(t.ENTITY);
      $.CONSUME(t.NAME);

      $.OPTION(() => {
        $.SUBRULE($.entityTableNameDecl);
      });

      // the "2" suffix is a quirk of Chevrotain, more details:
      // https://github.com/SAP/chevrotain/blob/master/docs/faq.md#-why-are-the-unique-numerical-suffixes-consume1consume2-needed-for-the-dsl-rules
      $.OPTION2(() => {
        $.SUBRULE($.entityBody);
      });
    });

    $.RULE('entityTableNameDecl', () => {
      $.CONSUME(t.LPAREN);
      $.CONSUME(t.NAME);
      $.CONSUME(t.RPAREN);
    });

    $.RULE('entityBody', () => {
      $.CONSUME(t.LCURLY);
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.fieldDec);
      });
      $.CONSUME(t.RCURLY);
    });

    $.RULE('fieldDec', () => {
      $.CONSUME(t.NAME);
      $.SUBRULE($.type);
      // Short form for: "(X(,X)*)?"
      $.MANY_SEP({
        SEP: t.COMMA,
        DEF: () => {
          $.SUBRULE($.validation);
        }
      });
      $.CONSUME(t.RCURLY);
    });

    $.RULE('type', () => {
      $.CONSUME($.NAME);
    });

    $.RULE('validation', () => {
      $.OR([
        { ALT: () => { $.CONSUME(t.REQUIRED); } },
        { ALT: () => { $.SUBRULE($.minMaxValidation); } },
        { ALT: () => { $.SUBRULE($.pattern); } }
      ]);
    });

    $.RULE('minMaxValidation', () => {
      // HIGHLIGHT:
      // Note that "MIN_MAX_KEYWORD" is an abstract token and could match 6 different concrete token types
      $.CONSUME(t.MIN_MAX_KEYWORD);
      $.CONSUME(t.LPAREN);
      $.OR([
        { ALT: () => { $.CONSUME(t.INTEGER); } },
        { ALT: () => { $.CONSUME(t.NAME); } }
      ]);
      $.CONSUME(t.RPAREN);
    });

    $.RULE('pattern', () => {
      $.CONSUME(t.PATTERN);
      $.CONSUME(t.LPAREN);
      // HIGHLIGHT:
      // With Chevrotain the grammar can be debugged directly by using good old fashioned breakpoints.
      // No need to to try and figure out a 10,000 lines generated file, or worse not even have that
      // if we would be use some JS combinator.
      // debugger; 
      $.CONSUME(t.REGEX);
      $.CONSUME(t.RPAREN);
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    Parser.performSelfAnalysis(this);
  }
}

module.exports = {
  tokens,
  JDLLexer,
  JDLParser
};
