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

const Parser = require('chevrotain').Parser;
const LexerTokens = require('./lexer').tokens;

module.exports = class JDLParser extends Parser {
  // Our Parser only gets initialized once, new inputs will be transferred via
  // the ".input" setter.
  constructor() {
    super([], LexerTokens, {
      outputCst: true
    });

    const $ = this;

    $.RULE('prog', () => {
      $.MANY(() => {
        $.OR([
          { ALT: () => $.SUBRULE($.entityDeclaration) },
          { ALT: () => $.SUBRULE($.relationDeclaration) },
          { ALT: () => $.SUBRULE($.enumDeclaration) },
          { ALT: () => $.SUBRULE($.dtoDeclaration) },
          { ALT: () => $.SUBRULE($.paginationDeclaration) },
          { ALT: () => $.SUBRULE($.serviceDeclaration) },
          { ALT: () => $.CONSUME(LexerTokens.COMMENT) },
          { ALT: () => $.SUBRULE($.microserviceDeclaration) },
          { ALT: () => $.SUBRULE($.searchEngineDeclaration) },
          { ALT: () => $.SUBRULE($.noClientDeclaration) },
          { ALT: () => $.SUBRULE($.noServerDeclaration) },
          { ALT: () => $.SUBRULE($.angularSuffixDeclaration) },
          { ALT: () => $.SUBRULE($.noFluentMethod) },
          { ALT: () => $.SUBRULE($.filterDeclaration) },
          { ALT: () => $.SUBRULE($.clientRootFolderDeclaration) },
          { ALT: () => $.SUBRULE($.applicationDeclaration) },
          // a constantDeclaration starts with a NAME, but any keyword is also a NAME
          // So to avoid conflicts with most of the above alternatives (which start with keywords)
          // this alternative must be last.
          {
            // - A Constant starts with a NAME
            // - NAME tokens are very common
            // That is why a more precise lookahead condition is used (The GATE)
            // To avoid confusing errors ("expecting EQUALS but found ...")
            GATE: () => $.LA(2).tokenType === LexerTokens.EQUALS,
            ALT: () => $.SUBRULE($.constantDeclaration)
          }
        ]);
      });
    });

    $.RULE('constantDeclaration', () => {
      $.CONSUME(LexerTokens.NAME);
      $.CONSUME(LexerTokens.EQUALS);
      $.CONSUME(LexerTokens.INTEGER);
    });

    $.RULE('entityDeclaration', () => {
      $.OPTION(() => {
        $.CONSUME(LexerTokens.COMMENT);
      });

      $.CONSUME(LexerTokens.ENTITY);
      $.CONSUME(LexerTokens.NAME);

      $.OPTION1(() => {
        $.SUBRULE($.entityTableNameDeclaration);
      });

      $.OPTION2(() => {
        $.SUBRULE($.entityBody);
      });
    });

    $.RULE('entityTableNameDeclaration', () => {
      $.CONSUME(LexerTokens.LPAREN);
      $.CONSUME(LexerTokens.NAME);
      $.CONSUME(LexerTokens.RPAREN);
    });

    $.RULE('entityBody', () => {
      $.CONSUME(LexerTokens.LCURLY);
      $.MANY(() => {
        $.SUBRULE($.fieldDeclaration);
        $.OPTION(() => {
          $.CONSUME(LexerTokens.COMMA);
        });
      });
      $.CONSUME(LexerTokens.RCURLY);
    });

    $.RULE('fieldDeclaration', () => {
      $.OPTION(() => {
        $.CONSUME(LexerTokens.COMMENT);
      });

      $.CONSUME(LexerTokens.NAME);
      $.SUBRULE($.type);
      $.MANY(() => {
        $.SUBRULE($.validation);
      });

      $.OPTION2({
        GATE: () => {
          const prevTok = $.LA(0);
          const nextTok = $.LA(1);
          // simulate "SPACE_WITHOUT_NEWLINE" of the PEG parser
          return prevTok.startLine === nextTok.startLine;
        },
        DEF: () => {
          $.CONSUME2(LexerTokens.COMMENT);
        }
      });
    });

    $.RULE('type', () => {
      $.CONSUME(LexerTokens.NAME);
    });

    $.RULE('validation', () => {
      $.OR([
        { ALT: () => $.CONSUME(LexerTokens.REQUIRED) },
        { ALT: () => $.SUBRULE($.minMaxValidation) },
        { ALT: () => $.SUBRULE($.pattern) }
      ]);
    });

    $.RULE('minMaxValidation', () => {
      // Note that "MIN_MAX_KEYWORD" is an abstract token and could match 6 different concrete token types
      $.CONSUME(LexerTokens.MIN_MAX_KEYWORD);
      $.CONSUME(LexerTokens.LPAREN);
      $.OR([
        { ALT: () => $.CONSUME(LexerTokens.INTEGER) },
        { ALT: () => $.CONSUME(LexerTokens.NAME) }
      ]);
      $.CONSUME(LexerTokens.RPAREN);
    });

    $.RULE('pattern', () => {
      $.CONSUME(LexerTokens.PATTERN);
      $.CONSUME(LexerTokens.LPAREN);
      $.CONSUME(LexerTokens.REGEX);
      $.CONSUME(LexerTokens.RPAREN);
    });

    $.RULE('relationDeclaration', () => {
      $.CONSUME(LexerTokens.RELATIONSHIP);
      $.SUBRULE($.relationshipType);
      $.CONSUME(LexerTokens.LCURLY);
      $.AT_LEAST_ONE(() => {
        $.SUBRULE($.relationshipBody);
        $.OPTION(() => {
          $.CONSUME(LexerTokens.COMMA);
        });
      });
      $.CONSUME(LexerTokens.RCURLY);
    });

    $.RULE('relationshipType', () => {
      $.OR([
        { ALT: () => $.CONSUME(LexerTokens.ONE_TO_ONE) },
        { ALT: () => $.CONSUME(LexerTokens.ONE_TO_MANY) },
        { ALT: () => $.CONSUME(LexerTokens.MANY_TO_ONE) },
        { ALT: () => $.CONSUME(LexerTokens.MANY_TO_MANY) }
      ]);
    });

    $.RULE('relationshipBody', () => {
      $.SUBRULE($.relationshipSide, { LABEL: 'from' });
      $.CONSUME(LexerTokens.TO);
      $.SUBRULE2($.relationshipSide, { LABEL: 'to' });
    });

    $.RULE('relationshipSide', () => {
      $.SUBRULE($.comment);
      $.CONSUME(LexerTokens.NAME);
      $.OPTION(() => {
        $.CONSUME(LexerTokens.LCURLY);
        $.CONSUME2(LexerTokens.NAME, { LABEL: 'InjectedField' });

        // TODO (REVIEW-NEEDED): the pegjs grammar allowed parenthesis in 'INJECTED_FIELD_NAME'
        // We are using grammar rules instead of lexer rules for a similar effect.
        // The main difference is that only a single pair of parenthesis are allowed.
        // document this quirk in: https://github.com/jhipster/jhipster-core/issues/184
        $.OPTION1(() => {
          $.CONSUME(LexerTokens.LPAREN);
          $.CONSUME3(LexerTokens.NAME, { LABEL: 'InjectedFieldParam' });
          $.CONSUME(LexerTokens.RPAREN);
        });

        $.OPTION2(() => {
          $.CONSUME(LexerTokens.REQUIRED);
        });
        $.CONSUME(LexerTokens.RCURLY);
      });
    });

    $.RULE('enumDeclaration', () => {
      $.CONSUME(LexerTokens.ENUM);
      $.CONSUME(LexerTokens.NAME);
      $.CONSUME(LexerTokens.LCURLY);
      $.SUBRULE($.enumPropList);
      $.CONSUME(LexerTokens.RCURLY);
    });

    $.RULE('enumPropList', () => {
      $.CONSUME(LexerTokens.NAME);
      $.MANY(() => {
        $.CONSUME(LexerTokens.COMMA);
        $.CONSUME2(LexerTokens.NAME);
      });
    });

    $.RULE('dtoDeclaration', () => {
      $.CONSUME(LexerTokens.DTO);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('entityList', () => {
      $.MANY({
        // the next section may contain [NAME, WITH], LA(2) check is used to resolve this.
        GATE: () => this.LA(2).tokenType === LexerTokens.COMMA,
        DEF: () => {
          $.CONSUME(LexerTokens.NAME);
          $.CONSUME(LexerTokens.COMMA);
        }
      });
      $.OR([
        { ALT: () => $.CONSUME(LexerTokens.ALL) },
        { ALT: () => $.CONSUME(LexerTokens.STAR) },
        // NAME appears after 'ALL' token as an 'ALL' token is also a valid 'NAME' token.
        { ALT: () => $.CONSUME1(LexerTokens.NAME) }
      ]);
      $.CONSUME(LexerTokens.WITH);
      $.CONSUME2(LexerTokens.NAME, { LABEL: 'Method' });
    });

    // combined "exclusionSub" and "exclusion".
    $.RULE('exclusion', () => {
      $.CONSUME(LexerTokens.EXCEPT);
      $.CONSUME(LexerTokens.NAME);
      $.MANY(() => {
        $.CONSUME(LexerTokens.COMMA);
        $.CONSUME2(LexerTokens.NAME);
      });
    });

    $.RULE('paginationDeclaration', () => {
      $.CONSUME(LexerTokens.PAGINATE);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('serviceDeclaration', () => {
      $.CONSUME(LexerTokens.SERVICE);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('microserviceDeclaration', () => {
      $.CONSUME(LexerTokens.MICROSERVICE);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('searchEngineDeclaration', () => {
      $.CONSUME(LexerTokens.SEARCH);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('noClientDeclaration', () => {
      $.CONSUME(LexerTokens.SKIP_CLIENT);
      $.SUBRULE($.filterDef);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('noServerDeclaration', () => {
      $.CONSUME(LexerTokens.SKIP_SERVER);
      $.SUBRULE($.filterDef);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('noFluentMethod', () => {
      $.CONSUME(LexerTokens.NO_FLUENT_METHOD);
      $.SUBRULE($.filterDef);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('filterDeclaration', () => {
      $.CONSUME(LexerTokens.FILTER);
      $.SUBRULE($.filterDef);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('clientRootFolderDeclaration', () => {
      $.CONSUME(LexerTokens.CLIENT_ROOT_FOLDER);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    // merged "subNoServerDeclaration", "subNoFluentMethod", "subFilterDeclaration",
    // "simpleEntityList" and "subNoClientDeclaration"
    // as they are identical
    $.RULE('filterDef', () => {
      $.MANY({
        // the next section may contain [NAME, NOT_A_COMMA], LA(2) check is used to resolve this.
        GATE: () => this.LA(2).tokenType === LexerTokens.COMMA,
        DEF: () => {
          $.CONSUME(LexerTokens.NAME);
          $.CONSUME(LexerTokens.COMMA);
        }
      });
      $.OR([
        { ALT: () => $.CONSUME(LexerTokens.ALL) },
        { ALT: () => $.CONSUME(LexerTokens.STAR) },
        // NAME appears after 'ALL' token as an 'ALL' token is also a valid 'NAME' but is more specific.
        { ALT: () => $.CONSUME1(LexerTokens.NAME) }
      ]);
    });

    $.RULE('angularSuffixDeclaration', () => {
      $.CONSUME(LexerTokens.ANGULAR_SUFFIX);
      $.SUBRULE($.entityList);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    $.RULE('comment', () => {
      $.OPTION(() => {
        $.CONSUME(LexerTokens.COMMENT);
      });
    });

    $.RULE('applicationDeclaration', () => {
      $.CONSUME(LexerTokens.APPLICATION);
      $.CONSUME(LexerTokens.LCURLY);
      $.SUBRULE($.applicationSubDeclaration);
      $.CONSUME(LexerTokens.RCURLY);
    });

    $.RULE('applicationSubDeclaration', () => {
      $.MANY(() => {
        $.OR([
          { ALT: () => $.SUBRULE($.applicationSubConfig) },
          { ALT: () => $.SUBRULE($.applicationSubEntities) }
        ]);
      });
    });

    $.RULE('applicationSubConfig', () => {
      $.CONSUME(LexerTokens.CONFIG);
      $.CONSUME(LexerTokens.LCURLY);
      $.MANY(() => {
        $.OR([
          { ALT: () => $.CONSUME(LexerTokens.COMMENT) },
          { ALT: () => $.SUBRULE($.applicationConfigDeclaration) }
        ]);
      });
      $.CONSUME(LexerTokens.RCURLY);
    });

    $.RULE('applicationSubEntities', () => {
      $.CONSUME(LexerTokens.ENTITIES);
      $.SUBRULE($.filterDef);
      $.OPTION(() => {
        $.SUBRULE($.exclusion);
      });
    });

    // The application config Rule was refactored
    // To reduce repetition and be more like pairs of keys and value
    // This means that we need to check if the value is valid for the key post parsing.
    // (e.g SKIP_CLIENT key id only used with a boolean value)

    // In general this can be refactored even farther and be made into proper
    // key:value pairs like JSON, so adding a new key will not require changing the syntax.
    $.RULE('applicationConfigDeclaration', () => {
      $.CONSUME(LexerTokens.CONFIG_KEY);
      $.SUBRULE($.configValue);
      $.OPTION(() => {
        $.CONSUME(LexerTokens.COMMA);
      });
    });

    $.RULE('configValue', () => {
      // note how these alternatives look more and more like a JSON Value Rule.
      // https://www.json.org/
      $.OR([
        { ALT: () => $.CONSUME(LexerTokens.BOOLEAN) },
        { ALT: () => $.SUBRULE($.qualifiedName) },
        { ALT: () => $.SUBRULE($.list) },
        { ALT: () => $.CONSUME(LexerTokens.INTEGER) },
        { ALT: () => $.CONSUME(LexerTokens.STRING) }
      ]);
    });

    $.RULE('qualifiedName', () => {
      $.AT_LEAST_ONE_SEP({
        SEP: LexerTokens.DOT,
        DEF: () => {
          $.CONSUME(LexerTokens.NAME);
        }
      });
    });

    $.RULE('list', () => {
      $.CONSUME(LexerTokens.LSQUARE);
      $.AT_LEAST_ONE_SEP({
        SEP: LexerTokens.COMMA,
        DEF: () => {
          $.CONSUME(LexerTokens.NAME);
        }
      });
      $.CONSUME(LexerTokens.RSQUARE);
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    Parser.performSelfAnalysis(this);
  }
};
