const Parser = require('chevrotain').Parser;
const tokensVocabulary = require('./lexer').tokens;

// short name to reduce grammar's verbosity
const t = tokensVocabulary;


class JDLParser extends Parser {
  // Our Parser only gets initialized once, new inputs will be transferred via
  // the ".input" setter.
  constructor() {
    super([], tokensVocabulary, { recoveryEnabled: true, outputCst: true });

    const $ = this;

    // HIGHLIGHTS1: Any rule may be used as a start rule, there is no artificial limit
    // like in pegjs. This capability is useful for partial parsing, e.g.:
    // 1. Code snippets
    // 2. Incremental parsing of only the changed parts of an active Editor.
    // 3. writing Unit tests for micro code samples.
    $.RULE('prog', () => {
      $.MANY(() => {
        $.OR([
          { ALT: () => $.SUBRULE($.entityDeclaration) },
          { ALT: () => $.SUBRULE($.relationDeclaration) },
          { ALT: () => $.SUBRULE($.enumDeclaration) },
          { ALT: () => $.SUBRULE($.dtoDeclaration) },
          { ALT: () => $.SUBRULE($.paginationDeclaration) },
          { ALT: () => $.SUBRULE($.serviceDeclaration) },
          { ALT: () => $.CONSUME(t.COMMENT) },
          { ALT: () => $.SUBRULE($.microserviceDeclaration1) },
          { ALT: () => $.SUBRULE($.searchEngineDeclaration) },
          { ALT: () => $.SUBRULE($.noClientDeclaration) },
          { ALT: () => $.SUBRULE($.noServerDeclaration) },
          { ALT: () => $.SUBRULE($.angularSuffixDeclaration) },
          { ALT: () => $.SUBRULE($.noFluentMethod) },
          { ALT: () => $.SUBRULE($.filterDeclaration) },
          // a constantDeclaration starts with a NAME, but a keyword may also be a NAME
          // So to avoid conflicts with most of the above alternatives (which start with keywords)
          // this alternative must be last.
          { ALT: () => $.SUBRULE($.constantDeclaration) },
        ]);
      });
    });

    $.RULE('constantDeclaration', () => {
      $.CONSUME(t.NAME);
      $.CONSUME(t.EQUALS);
      $.CONSUME(t.INTEGER);
    });

    $.RULE('entityDeclaration', () => {
      $.CONSUME(t.ENTITY);
      $.CONSUME(t.NAME);

      $.OPTION(() => {
        $.SUBRULE($.entityTableNameDeclaration);
      });

      // the "2" suffix is a quirk of Chevrotain, more details:
      // https://github.com/SAP/chevrotain/blob/master/docs/faq.md#-why-are-the-unique-numerical-suffixes-consume1consume2-needed-for-the-dsl-rules
      $.OPTION2(() => {
        $.SUBRULE($.entityBody);
      });
    });

    $.RULE('entityTableNameDeclaration', () => {
      $.CONSUME(t.LPAREN);
      $.CONSUME(t.NAME);
      $.CONSUME(t.RPAREN);
    });

    $.RULE('entityBody', () => {
      $.CONSUME(t.LCURLY);
      $.AT_LEAST_ONE_SEP({
        // TODO: I do not understand why the original grammar seems to have allowed
        // consecutive fields without a separating comma.
        SEP: t.COMMA,
        DEF: () => {
          $.SUBRULE($.fieldDeclaration);
        }
      });
      $.CONSUME(t.RCURLY);
    });

    $.RULE('fieldDeclaration', () => {
      $.CONSUME(t.NAME);
      $.SUBRULE($.type);
      // Short form for: "(X(,X)*)?"
      $.MANY_SEP({
        SEP: t.COMMA,
        DEF: () => {
          $.SUBRULE($.validation);
        }
      });
    });

    $.RULE('type', () => {
      $.CONSUME(t.NAME);
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

    $.RULE('relationDeclaration', () => {
      $.CONSUME(t.RELATIONSHIP);
      $.SUBRULE($.relationshipType);
      $.CONSUME(t.LCURLY);
      $.MANY(() => {
        $.SUBRULE($.relationshipBody);
      });
      $.CONSUME(t.RCURLY);
    });

    $.RULE('relationshipType', () => {
      $.OR([
        { ALT: () => { $.CONSUME(t.ONE_TO_ONE); } },
        { ALT: () => { $.CONSUME(t.ONE_TO_MANY); } },
        { ALT: () => { $.CONSUME(t.MANY_TO_ONE); } },
        { ALT: () => { $.CONSUME(t.MANY_TO_MANY); } }
      ]);
    });

    $.RULE('relationshipBody', () => {
      $.SUBRULE($.relationshipSide);
      $.CONSUME(t.TO);
      $.SUBRULE2($.relationshipSide);
    });

    $.RULE('relationshipSide', () => {
      $.SUBRULE($.comment);
      $.CONSUME(t.NAME);
      $.OPTION(() => {
        $.CONSUME(t.LCURLY);
        $.CONSUME2(t.NAME);
        $.OPTION2(() => {
          $.CONSUME(t.REQUIRED);
        });
        $.CONSUME(t.RCURLY);
      });
    });

    $.RULE('enumDeclaration', () => {
      $.CONSUME(t.ENUM);
      $.CONSUME(t.NAME);
      $.CONSUME(t.LCURLY);
      $.SUBRULE($.enumPropList);
      $.CONSUME(t.RCURLY);
    });

    $.RULE('enumPropList', () => {
      $.CONSUME(t.NAME);
      $.MANY(() => {
        $.CONSUME(t.COMMA);
        $.CONSUME2(t.NAME);
      });
    });

    $.RULE('dtoDeclaration', () => {
      $.CONSUME(t.DTO);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('entityList', () => {
      $.MANY_SEP({
        SEP: t.COMMA,
        DEF: () => {
          $.CONSUME(t.NAME);
        }
      });

      $.OR([
        { ALT: () => { $.CONSUME(t.ALL); } },
        { ALT: () => { $.CONSUME(t.STAR); } },
        // NAME appears after 'ALL' token as an 'ALL' token is also a valid 'NAME'.
        { ALT: () => { $.CONSUME2(t.NAME); } },
      ]);

      $.CONSUME(t.WITH);
      $.CONSUME3(t.NAME);
    });

    // combined "exclusionSub" and "exclusion".
    $.RULE('exclusion', () => {
      $.CONSUME(t.EXCEPT);
      $.CONSUME(t.NAME);
      $.MANY(() => {
        $.CONSUME(t.COMMA);
        $.CONSUME2(t.NAME);
      });
    });

    $.RULE('paginationDeclaration', () => {
      $.CONSUME(t.PAGINATE);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('serviceDeclaration', () => {
      $.CONSUME(t.SERVICE);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('microserviceDeclaration1', () => {
      $.CONSUME(t.MICROSERVICE);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('searchEngineDeclaration', () => {
      $.CONSUME(t.SEARCH);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('noClientDeclaration', () => {
      $.CONSUME(t.SKIP_CLIENT);
      $.SUBRULE($.filterDef);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('noServerDeclaration', () => {
      $.CONSUME(t.SKIP_SERVER);
      $.SUBRULE($.filterDef);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('noFluentMethod', () => {
      $.CONSUME(t.NO_FLUENT_METHOD);
      $.SUBRULE($.filterDef);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('filterDeclaration', () => {
      $.CONSUME(t.FILTER);
      $.SUBRULE($.filterDef);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    // merged "subNoServerDeclaration", "subNoFluentMethod", "subFilterDeclaration" and "subNoClientDeclaration"
    // as they are identical
    $.RULE('filterDef', () => {
      $.MANY_SEP({
        SEP: t.COMMA,
        DEF: () => {
          $.CONSUME(t.NAME);
        }
      });

      $.OR([
        // Chevrotain Docs: If you want to better distinguish between the Parse Trees of
        // the "t.NAME" used in this rule see "IN-LINED RULES"
        // https://github.com/SAP/chevrotain/blob/master/docs/concrete_syntax_tree.md#in-lined-rules
        { ALT: () => { $.CONSUME(t.ALL); } },
        { ALT: () => { $.CONSUME(t.STAR); } },
        // NAME appears after 'ALL' token as an 'ALL' token is also a valid 'NAME'.
        { ALT: () => { $.CONSUME2(t.NAME); } }
      ]);
    });

    $.RULE('angularSuffixDeclaration', () => {
      $.CONSUME(t.ANGULAR_SUFFIX);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('comment', () => {
      $.OPTION(() => {
        $.CONSUME(t.COMMENT);
      });
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    Parser.performSelfAnalysis(this);
  }
}

module.exports = {
  JDLParser
};
