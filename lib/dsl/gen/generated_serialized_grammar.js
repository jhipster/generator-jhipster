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

/* eslint-disable no-unused-vars */
const serializedGrammar = [
  {
    type: 'Rule',
    name: 'prog',
    orgText: '() => {\n      $.MANY(() => {\n        $.OR([\n          { ALT: () => $.SUBRULE($.entityDeclaration) },\n          { ALT: () => $.SUBRULE($.relationDeclaration) },\n          { ALT: () => $.SUBRULE($.enumDeclaration) },\n          { ALT: () => $.SUBRULE($.dtoDeclaration) },\n          { ALT: () => $.SUBRULE($.paginationDeclaration) },\n          { ALT: () => $.SUBRULE($.serviceDeclaration) },\n          { ALT: () => $.CONSUME(LexerTokens.COMMENT) },\n          { ALT: () => $.SUBRULE($.microserviceDeclaration) },\n          { ALT: () => $.SUBRULE($.searchEngineDeclaration) },\n          { ALT: () => $.SUBRULE($.noClientDeclaration) },\n          { ALT: () => $.SUBRULE($.noServerDeclaration) },\n          { ALT: () => $.SUBRULE($.angularSuffixDeclaration) },\n          { ALT: () => $.SUBRULE($.noFluentMethod) },\n          { ALT: () => $.SUBRULE($.filterDeclaration) },\n          { ALT: () => $.SUBRULE($.clientRootFolderDeclaration) },\n          { ALT: () => $.SUBRULE($.applicationDeclaration) },\n          // a constantDeclaration starts with a NAME, but any keyword is also a NAME\n          // So to avoid conflicts with most of the above alternatives (which start with keywords)\n          // this alternative must be last.\n          {\n            // - A Constant starts with a NAME\n            // - NAME tokens are very common\n            // That is why a more precise lookahead condition is used (The GATE)\n            // To avoid confusing errors ("expecting EQUALS but found ...")\n            GATE: () => $.LA(2).tokenType === LexerTokens.EQUALS,\n            ALT: () => $.SUBRULE($.constantDeclaration)\n          }\n        ]);\n      });\n    }',
    definition: [
      {
        type: 'Repetition',
        idx: 0,
        definition: [
          {
            type: 'Alternation',
            idx: 0,
            definition: [
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'entityDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'relationDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'enumDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'dtoDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'paginationDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'serviceDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'Terminal',
                    name: 'COMMENT',
                    label: 'COMMENT',
                    idx: 0,
                    pattern: '\\/\\*([\\s\\S]*?)\\*\\/'
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'microserviceDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'searchEngineDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'noClientDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'noServerDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'angularSuffixDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'noFluentMethod',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'filterDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'clientRootFolderDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'applicationDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'constantDeclaration',
                    idx: 0
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'constantDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.NAME);\n      $.CONSUME(LexerTokens.EQUALS);\n      $.CONSUME(LexerTokens.INTEGER);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 0,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      },
      {
        type: 'Terminal',
        name: 'EQUALS',
        label: '\'=\'',
        idx: 0,
        pattern: '='
      },
      {
        type: 'Terminal',
        name: 'INTEGER',
        label: 'INTEGER',
        idx: 0,
        pattern: '-?\\d+'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'entityDeclaration',
    orgText: '() => {\n      $.OPTION(() => {\n        $.CONSUME(LexerTokens.COMMENT);\n      });\n\n      $.CONSUME(LexerTokens.ENTITY);\n      $.CONSUME(LexerTokens.NAME);\n\n      $.OPTION1(() => {\n        $.SUBRULE($.entityTableNameDeclaration);\n      });\n\n      $.OPTION2(() => {\n        $.SUBRULE($.entityBody);\n      });\n    }',
    definition: [
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'COMMENT',
            label: 'COMMENT',
            idx: 0,
            pattern: '\\/\\*([\\s\\S]*?)\\*\\/'
          }
        ]
      },
      {
        type: 'Terminal',
        name: 'ENTITY',
        label: '\'entity\'',
        idx: 0,
        pattern: 'entity'
      },
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 0,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      },
      {
        type: 'Option',
        idx: 1,
        definition: [
          {
            type: 'NonTerminal',
            name: 'entityTableNameDeclaration',
            idx: 0
          }
        ]
      },
      {
        type: 'Option',
        idx: 2,
        definition: [
          {
            type: 'NonTerminal',
            name: 'entityBody',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'entityTableNameDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.LPAREN);\n      $.CONSUME(LexerTokens.NAME);\n      $.CONSUME(LexerTokens.RPAREN);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'LPAREN',
        label: '\'(\'',
        idx: 0,
        pattern: '('
      },
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 0,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      },
      {
        type: 'Terminal',
        name: 'RPAREN',
        label: '\')\'',
        idx: 0,
        pattern: ')'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'entityBody',
    orgText: '() => {\n      $.CONSUME(LexerTokens.LCURLY);\n      $.MANY(() => {\n        $.SUBRULE($.fieldDeclaration);\n        $.OPTION(() => {\n          $.CONSUME(LexerTokens.COMMA);\n        });\n      });\n      $.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'LCURLY',
        label: '\'{\'',
        idx: 0,
        pattern: '{'
      },
      {
        type: 'Repetition',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'fieldDeclaration',
            idx: 0
          },
          {
            type: 'Option',
            idx: 0,
            definition: [
              {
                type: 'Terminal',
                name: 'COMMA',
                label: '\',\'',
                idx: 0,
                pattern: ','
              }
            ]
          }
        ]
      },
      {
        type: 'Terminal',
        name: 'RCURLY',
        label: '\'}\'',
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'fieldDeclaration',
    orgText: '() => {\n      $.OPTION(() => {\n        $.CONSUME(LexerTokens.COMMENT);\n      });\n\n      $.CONSUME(LexerTokens.NAME);\n      $.SUBRULE($.type);\n      $.MANY(() => {\n        $.SUBRULE($.validation);\n      });\n\n      $.OPTION2({\n        GATE: () => {\n          const prevTok = $.LA(0);\n          const nextTok = $.LA(1);\n          // simulate "SPACE_WITHOUT_NEWLINE" of the PEG parser\n          return prevTok.startLine === nextTok.startLine;\n        },\n        DEF: () => {\n          $.CONSUME2(LexerTokens.COMMENT);\n        }\n      });\n    }',
    definition: [
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'COMMENT',
            label: 'COMMENT',
            idx: 0,
            pattern: '\\/\\*([\\s\\S]*?)\\*\\/'
          }
        ]
      },
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 0,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      },
      {
        type: 'NonTerminal',
        name: 'type',
        idx: 0
      },
      {
        type: 'Repetition',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'validation',
            idx: 0
          }
        ]
      },
      {
        type: 'Option',
        idx: 2,
        definition: [
          {
            type: 'Terminal',
            name: 'COMMENT',
            label: 'COMMENT',
            idx: 2,
            pattern: '\\/\\*([\\s\\S]*?)\\*\\/'
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'type',
    orgText: '() => {\n      $.CONSUME(LexerTokens.NAME);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 0,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'validation',
    orgText: '() => {\n      $.OR([\n        { ALT: () => $.CONSUME(LexerTokens.REQUIRED) },\n        { ALT: () => $.SUBRULE($.minMaxValidation) },\n        { ALT: () => $.SUBRULE($.pattern) }\n      ]);\n    }',
    definition: [
      {
        type: 'Alternation',
        idx: 0,
        definition: [
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'REQUIRED',
                label: '\'required\'',
                idx: 0,
                pattern: 'required'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'NonTerminal',
                name: 'minMaxValidation',
                idx: 0
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'NonTerminal',
                name: 'pattern',
                idx: 0
              }
            ]
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'minMaxValidation',
    orgText: '() => {\n      // Note that "MIN_MAX_KEYWORD" is an abstract token and could match 6 different concrete token types\n      $.CONSUME(LexerTokens.MIN_MAX_KEYWORD);\n      $.CONSUME(LexerTokens.LPAREN);\n      $.OR([\n        { ALT: () => $.CONSUME(LexerTokens.INTEGER) },\n        { ALT: () => $.CONSUME(LexerTokens.NAME) }\n      ]);\n      $.CONSUME(LexerTokens.RPAREN);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'MIN_MAX_KEYWORD',
        label: 'MIN_MAX_KEYWORD',
        idx: 0,
        pattern: 'NOT_APPLICABLE'
      },
      {
        type: 'Terminal',
        name: 'LPAREN',
        label: '\'(\'',
        idx: 0,
        pattern: '('
      },
      {
        type: 'Alternation',
        idx: 0,
        definition: [
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'INTEGER',
                label: 'INTEGER',
                idx: 0,
                pattern: '-?\\d+'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 0,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
              }
            ]
          }
        ]
      },
      {
        type: 'Terminal',
        name: 'RPAREN',
        label: '\')\'',
        idx: 0,
        pattern: ')'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'pattern',
    orgText: '() => {\n      $.CONSUME(LexerTokens.PATTERN);\n      $.CONSUME(LexerTokens.LPAREN);\n      $.CONSUME(LexerTokens.REGEX);\n      $.CONSUME(LexerTokens.RPAREN);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'PATTERN',
        label: '\'pattern\'',
        idx: 0,
        pattern: 'pattern'
      },
      {
        type: 'Terminal',
        name: 'LPAREN',
        label: '\'(\'',
        idx: 0,
        pattern: '('
      },
      {
        type: 'Terminal',
        name: 'REGEX',
        label: 'REGEX',
        idx: 0,
        pattern: '\\/[^\\n\\r\\/]*\\/'
      },
      {
        type: 'Terminal',
        name: 'RPAREN',
        label: '\')\'',
        idx: 0,
        pattern: ')'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'relationDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.RELATIONSHIP);\n      $.SUBRULE($.relationshipType);\n      $.CONSUME(LexerTokens.LCURLY);\n      $.AT_LEAST_ONE(() => {\n        $.SUBRULE($.relationshipBody);\n        $.OPTION(() => {\n          $.CONSUME(LexerTokens.COMMA);\n        });\n      });\n      $.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'RELATIONSHIP',
        label: '\'relationship\'',
        idx: 0,
        pattern: 'relationship'
      },
      {
        type: 'NonTerminal',
        name: 'relationshipType',
        idx: 0
      },
      {
        type: 'Terminal',
        name: 'LCURLY',
        label: '\'{\'',
        idx: 0,
        pattern: '{'
      },
      {
        type: 'RepetitionMandatory',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'relationshipBody',
            idx: 0
          },
          {
            type: 'Option',
            idx: 0,
            definition: [
              {
                type: 'Terminal',
                name: 'COMMA',
                label: '\',\'',
                idx: 0,
                pattern: ','
              }
            ]
          }
        ]
      },
      {
        type: 'Terminal',
        name: 'RCURLY',
        label: '\'}\'',
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'relationshipType',
    orgText: '() => {\n      $.OR([\n        { ALT: () => $.CONSUME(LexerTokens.ONE_TO_ONE) },\n        { ALT: () => $.CONSUME(LexerTokens.ONE_TO_MANY) },\n        { ALT: () => $.CONSUME(LexerTokens.MANY_TO_ONE) },\n        { ALT: () => $.CONSUME(LexerTokens.MANY_TO_MANY) }\n      ]);\n    }',
    definition: [
      {
        type: 'Alternation',
        idx: 0,
        definition: [
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'ONE_TO_ONE',
                label: '\'OneToOne\'',
                idx: 0,
                pattern: 'OneToOne'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'ONE_TO_MANY',
                label: '\'OneToMany\'',
                idx: 0,
                pattern: 'OneToMany'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'MANY_TO_ONE',
                label: '\'ManyToOne\'',
                idx: 0,
                pattern: 'ManyToOne'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'MANY_TO_MANY',
                label: '\'ManyToMany\'',
                idx: 0,
                pattern: 'ManyToMany'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'relationshipBody',
    orgText: '() => {\n      $.SUBRULE($.relationshipSide, { LABEL: \'from\' });\n      $.CONSUME(LexerTokens.TO);\n      $.SUBRULE2($.relationshipSide, { LABEL: \'to\' });\n    }',
    definition: [
      {
        type: 'NonTerminal',
        name: 'relationshipSide',
        idx: 0
      },
      {
        type: 'Terminal',
        name: 'TO',
        label: '\'to\'',
        idx: 0,
        pattern: 'to'
      },
      {
        type: 'NonTerminal',
        name: 'relationshipSide',
        idx: 2
      }
    ]
  },
  {
    type: 'Rule',
    name: 'relationshipSide',
    orgText: '() => {\n      $.SUBRULE($.comment);\n      $.CONSUME(LexerTokens.NAME);\n      $.OPTION(() => {\n        $.CONSUME(LexerTokens.LCURLY);\n        $.CONSUME2(LexerTokens.NAME, { LABEL: \'InjectedField\' });\n\n        // TODO (REVIEW-NEEDED): the pegjs grammar allowed parenthesis in \'INJECTED_FIELD_NAME\'\n        // We are using grammar rules instead of lexer rules for a similar effect.\n        // The main difference is that only a single pair of parenthesis are allowed.\n        // document this quirk in: https://github.com/jhipster/jhipster-core/issues/184\n        $.OPTION1(() => {\n          $.CONSUME(LexerTokens.LPAREN);\n          $.CONSUME3(LexerTokens.NAME, { LABEL: \'InjectedFieldParam\' });\n          $.CONSUME(LexerTokens.RPAREN);\n        });\n\n        $.OPTION2(() => {\n          $.CONSUME(LexerTokens.REQUIRED);\n        });\n        $.CONSUME(LexerTokens.RCURLY);\n      });\n    }',
    definition: [
      {
        type: 'NonTerminal',
        name: 'comment',
        idx: 0
      },
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 0,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'LCURLY',
            label: '\'{\'',
            idx: 0,
            pattern: '{'
          },
          {
            type: 'Terminal',
            name: 'NAME',
            label: 'NAME',
            idx: 2,
            pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
          },
          {
            type: 'Option',
            idx: 1,
            definition: [
              {
                type: 'Terminal',
                name: 'LPAREN',
                label: '\'(\'',
                idx: 0,
                pattern: '('
              },
              {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 3,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
              },
              {
                type: 'Terminal',
                name: 'RPAREN',
                label: '\')\'',
                idx: 0,
                pattern: ')'
              }
            ]
          },
          {
            type: 'Option',
            idx: 2,
            definition: [
              {
                type: 'Terminal',
                name: 'REQUIRED',
                label: '\'required\'',
                idx: 0,
                pattern: 'required'
              }
            ]
          },
          {
            type: 'Terminal',
            name: 'RCURLY',
            label: '\'}\'',
            idx: 0,
            pattern: '}'
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'enumDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.ENUM);\n      $.CONSUME(LexerTokens.NAME);\n      $.CONSUME(LexerTokens.LCURLY);\n      $.SUBRULE($.enumPropList);\n      $.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'ENUM',
        label: '\'enum\'',
        idx: 0,
        pattern: 'enum'
      },
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 0,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      },
      {
        type: 'Terminal',
        name: 'LCURLY',
        label: '\'{\'',
        idx: 0,
        pattern: '{'
      },
      {
        type: 'NonTerminal',
        name: 'enumPropList',
        idx: 0
      },
      {
        type: 'Terminal',
        name: 'RCURLY',
        label: '\'}\'',
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'enumPropList',
    orgText: '() => {\n      $.CONSUME(LexerTokens.NAME);\n      $.MANY(() => {\n        $.CONSUME(LexerTokens.COMMA);\n        $.CONSUME2(LexerTokens.NAME);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 0,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      },
      {
        type: 'Repetition',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'COMMA',
            label: '\',\'',
            idx: 0,
            pattern: ','
          },
          {
            type: 'Terminal',
            name: 'NAME',
            label: 'NAME',
            idx: 2,
            pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'dtoDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.DTO);\n      $.SUBRULE($.entityList);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'DTO',
        label: '\'dto\'',
        idx: 0,
        pattern: 'dto'
      },
      {
        type: 'NonTerminal',
        name: 'entityList',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'entityList',
    orgText: '() => {\n      $.MANY({\n        // the next section may contain [NAME, WITH], LA(2) check is used to resolve this.\n        GATE: () => this.LA(2).tokenType === LexerTokens.COMMA,\n        DEF: () => {\n          $.CONSUME(LexerTokens.NAME);\n          $.CONSUME(LexerTokens.COMMA);\n        }\n      });\n      $.OR([\n        { ALT: () => $.CONSUME(LexerTokens.ALL) },\n        { ALT: () => $.CONSUME(LexerTokens.STAR) },\n        // NAME appears after \'ALL\' token as an \'ALL\' token is also a valid \'NAME\' token.\n        { ALT: () => $.CONSUME1(LexerTokens.NAME) }\n      ]);\n      $.CONSUME(LexerTokens.WITH);\n      $.CONSUME2(LexerTokens.NAME, { LABEL: \'Method\' });\n    }',
    definition: [
      {
        type: 'Repetition',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'NAME',
            label: 'NAME',
            idx: 0,
            pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
          },
          {
            type: 'Terminal',
            name: 'COMMA',
            label: '\',\'',
            idx: 0,
            pattern: ','
          }
        ]
      },
      {
        type: 'Alternation',
        idx: 0,
        definition: [
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'ALL',
                label: '\'all\'',
                idx: 0,
                pattern: 'all'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'STAR',
                label: '\'*\'',
                idx: 0,
                pattern: '*'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 1,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
              }
            ]
          }
        ]
      },
      {
        type: 'Terminal',
        name: 'WITH',
        label: '\'with\'',
        idx: 0,
        pattern: 'with'
      },
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 2,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'exclusion',
    orgText: '() => {\n      $.CONSUME(LexerTokens.EXCEPT);\n      $.CONSUME(LexerTokens.NAME);\n      $.MANY(() => {\n        $.CONSUME(LexerTokens.COMMA);\n        $.CONSUME2(LexerTokens.NAME);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'EXCEPT',
        label: '\'except\'',
        idx: 0,
        pattern: 'except'
      },
      {
        type: 'Terminal',
        name: 'NAME',
        label: 'NAME',
        idx: 0,
        pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
      },
      {
        type: 'Repetition',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'COMMA',
            label: '\',\'',
            idx: 0,
            pattern: ','
          },
          {
            type: 'Terminal',
            name: 'NAME',
            label: 'NAME',
            idx: 2,
            pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'paginationDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.PAGINATE);\n      $.SUBRULE($.entityList);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'PAGINATE',
        label: '\'paginate\'',
        idx: 0,
        pattern: 'paginate'
      },
      {
        type: 'NonTerminal',
        name: 'entityList',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'serviceDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.SERVICE);\n      $.SUBRULE($.entityList);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'SERVICE',
        label: '\'service\'',
        idx: 0,
        pattern: 'service'
      },
      {
        type: 'NonTerminal',
        name: 'entityList',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'microserviceDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.MICROSERVICE);\n      $.SUBRULE($.entityList);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'MICROSERVICE',
        label: '\'microservice\'',
        idx: 0,
        pattern: 'microservice'
      },
      {
        type: 'NonTerminal',
        name: 'entityList',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'searchEngineDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.SEARCH);\n      $.SUBRULE($.entityList);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'SEARCH',
        label: '\'search\'',
        idx: 0,
        pattern: 'search'
      },
      {
        type: 'NonTerminal',
        name: 'entityList',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'noClientDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.SKIP_CLIENT);\n      $.SUBRULE($.filterDef);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'SKIP_CLIENT',
        label: '\'skipClient\'',
        idx: 0,
        pattern: 'skipClient'
      },
      {
        type: 'NonTerminal',
        name: 'filterDef',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'noServerDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.SKIP_SERVER);\n      $.SUBRULE($.filterDef);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'SKIP_SERVER',
        label: '\'skipServer\'',
        idx: 0,
        pattern: 'skipServer'
      },
      {
        type: 'NonTerminal',
        name: 'filterDef',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'noFluentMethod',
    orgText: '() => {\n      $.CONSUME(LexerTokens.NO_FLUENT_METHOD);\n      $.SUBRULE($.filterDef);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'NO_FLUENT_METHOD',
        label: '\'noFluentMethod\'',
        idx: 0,
        pattern: 'noFluentMethod'
      },
      {
        type: 'NonTerminal',
        name: 'filterDef',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'filterDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.FILTER);\n      $.SUBRULE($.filterDef);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'FILTER',
        label: '\'filter\'',
        idx: 0,
        pattern: 'filter'
      },
      {
        type: 'NonTerminal',
        name: 'filterDef',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'clientRootFolderDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.CLIENT_ROOT_FOLDER);\n      $.SUBRULE($.entityList);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'CLIENT_ROOT_FOLDER',
        label: '\'clientRootFolder\'',
        idx: 0,
        pattern: 'clientRootFolder'
      },
      {
        type: 'NonTerminal',
        name: 'entityList',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'filterDef',
    orgText: '() => {\n      $.MANY({\n        // the next section may contain [NAME, NOT_A_COMMA], LA(2) check is used to resolve this.\n        GATE: () => this.LA(2).tokenType === LexerTokens.COMMA,\n        DEF: () => {\n          $.CONSUME(LexerTokens.NAME);\n          $.CONSUME(LexerTokens.COMMA);\n        }\n      });\n      $.OR([\n        { ALT: () => $.CONSUME(LexerTokens.ALL) },\n        { ALT: () => $.CONSUME(LexerTokens.STAR) },\n        // NAME appears after \'ALL\' token as an \'ALL\' token is also a valid \'NAME\' but is more specific.\n        { ALT: () => $.CONSUME1(LexerTokens.NAME) }\n      ]);\n    }',
    definition: [
      {
        type: 'Repetition',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'NAME',
            label: 'NAME',
            idx: 0,
            pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
          },
          {
            type: 'Terminal',
            name: 'COMMA',
            label: '\',\'',
            idx: 0,
            pattern: ','
          }
        ]
      },
      {
        type: 'Alternation',
        idx: 0,
        definition: [
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'ALL',
                label: '\'all\'',
                idx: 0,
                pattern: 'all'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'STAR',
                label: '\'*\'',
                idx: 0,
                pattern: '*'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'NAME',
                label: 'NAME',
                idx: 1,
                pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'angularSuffixDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.ANGULAR_SUFFIX);\n      $.SUBRULE($.entityList);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'ANGULAR_SUFFIX',
        label: '\'angularSuffix\'',
        idx: 0,
        pattern: 'angularSuffix'
      },
      {
        type: 'NonTerminal',
        name: 'entityList',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'comment',
    orgText: '() => {\n      $.OPTION(() => {\n        $.CONSUME(LexerTokens.COMMENT);\n      });\n    }',
    definition: [
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'COMMENT',
            label: 'COMMENT',
            idx: 0,
            pattern: '\\/\\*([\\s\\S]*?)\\*\\/'
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'applicationDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.APPLICATION);\n      $.CONSUME(LexerTokens.LCURLY);\n      $.SUBRULE($.applicationSubDeclaration);\n      $.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'APPLICATION',
        label: '\'application\'',
        idx: 0,
        pattern: 'application'
      },
      {
        type: 'Terminal',
        name: 'LCURLY',
        label: '\'{\'',
        idx: 0,
        pattern: '{'
      },
      {
        type: 'NonTerminal',
        name: 'applicationSubDeclaration',
        idx: 0
      },
      {
        type: 'Terminal',
        name: 'RCURLY',
        label: '\'}\'',
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'applicationSubDeclaration',
    orgText: '() => {\n      $.MANY(() => {\n        $.OR([\n          { ALT: () => $.SUBRULE($.applicationSubConfig) },\n          { ALT: () => $.SUBRULE($.applicationSubEntities) }\n        ]);\n      });\n    }',
    definition: [
      {
        type: 'Repetition',
        idx: 0,
        definition: [
          {
            type: 'Alternation',
            idx: 0,
            definition: [
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'applicationSubConfig',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'applicationSubEntities',
                    idx: 0
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'applicationSubConfig',
    orgText: '() => {\n      $.CONSUME(LexerTokens.CONFIG);\n      $.CONSUME(LexerTokens.LCURLY);\n      $.MANY(() => {\n        $.OR([\n          { ALT: () => $.CONSUME(LexerTokens.COMMENT) },\n          { ALT: () => $.SUBRULE($.applicationConfigDeclaration) }\n        ]);\n      });\n      $.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'CONFIG',
        label: '\'config\'',
        idx: 0,
        pattern: 'config'
      },
      {
        type: 'Terminal',
        name: 'LCURLY',
        label: '\'{\'',
        idx: 0,
        pattern: '{'
      },
      {
        type: 'Repetition',
        idx: 0,
        definition: [
          {
            type: 'Alternation',
            idx: 0,
            definition: [
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'Terminal',
                    name: 'COMMENT',
                    label: 'COMMENT',
                    idx: 0,
                    pattern: '\\/\\*([\\s\\S]*?)\\*\\/'
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'applicationConfigDeclaration',
                    idx: 0
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        type: 'Terminal',
        name: 'RCURLY',
        label: '\'}\'',
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'applicationSubEntities',
    orgText: '() => {\n      $.CONSUME(LexerTokens.ENTITIES);\n      $.SUBRULE($.filterDef);\n      $.OPTION(() => {\n        $.SUBRULE($.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'ENTITIES',
        label: '\'entities\'',
        idx: 0,
        pattern: 'entities'
      },
      {
        type: 'NonTerminal',
        name: 'filterDef',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'NonTerminal',
            name: 'exclusion',
            idx: 0
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'applicationConfigDeclaration',
    orgText: '() => {\n      $.CONSUME(LexerTokens.CONFIG_KEY);\n      $.SUBRULE($.configValue);\n      $.OPTION(() => {\n        $.CONSUME(LexerTokens.COMMA);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'CONFIG_KEY',
        label: 'CONFIG_KEY',
        idx: 0,
        pattern: 'NOT_APPLICABLE'
      },
      {
        type: 'NonTerminal',
        name: 'configValue',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'COMMA',
            label: '\',\'',
            idx: 0,
            pattern: ','
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'configValue',
    orgText: '() => {\n      // note how these alternatives look more and more like a JSON Value Rule.\n      // https://www.json.org/\n      $.OR([\n        { ALT: () => $.CONSUME(LexerTokens.BOOLEAN) },\n        { ALT: () => $.SUBRULE($.qualifiedName) },\n        { ALT: () => $.SUBRULE($.list) },\n        { ALT: () => $.CONSUME(LexerTokens.INTEGER) },\n        { ALT: () => $.CONSUME(LexerTokens.STRING) }\n      ]);\n    }',
    definition: [
      {
        type: 'Alternation',
        idx: 0,
        definition: [
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'BOOLEAN',
                label: 'BOOLEAN',
                idx: 0,
                pattern: 'NOT_APPLICABLE'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'NonTerminal',
                name: 'qualifiedName',
                idx: 0
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'NonTerminal',
                name: 'list',
                idx: 0
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'INTEGER',
                label: 'INTEGER',
                idx: 0,
                pattern: '-?\\d+'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'STRING',
                label: 'STRING',
                idx: 0,
                pattern: '"(?:[^"])*"'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'qualifiedName',
    orgText: '() => {\n      $.AT_LEAST_ONE_SEP({\n        SEP: LexerTokens.DOT,\n        DEF: () => {\n          $.CONSUME(LexerTokens.NAME);\n        }\n      });\n    }',
    definition: [
      {
        type: 'RepetitionMandatoryWithSeparator',
        idx: 0,
        separator: {
          type: 'Terminal',
          name: 'DOT',
          label: '\'.\'',
          idx: 1,
          pattern: '.'
        },
        definition: [
          {
            type: 'Terminal',
            name: 'NAME',
            label: 'NAME',
            idx: 0,
            pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'list',
    orgText: '() => {\n      $.CONSUME(LexerTokens.LSQUARE);\n      $.AT_LEAST_ONE_SEP({\n        SEP: LexerTokens.COMMA,\n        DEF: () => {\n          $.CONSUME(LexerTokens.NAME);\n        }\n      });\n      $.CONSUME(LexerTokens.RSQUARE);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'LSQUARE',
        label: '\'[\'',
        idx: 0,
        pattern: '['
      },
      {
        type: 'RepetitionMandatoryWithSeparator',
        idx: 0,
        separator: {
          type: 'Terminal',
          name: 'COMMA',
          label: '\',\'',
          idx: 1,
          pattern: ','
        },
        definition: [
          {
            type: 'Terminal',
            name: 'NAME',
            label: 'NAME',
            idx: 0,
            pattern: '[a-zA-Z_][a-zA-Z_\\-\\d]*'
          }
        ]
      },
      {
        type: 'Terminal',
        name: 'RSQUARE',
        label: '\']\'',
        idx: 0,
        pattern: ']'
      }
    ]
  }
];
