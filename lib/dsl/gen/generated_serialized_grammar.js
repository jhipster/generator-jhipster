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
    orgText:
      '() => {\n      this.MANY(() => {\n        this.OR([\n          { ALT: () => this.SUBRULE(this.entityDeclaration) },\n          { ALT: () => this.SUBRULE(this.relationDeclaration) },\n          { ALT: () => this.SUBRULE(this.enumDeclaration) },\n          { ALT: () => this.SUBRULE(this.dtoDeclaration) },\n          { ALT: () => this.SUBRULE(this.paginationDeclaration) },\n          { ALT: () => this.SUBRULE(this.serviceDeclaration) },\n          { ALT: () => this.CONSUME(LexerTokens.COMMENT) },\n          { ALT: () => this.SUBRULE(this.microserviceDeclaration) },\n          { ALT: () => this.SUBRULE(this.searchEngineDeclaration) },\n          { ALT: () => this.SUBRULE(this.noClientDeclaration) },\n          { ALT: () => this.SUBRULE(this.noServerDeclaration) },\n          { ALT: () => this.SUBRULE(this.angularSuffixDeclaration) },\n          { ALT: () => this.SUBRULE(this.noFluentMethod) },\n          { ALT: () => this.SUBRULE(this.filterDeclaration) },\n          { ALT: () => this.SUBRULE(this.clientRootFolderDeclaration) },\n          { ALT: () => this.SUBRULE(this.applicationDeclaration) },\n          { ALT: () => this.SUBRULE(this.deploymentDeclaration) },\n          // a constantDeclaration starts with a NAME, but any keyword is also a NAME\n          // So to avoid conflicts with most of the above alternatives (which start with keywords)\n          // this alternative must be last.\n          {\n            // - A Constant starts with a NAME\n            // - NAME tokens are very common\n            // That is why a more precise lookahead condition is used (The GATE)\n            // To avoid confusing errors ("expecting EQUALS but found ...")\n            GATE: () => this.LA(2).tokenType === LexerTokens.EQUALS,\n            ALT: () => this.SUBRULE(this.constantDeclaration)\n          }\n        ]);\n      });\n    }',
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
                    name: 'deploymentDeclaration',
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.NAME);\n      this.CONSUME(LexerTokens.EQUALS);\n      this.CONSUME(LexerTokens.INTEGER);\n    }',
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
        label: "'='",
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
    orgText:
      '() => {\n      this.MANY(() => {\n        this.OR([\n          { ALT: () => this.SUBRULE(this.simpleAnnotationDeclaration) },\n          { ALT: () => this.SUBRULE(this.complexAnnotationDeclaration) }\n        ]);\n      });\n\n      this.OPTION(() => {\n        this.CONSUME(LexerTokens.COMMENT);\n      });\n\n      this.CONSUME(LexerTokens.ENTITY);\n      this.CONSUME(LexerTokens.NAME);\n\n      this.OPTION1(() => {\n        this.SUBRULE(this.entityTableNameDeclaration);\n      });\n\n      this.OPTION2(() => {\n        this.SUBRULE(this.entityBody);\n      });\n    }',
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
                    name: 'simpleAnnotationDeclaration',
                    idx: 0
                  }
                ]
              },
              {
                type: 'Flat',
                definition: [
                  {
                    type: 'NonTerminal',
                    name: 'complexAnnotationDeclaration',
                    idx: 0
                  }
                ]
              }
            ]
          }
        ]
      },
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
        label: "'entity'",
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
    name: 'simpleAnnotationDeclaration',
    orgText:
      "() => {\n      this.CONSUME(LexerTokens.AT);\n      this.OR([\n        { ALT: () => this.CONSUME(LexerTokens.SKIP_CLIENT, { LABEL: 'option' }) },\n        { ALT: () => this.CONSUME(LexerTokens.SKIP_SERVER, { LABEL: 'option' }) },\n        { ALT: () => this.CONSUME(LexerTokens.FILTER, { LABEL: 'option' }) },\n        { ALT: () => this.CONSUME(LexerTokens.NO_FLUENT_METHOD, { LABEL: 'option' }) }\n      ]);\n    }",
    definition: [
      {
        type: 'Terminal',
        name: 'AT',
        label: "'@'",
        idx: 0,
        pattern: '@'
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
                name: 'SKIP_CLIENT',
                label: "'skipClient'",
                idx: 0,
                pattern: 'skipClient'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'SKIP_SERVER',
                label: "'skipServer'",
                idx: 0,
                pattern: 'skipServer'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'FILTER',
                label: "'filter'",
                idx: 0,
                pattern: 'filter'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'NO_FLUENT_METHOD',
                label: "'noFluentMethod'",
                idx: 0,
                pattern: 'noFluentMethod'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'complexAnnotationDeclaration',
    orgText:
      "() => {\n      this.CONSUME(LexerTokens.AT);\n      this.OR([\n        { ALT: () => this.CONSUME(LexerTokens.DTO, { LABEL: 'option' }) },\n        { ALT: () => this.CONSUME(LexerTokens.PAGINATE, { LABEL: 'option' }) },\n        { ALT: () => this.CONSUME(LexerTokens.SERVICE, { LABEL: 'option' }) },\n        { ALT: () => this.CONSUME(LexerTokens.MICROSERVICE, { LABEL: 'option' }) },\n        { ALT: () => this.CONSUME(LexerTokens.SEARCH, { LABEL: 'option' }) },\n        { ALT: () => this.CONSUME(LexerTokens.ANGULAR_SUFFIX, { LABEL: 'option' }) },\n        { ALT: () => this.CONSUME(LexerTokens.CLIENT_ROOT_FOLDER, { LABEL: 'option' }) }\n      ]);\n      this.CONSUME(LexerTokens.LPAREN);\n      this.CONSUME(LexerTokens.NAME, { LABEL: 'value' });\n      this.CONSUME(LexerTokens.RPAREN);\n    }",
    definition: [
      {
        type: 'Terminal',
        name: 'AT',
        label: "'@'",
        idx: 0,
        pattern: '@'
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
                name: 'DTO',
                label: "'dto'",
                idx: 0,
                pattern: 'dto'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'PAGINATE',
                label: "'paginate'",
                idx: 0,
                pattern: 'paginate'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'SERVICE',
                label: "'service'",
                idx: 0,
                pattern: 'service'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'MICROSERVICE',
                label: "'microservice'",
                idx: 0,
                pattern: 'microservice'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'SEARCH',
                label: "'search'",
                idx: 0,
                pattern: 'search'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'ANGULAR_SUFFIX',
                label: "'angularSuffix'",
                idx: 0,
                pattern: 'angularSuffix'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'CLIENT_ROOT_FOLDER',
                label: "'clientRootFolder'",
                idx: 0,
                pattern: 'clientRootFolder'
              }
            ]
          }
        ]
      },
      {
        type: 'Terminal',
        name: 'LPAREN',
        label: "'('",
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
        label: "')'",
        idx: 0,
        pattern: ')'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'entityTableNameDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.LPAREN);\n      this.CONSUME(LexerTokens.NAME);\n      this.CONSUME(LexerTokens.RPAREN);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'LPAREN',
        label: "'('",
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
        label: "')'",
        idx: 0,
        pattern: ')'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'entityBody',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.LCURLY);\n      this.MANY(() => {\n        this.SUBRULE(this.fieldDeclaration);\n        this.OPTION(() => {\n          this.CONSUME(LexerTokens.COMMA);\n        });\n      });\n      this.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'LCURLY',
        label: "'{'",
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
                label: "','",
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
        label: "'}'",
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'fieldDeclaration',
    orgText:
      '() => {\n      this.OPTION(() => {\n        this.CONSUME(LexerTokens.COMMENT);\n      });\n\n      this.CONSUME(LexerTokens.NAME);\n      this.SUBRULE(this.type);\n      this.MANY(() => {\n        this.SUBRULE(this.validation);\n      });\n\n      this.OPTION2({\n        GATE: () => {\n          const prevTok = this.LA(0);\n          const nextTok = this.LA(1);\n          // simulate "SPACE_WITHOUT_NEWLINE" of the PEG parser\n          return prevTok.startLine === nextTok.startLine;\n        },\n        DEF: () => {\n          this.CONSUME2(LexerTokens.COMMENT);\n        }\n      });\n    }',
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
    orgText: '() => {\n      this.CONSUME(LexerTokens.NAME);\n    }',
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
    orgText:
      '() => {\n      this.OR([\n        { ALT: () => this.CONSUME(LexerTokens.REQUIRED) },\n        { ALT: () => this.CONSUME(LexerTokens.UNIQUE) },\n        { ALT: () => this.SUBRULE(this.minMaxValidation) },\n        { ALT: () => this.SUBRULE(this.pattern) }\n      ]);\n    }',
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
                label: "'required'",
                idx: 0,
                pattern: 'required'
              }
            ]
          },
          {
            type: 'Flat',
            definition: [
              {
                type: 'Terminal',
                name: 'UNIQUE',
                label: "'unique'",
                idx: 0,
                pattern: 'unique'
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
    orgText:
      '() => {\n      // Note that "MIN_MAX_KEYWORD" is an abstract token and could match 6 different concrete token types\n      this.CONSUME(LexerTokens.MIN_MAX_KEYWORD);\n      this.CONSUME(LexerTokens.LPAREN);\n      this.OR([{ ALT: () => this.CONSUME(LexerTokens.INTEGER) }, { ALT: () => this.CONSUME(LexerTokens.NAME) }]);\n      this.CONSUME(LexerTokens.RPAREN);\n    }',
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
        label: "'('",
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
        label: "')'",
        idx: 0,
        pattern: ')'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'pattern',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.PATTERN);\n      this.CONSUME(LexerTokens.LPAREN);\n      this.CONSUME(LexerTokens.REGEX);\n      this.CONSUME(LexerTokens.RPAREN);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'PATTERN',
        label: "'pattern'",
        idx: 0,
        pattern: 'pattern'
      },
      {
        type: 'Terminal',
        name: 'LPAREN',
        label: "'('",
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
        label: "')'",
        idx: 0,
        pattern: ')'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'relationDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.RELATIONSHIP);\n      this.SUBRULE(this.relationshipType);\n      this.CONSUME(LexerTokens.LCURLY);\n      this.AT_LEAST_ONE(() => {\n        this.SUBRULE(this.relationshipBody);\n        this.OPTION(() => {\n          this.CONSUME(LexerTokens.COMMA);\n        });\n      });\n      this.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'RELATIONSHIP',
        label: "'relationship'",
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
        label: "'{'",
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
                label: "','",
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
        label: "'}'",
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'relationshipType',
    orgText:
      '() => {\n      this.OR([\n        { ALT: () => this.CONSUME(LexerTokens.ONE_TO_ONE) },\n        { ALT: () => this.CONSUME(LexerTokens.ONE_TO_MANY) },\n        { ALT: () => this.CONSUME(LexerTokens.MANY_TO_ONE) },\n        { ALT: () => this.CONSUME(LexerTokens.MANY_TO_MANY) }\n      ]);\n    }',
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
                label: "'OneToOne'",
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
                label: "'OneToMany'",
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
                label: "'ManyToOne'",
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
                label: "'ManyToMany'",
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
    orgText:
      "() => {\n      this.SUBRULE(this.relationshipSide, { LABEL: 'from' });\n      this.CONSUME(LexerTokens.TO);\n      this.SUBRULE2(this.relationshipSide, { LABEL: 'to' });\n    }",
    definition: [
      {
        type: 'NonTerminal',
        name: 'relationshipSide',
        idx: 0
      },
      {
        type: 'Terminal',
        name: 'TO',
        label: "'to'",
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
    orgText:
      "() => {\n      this.SUBRULE(this.comment);\n      this.CONSUME(LexerTokens.NAME);\n      this.OPTION(() => {\n        this.CONSUME(LexerTokens.LCURLY);\n        this.CONSUME2(LexerTokens.NAME, { LABEL: 'injectedField' });\n\n        this.OPTION1(() => {\n          this.CONSUME(LexerTokens.LPAREN);\n          this.CONSUME3(LexerTokens.NAME, { LABEL: 'injectedFieldParam' });\n          this.CONSUME(LexerTokens.RPAREN);\n        });\n\n        this.OPTION2(() => {\n          this.CONSUME(LexerTokens.REQUIRED);\n        });\n        this.CONSUME(LexerTokens.RCURLY);\n      });\n    }",
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
            label: "'{'",
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
                label: "'('",
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
                label: "')'",
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
                label: "'required'",
                idx: 0,
                pattern: 'required'
              }
            ]
          },
          {
            type: 'Terminal',
            name: 'RCURLY',
            label: "'}'",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.ENUM);\n      this.CONSUME(LexerTokens.NAME);\n      this.CONSUME(LexerTokens.LCURLY);\n      this.SUBRULE(this.enumPropList);\n      this.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'ENUM',
        label: "'enum'",
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
        label: "'{'",
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
        label: "'}'",
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'enumPropList',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.NAME);\n      this.MANY(() => {\n        this.CONSUME(LexerTokens.COMMA);\n        this.CONSUME2(LexerTokens.NAME);\n      });\n    }',
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
            label: "','",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.DTO);\n      this.SUBRULE(this.entityList);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'DTO',
        label: "'dto'",
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
    orgText:
      "() => {\n      this.MANY({\n        // the next section may contain [NAME, WITH], LA(2) check is used to resolve this.\n        GATE: () => this.LA(2).tokenType === LexerTokens.COMMA,\n        DEF: () => {\n          this.CONSUME(LexerTokens.NAME);\n          this.CONSUME(LexerTokens.COMMA);\n        }\n      });\n      this.OR([\n        { ALT: () => this.CONSUME(LexerTokens.ALL) },\n        { ALT: () => this.CONSUME(LexerTokens.STAR) },\n        // NAME appears after 'ALL' token as an 'ALL' token is also a valid 'NAME' token.\n        { ALT: () => this.CONSUME1(LexerTokens.NAME) }\n      ]);\n      this.CONSUME(LexerTokens.WITH);\n      this.CONSUME2(LexerTokens.NAME, { LABEL: 'method' });\n    }",
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
            label: "','",
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
                label: "'all'",
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
                label: "'*'",
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
        label: "'with'",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.EXCEPT);\n      this.CONSUME(LexerTokens.NAME);\n      this.MANY(() => {\n        this.CONSUME(LexerTokens.COMMA);\n        this.CONSUME2(LexerTokens.NAME);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'EXCEPT',
        label: "'except'",
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
            label: "','",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.PAGINATE);\n      this.SUBRULE(this.entityList);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'PAGINATE',
        label: "'paginate'",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.SERVICE);\n      this.SUBRULE(this.entityList);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'SERVICE',
        label: "'service'",
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
    name: 'searchEngineDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.SEARCH);\n      this.SUBRULE(this.entityList);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'SEARCH',
        label: "'search'",
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
    name: 'microserviceDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.MICROSERVICE);\n      this.SUBRULE(this.entityList);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'MICROSERVICE',
        label: "'microservice'",
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
    name: 'noClientDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.SKIP_CLIENT);\n      this.SUBRULE(this.filterDef);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'SKIP_CLIENT',
        label: "'skipClient'",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.SKIP_SERVER);\n      this.SUBRULE(this.filterDef);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'SKIP_SERVER',
        label: "'skipServer'",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.NO_FLUENT_METHOD);\n      this.SUBRULE(this.filterDef);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'NO_FLUENT_METHOD',
        label: "'noFluentMethod'",
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
    name: 'clientRootFolderDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.CLIENT_ROOT_FOLDER);\n      this.SUBRULE(this.entityList);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'CLIENT_ROOT_FOLDER',
        label: "'clientRootFolder'",
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
    name: 'filterDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.FILTER);\n      this.SUBRULE(this.filterDef);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'FILTER',
        label: "'filter'",
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
    name: 'filterDef',
    orgText:
      "() => {\n      this.MANY({\n        // the next section may contain [NAME, NOT_A_COMMA], LA(2) check is used to resolve this.\n        GATE: () => this.LA(2).tokenType === LexerTokens.COMMA,\n        DEF: () => {\n          this.CONSUME(LexerTokens.NAME);\n          this.CONSUME(LexerTokens.COMMA);\n        }\n      });\n      this.OR([\n        { ALT: () => this.CONSUME(LexerTokens.ALL) },\n        { ALT: () => this.CONSUME(LexerTokens.STAR) },\n        // NAME appears after 'ALL' token as an 'ALL' token is also a valid 'NAME' but is more specific.\n        { ALT: () => this.CONSUME1(LexerTokens.NAME) }\n      ]);\n    }",
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
            label: "','",
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
                label: "'all'",
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
                label: "'*'",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.ANGULAR_SUFFIX);\n      this.SUBRULE(this.entityList);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'ANGULAR_SUFFIX',
        label: "'angularSuffix'",
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
    orgText: '() => {\n      this.OPTION(() => {\n        this.CONSUME(LexerTokens.COMMENT);\n      });\n    }',
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
    name: 'deploymentDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.DEPLOYMENT);\n      this.CONSUME(LexerTokens.LCURLY);\n      this.MANY(() => {\n        this.OR([\n          { ALT: () => this.CONSUME(LexerTokens.COMMENT) },\n          { ALT: () => this.SUBRULE(this.deploymentConfigDeclaration) }\n        ]);\n      });\n      this.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'DEPLOYMENT',
        label: "'deployment'",
        idx: 0,
        pattern: 'deployment'
      },
      {
        type: 'Terminal',
        name: 'LCURLY',
        label: "'{'",
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
                    name: 'deploymentConfigDeclaration',
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
        label: "'}'",
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'deploymentConfigDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.DEPLOYMENT_KEY);\n      this.SUBRULE(this.deploymentConfigValue);\n      this.OPTION(() => {\n        this.CONSUME(LexerTokens.COMMA);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'DEPLOYMENT_KEY',
        label: 'DEPLOYMENT_KEY',
        idx: 0,
        pattern: 'NOT_APPLICABLE'
      },
      {
        type: 'NonTerminal',
        name: 'deploymentConfigValue',
        idx: 0
      },
      {
        type: 'Option',
        idx: 0,
        definition: [
          {
            type: 'Terminal',
            name: 'COMMA',
            label: "','",
            idx: 0,
            pattern: ','
          }
        ]
      }
    ]
  },
  {
    type: 'Rule',
    name: 'deploymentConfigValue',
    orgText:
      '() => {\n      this.OR([\n        { ALT: () => this.CONSUME(LexerTokens.BOOLEAN) },\n        { ALT: () => this.SUBRULE(this.qualifiedName) },\n        { ALT: () => this.SUBRULE(this.list) },\n        { ALT: () => this.CONSUME(LexerTokens.INTEGER) },\n        { ALT: () => this.CONSUME(LexerTokens.STRING) }\n      ]);\n    }',
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
    name: 'applicationDeclaration',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.APPLICATION);\n      this.CONSUME(LexerTokens.LCURLY);\n      this.SUBRULE(this.applicationSubDeclaration);\n      this.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'APPLICATION',
        label: "'application'",
        idx: 0,
        pattern: 'application'
      },
      {
        type: 'Terminal',
        name: 'LCURLY',
        label: "'{'",
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
        label: "'}'",
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'applicationSubDeclaration',
    orgText:
      '() => {\n      this.MANY(() => {\n        this.OR([\n          { ALT: () => this.SUBRULE(this.applicationSubConfig) },\n          { ALT: () => this.SUBRULE(this.applicationSubEntities) }\n        ]);\n      });\n    }',
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.CONFIG);\n      this.CONSUME(LexerTokens.LCURLY);\n      this.MANY(() => {\n        this.OR([\n          { ALT: () => this.CONSUME(LexerTokens.COMMENT) },\n          { ALT: () => this.SUBRULE(this.applicationConfigDeclaration) }\n        ]);\n      });\n      this.CONSUME(LexerTokens.RCURLY);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'CONFIG',
        label: "'config'",
        idx: 0,
        pattern: 'config'
      },
      {
        type: 'Terminal',
        name: 'LCURLY',
        label: "'{'",
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
        label: "'}'",
        idx: 0,
        pattern: '}'
      }
    ]
  },
  {
    type: 'Rule',
    name: 'applicationSubEntities',
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.ENTITIES);\n      this.SUBRULE(this.filterDef);\n      this.OPTION(() => {\n        this.SUBRULE(this.exclusion);\n      });\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'ENTITIES',
        label: "'entities'",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.CONFIG_KEY);\n      this.SUBRULE(this.configValue);\n      this.OPTION(() => {\n        this.CONSUME(LexerTokens.COMMA);\n      });\n    }',
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
            label: "','",
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
    orgText:
      '() => {\n      this.OR([\n        { ALT: () => this.CONSUME(LexerTokens.BOOLEAN) },\n        { ALT: () => this.SUBRULE(this.qualifiedName) },\n        { ALT: () => this.SUBRULE(this.list) },\n        { ALT: () => this.CONSUME(LexerTokens.INTEGER) },\n        { ALT: () => this.CONSUME(LexerTokens.STRING) }\n      ]);\n    }',
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
    orgText:
      '() => {\n      this.AT_LEAST_ONE_SEP({\n        SEP: LexerTokens.DOT,\n        DEF: () => {\n          this.CONSUME(LexerTokens.NAME);\n        }\n      });\n    }',
    definition: [
      {
        type: 'RepetitionMandatoryWithSeparator',
        idx: 0,
        separator: {
          type: 'Terminal',
          name: 'DOT',
          label: "'.'",
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
    orgText:
      '() => {\n      this.CONSUME(LexerTokens.LSQUARE);\n      this.MANY_SEP({\n        SEP: LexerTokens.COMMA,\n        DEF: () => {\n          this.CONSUME(LexerTokens.NAME);\n        }\n      });\n      this.CONSUME(LexerTokens.RSQUARE);\n    }',
    definition: [
      {
        type: 'Terminal',
        name: 'LSQUARE',
        label: "'['",
        idx: 0,
        pattern: '['
      },
      {
        type: 'RepetitionWithSeparator',
        idx: 0,
        separator: {
          type: 'Terminal',
          name: 'COMMA',
          label: "','",
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
        label: "']'",
        idx: 0,
        pattern: ']'
      }
    ]
  }
];
