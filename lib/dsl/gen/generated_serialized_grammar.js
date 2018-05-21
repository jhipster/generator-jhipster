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
    definition: [
      {
        type: 'Repetition',
        definition: [
          {
            type: 'Alternation',
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
    definition: [
      {
        type: 'Option',
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
        definition: [
          {
            type: 'NonTerminal',
            name: 'fieldDeclaration',
            idx: 0
          },
          {
            type: 'Option',
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
    definition: [
      {
        type: 'Option',
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
    definition: [
      {
        type: 'Alternation',
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
        definition: [
          {
            type: 'NonTerminal',
            name: 'relationshipBody',
            idx: 0
          },
          {
            type: 'Option',
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
    definition: [
      {
        type: 'Alternation',
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
    definition: [
      {
        type: 'Repetition',
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
    definition: [
      {
        type: 'Repetition',
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
    definition: [
      {
        type: 'Option',
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
    definition: [
      {
        type: 'Repetition',
        definition: [
          {
            type: 'Alternation',
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
        definition: [
          {
            type: 'Alternation',
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
    definition: [
      {
        type: 'Alternation',
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
    definition: [
      {
        type: 'RepetitionMandatoryWithSeparator',
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
