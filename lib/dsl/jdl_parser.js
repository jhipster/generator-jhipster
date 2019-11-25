/** Copyright 2013-2019 the original author or authors from the JHipster project.
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

const { CstParser } = require('chevrotain');
const LexerTokens = require('./lexer').tokens;

let instance = null;

module.exports = class JDLParser extends CstParser {
  static getParser() {
    if (instance) {
      return instance;
    }
    instance = new JDLParser();
    return instance;
  }

  constructor() {
    super(LexerTokens);
  }

  parse() {
    this.prog();
    this.constantDeclaration();
    this.entityDeclaration();
    this.annotationDeclaration();
    this.entityTableNameDeclaration();
    this.entityBody();
    this.fieldDeclaration();
    this.type();
    this.validation();
    this.minMaxValidation();
    this.pattern();
    this.relationDeclaration();
    this.relationshipType();
    this.relationshipBody();
    this.relationshipSide();
    this.relationshipOptions();
    this.relationshipOption();
    this.enumDeclaration();
    this.enumPropList();
    this.enumProp();
    this.dtoDeclaration();
    this.entityList();
    this.exclusion();
    this.paginationDeclaration();
    this.serviceDeclaration();
    this.searchEngineDeclaration();
    this.microserviceDeclaration();
    this.noClientDeclaration();
    this.noServerDeclaration();
    this.noFluentMethod();
    this.readOnlyDeclaration();
    this.clientRootFolderDeclaration();
    this.filterDeclaration();
    this.filterDef();
    this.angularSuffixDeclaration();
    this.comment();
    this.deploymentDeclaration();
    this.deploymentConfigDeclaration();
    this.deploymentConfigValue();
    this.applicationDeclaration();
    this.applicationSubDeclaration();
    this.applicationSubConfig();
    this.applicationSubEntities();
    this.applicationConfigDeclaration();
    this.configValue();
    this.qualifiedName();
    this.list();

    // very important to call this after all the rules have been defined.
    // otherwise the parsers may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis();
  }

  prog() {
    this.RULE('prog', () => {
      this.MANY(() => {
        this.OR([
          { ALT: () => this.SUBRULE(this.entityDeclaration) },
          { ALT: () => this.SUBRULE(this.relationDeclaration) },
          { ALT: () => this.SUBRULE(this.enumDeclaration) },
          { ALT: () => this.SUBRULE(this.dtoDeclaration) },
          { ALT: () => this.SUBRULE(this.paginationDeclaration) },
          { ALT: () => this.SUBRULE(this.serviceDeclaration) },
          { ALT: () => this.CONSUME(LexerTokens.JAVADOC) },
          { ALT: () => this.SUBRULE(this.microserviceDeclaration) },
          { ALT: () => this.SUBRULE(this.searchEngineDeclaration) },
          { ALT: () => this.SUBRULE(this.noClientDeclaration) },
          { ALT: () => this.SUBRULE(this.noServerDeclaration) },
          { ALT: () => this.SUBRULE(this.angularSuffixDeclaration) },
          { ALT: () => this.SUBRULE(this.noFluentMethod) },
          { ALT: () => this.SUBRULE(this.readOnlyDeclaration) },
          { ALT: () => this.SUBRULE(this.filterDeclaration) },
          { ALT: () => this.SUBRULE(this.clientRootFolderDeclaration) },
          { ALT: () => this.SUBRULE(this.applicationDeclaration) },
          { ALT: () => this.SUBRULE(this.deploymentDeclaration) },
          // a constantDeclaration starts with a NAME, but any keyword is also a NAME
          // So to avoid conflicts with most of the above alternatives (which start with keywords)
          // this alternative must be last.
          {
            // - A Constant starts with a NAME
            // - NAME tokens are very common
            // That is why a more precise lookahead condition is used (The GATE)
            // To avoid confusing errors ("expecting EQUALS but found ...")
            GATE: () => this.LA(2).tokenType === LexerTokens.EQUALS,
            ALT: () => this.SUBRULE(this.constantDeclaration)
          }
        ]);
      });
    });
  }

  constantDeclaration() {
    this.RULE('constantDeclaration', () => {
      this.CONSUME(LexerTokens.NAME);
      this.CONSUME(LexerTokens.EQUALS);
      this.CONSUME(LexerTokens.INTEGER);
    });
  }

  entityDeclaration() {
    this.RULE('entityDeclaration', () => {
      this.OPTION(() => {
        this.CONSUME(LexerTokens.JAVADOC);
      });

      this.MANY(() => {
        this.SUBRULE(this.annotationDeclaration);
      });

      this.CONSUME(LexerTokens.ENTITY);
      this.CONSUME(LexerTokens.NAME);

      this.OPTION1(() => {
        this.SUBRULE(this.entityTableNameDeclaration);
      });

      this.OPTION2(() => {
        this.SUBRULE(this.entityBody);
      });
    });
  }

  annotationDeclaration() {
    this.RULE('annotationDeclaration', () => {
      this.CONSUME(LexerTokens.AT);
      this.CONSUME(LexerTokens.NAME, { LABEL: 'option' });
      this.OPTION(() => {
        this.CONSUME(LexerTokens.LPAREN);
        this.CONSUME2(LexerTokens.NAME, { LABEL: 'value' });
        this.CONSUME(LexerTokens.RPAREN);
      });
    });
  }

  entityTableNameDeclaration() {
    this.RULE('entityTableNameDeclaration', () => {
      this.CONSUME(LexerTokens.LPAREN);
      this.CONSUME(LexerTokens.NAME);
      this.CONSUME(LexerTokens.RPAREN);
    });
  }

  entityBody() {
    this.RULE('entityBody', () => {
      this.CONSUME(LexerTokens.LCURLY);
      this.MANY(() => {
        this.SUBRULE(this.fieldDeclaration);
        this.OPTION(() => {
          this.CONSUME(LexerTokens.COMMA);
        });
      });
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  fieldDeclaration() {
    this.RULE('fieldDeclaration', () => {
      this.OPTION(() => {
        this.CONSUME(LexerTokens.JAVADOC);
      });

      this.MANY(() => {
        this.SUBRULE(this.annotationDeclaration);
      });

      this.CONSUME(LexerTokens.NAME);
      this.SUBRULE(this.type);
      this.MANY1(() => {
        this.SUBRULE(this.validation);
      });

      this.OPTION2({
        GATE: () => {
          const prevTok = this.LA(0);
          const nextTok = this.LA(1);
          // simulate "SPACE_WITHOUT_NEWLINE" of the PEG parsers
          return prevTok.startLine === nextTok.startLine;
        },
        DEF: () => {
          this.CONSUME2(LexerTokens.JAVADOC);
        }
      });
    });
  }

  type() {
    this.RULE('type', () => {
      this.CONSUME(LexerTokens.NAME);
    });
  }

  validation() {
    this.RULE('validation', () => {
      this.OR([
        { ALT: () => this.CONSUME(LexerTokens.REQUIRED) },
        { ALT: () => this.CONSUME(LexerTokens.UNIQUE) },
        { ALT: () => this.SUBRULE(this.minMaxValidation) },
        { ALT: () => this.SUBRULE(this.pattern) }
      ]);
    });
  }

  minMaxValidation() {
    this.RULE('minMaxValidation', () => {
      // Note that "MIN_MAX_KEYWORD" is an abstract token and could match 6 different concrete token types
      this.CONSUME(LexerTokens.MIN_MAX_KEYWORD);
      this.CONSUME(LexerTokens.LPAREN);
      this.OR([{ ALT: () => this.CONSUME(LexerTokens.INTEGER) }, { ALT: () => this.CONSUME(LexerTokens.NAME) }]);
      this.CONSUME(LexerTokens.RPAREN);
    });
  }

  pattern() {
    this.RULE('pattern', () => {
      this.CONSUME(LexerTokens.PATTERN);
      this.CONSUME(LexerTokens.LPAREN);
      this.CONSUME(LexerTokens.REGEX);
      this.CONSUME(LexerTokens.RPAREN);
    });
  }

  relationDeclaration() {
    this.RULE('relationDeclaration', () => {
      this.CONSUME(LexerTokens.RELATIONSHIP);
      this.SUBRULE(this.relationshipType);
      this.CONSUME(LexerTokens.LCURLY);
      this.AT_LEAST_ONE(() => {
        this.SUBRULE(this.relationshipBody);
        this.OPTION(() => {
          this.CONSUME(LexerTokens.COMMA);
        });
      });
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  relationshipType() {
    this.RULE('relationshipType', () => {
      this.OR([
        { ALT: () => this.CONSUME(LexerTokens.ONE_TO_ONE) },
        { ALT: () => this.CONSUME(LexerTokens.ONE_TO_MANY) },
        { ALT: () => this.CONSUME(LexerTokens.MANY_TO_ONE) },
        { ALT: () => this.CONSUME(LexerTokens.MANY_TO_MANY) }
      ]);
    });
  }

  relationshipBody() {
    this.RULE('relationshipBody', () => {
      this.MANY(() => {
        this.SUBRULE(this.annotationDeclaration);
      });
      this.SUBRULE1(this.relationshipSide, { LABEL: 'from' });
      this.CONSUME(LexerTokens.TO);
      this.SUBRULE2(this.relationshipSide, { LABEL: 'to' });
      this.OPTION(() => {
        this.CONSUME(LexerTokens.WITH);
        this.SUBRULE3(this.relationshipOptions, { LABEL: 'relationshipOptions' });
      });
    });
  }

  relationshipSide() {
    this.RULE('relationshipSide', () => {
      this.SUBRULE(this.comment);
      this.CONSUME(LexerTokens.NAME);
      this.OPTION(() => {
        this.CONSUME(LexerTokens.LCURLY);
        this.CONSUME2(LexerTokens.NAME, { LABEL: 'injectedField' });

        this.OPTION1(() => {
          this.CONSUME(LexerTokens.LPAREN);
          this.CONSUME3(LexerTokens.NAME, { LABEL: 'injectedFieldParam' });
          this.CONSUME(LexerTokens.RPAREN);
        });

        this.OPTION2(() => {
          this.CONSUME(LexerTokens.REQUIRED);
        });
        this.CONSUME(LexerTokens.RCURLY);
      });
    });
  }

  relationshipOptions() {
    this.RULE('relationshipOptions', () => {
      this.AT_LEAST_ONE_SEP({
        SEP: LexerTokens.COMMA_WITHOUT_NEWLINE,
        DEF: () => {
          this.SUBRULE(this.relationshipOption, { LABEL: 'relationshipOption' });
        }
      });
    });
  }

  relationshipOption() {
    this.RULE('relationshipOption', () => {
      this.OR([{ ALT: () => this.CONSUME(LexerTokens.JPA_DERIVED_IDENTIFIER) }]);
    });
  }

  enumDeclaration() {
    this.RULE('enumDeclaration', () => {
      this.CONSUME(LexerTokens.ENUM);
      this.CONSUME(LexerTokens.NAME);
      this.CONSUME(LexerTokens.LCURLY);
      this.SUBRULE(this.enumPropList);
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  enumPropList() {
    this.RULE('enumPropList', () => {
      this.SUBRULE(this.enumProp);
      this.MANY(() => {
        this.CONSUME(LexerTokens.COMMA);
        this.SUBRULE1(this.enumProp);
      });
    });
  }

  enumProp() {
    this.RULE('enumProp', () => {
      this.CONSUME(LexerTokens.NAME, { LABEL: 'enumPropKey' });
      this.OPTION(() => {
        this.CONSUME(LexerTokens.LPAREN);
        this.CONSUME2(LexerTokens.NAME, { LABEL: 'enumPropValue' });
        this.CONSUME(LexerTokens.RPAREN);
      });
    });
  }

  dtoDeclaration() {
    this.RULE('dtoDeclaration', () => {
      this.CONSUME(LexerTokens.DTO);
      this.SUBRULE(this.entityList);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  entityList() {
    this.RULE('entityList', () => {
      this.commonEntityList();
      this.CONSUME(LexerTokens.WITH);
      this.OR1([
        { ALT: () => this.CONSUME2(LexerTokens.NAME, { LABEL: 'method' }) },
        { ALT: () => this.CONSUME3(LexerTokens.STRING, { LABEL: 'methodPath' }) }
      ]);
    });
  }

  commonEntityList() {
    this.MANY({
      // the next section may contain [NAME, WITH], LA(2) check is used to resolve this.
      GATE: () => this.LA(2).tokenType === LexerTokens.COMMA,
      DEF: () => {
        this.CONSUME(LexerTokens.NAME);
        this.CONSUME(LexerTokens.COMMA);
      }
    });
    this.OR([{ ALT: () => this.CONSUME(LexerTokens.STAR) }, { ALT: () => this.CONSUME1(LexerTokens.NAME) }]);
  }

  exclusion() {
    this.RULE('exclusion', () => {
      this.CONSUME(LexerTokens.EXCEPT);
      this.CONSUME(LexerTokens.NAME);
      this.MANY(() => {
        this.CONSUME(LexerTokens.COMMA);
        this.CONSUME2(LexerTokens.NAME);
      });
    });
  }

  paginationDeclaration() {
    this.RULE('paginationDeclaration', () => {
      this.CONSUME(LexerTokens.PAGINATE);
      this.SUBRULE(this.entityList);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  serviceDeclaration() {
    this.RULE('serviceDeclaration', () => {
      this.CONSUME(LexerTokens.SERVICE);
      this.SUBRULE(this.entityList);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  microserviceDeclaration() {
    this.RULE('microserviceDeclaration', () => {
      this.CONSUME(LexerTokens.MICROSERVICE);
      this.SUBRULE(this.entityList);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  searchEngineDeclaration() {
    this.RULE('searchEngineDeclaration', () => {
      this.CONSUME(LexerTokens.SEARCH);
      this.SUBRULE(this.entityList);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  noClientDeclaration() {
    this.RULE('noClientDeclaration', () => {
      this.CONSUME(LexerTokens.SKIP_CLIENT);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  noServerDeclaration() {
    this.RULE('noServerDeclaration', () => {
      this.CONSUME(LexerTokens.SKIP_SERVER);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  noFluentMethod() {
    this.RULE('noFluentMethod', () => {
      this.CONSUME(LexerTokens.NO_FLUENT_METHOD);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  readOnlyDeclaration() {
    this.RULE('readOnlyDeclaration', () => {
      this.CONSUME(LexerTokens.READ_ONLY);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  clientRootFolderDeclaration() {
    this.RULE('clientRootFolderDeclaration', () => {
      this.CONSUME(LexerTokens.CLIENT_ROOT_FOLDER);
      this.SUBRULE(this.entityList);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  filterDeclaration() {
    this.RULE('filterDeclaration', () => {
      this.CONSUME(LexerTokens.FILTER);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  filterDef() {
    this.RULE('filterDef', this.commonEntityList);
  }

  angularSuffixDeclaration() {
    this.RULE('angularSuffixDeclaration', () => {
      this.CONSUME(LexerTokens.ANGULAR_SUFFIX);
      this.SUBRULE(this.entityList);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  comment() {
    this.RULE('comment', () => {
      this.OPTION(() => {
        this.CONSUME(LexerTokens.JAVADOC);
      });
    });
  }

  deploymentDeclaration() {
    this.RULE('deploymentDeclaration', () => {
      this.CONSUME(LexerTokens.DEPLOYMENT);
      this.CONSUME(LexerTokens.LCURLY);
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(LexerTokens.JAVADOC) },
          { ALT: () => this.SUBRULE(this.deploymentConfigDeclaration) }
        ]);
      });
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  deploymentConfigDeclaration() {
    this.RULE('deploymentConfigDeclaration', () => {
      this.CONSUME(LexerTokens.DEPLOYMENT_KEY);
      this.SUBRULE(this.deploymentConfigValue);
      this.OPTION(() => {
        this.CONSUME(LexerTokens.COMMA);
      });
    });
  }

  deploymentConfigValue() {
    this.RULE('deploymentConfigValue', () => {
      this.OR([
        { ALT: () => this.CONSUME(LexerTokens.BOOLEAN) },
        { ALT: () => this.SUBRULE(this.qualifiedName) },
        { ALT: () => this.SUBRULE(this.list) },
        { ALT: () => this.CONSUME(LexerTokens.INTEGER) },
        { ALT: () => this.CONSUME(LexerTokens.STRING) }
      ]);
    });
  }

  applicationDeclaration() {
    this.RULE('applicationDeclaration', () => {
      this.CONSUME(LexerTokens.APPLICATION);
      this.CONSUME(LexerTokens.LCURLY);
      this.SUBRULE(this.applicationSubDeclaration);
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  applicationSubDeclaration() {
    this.RULE('applicationSubDeclaration', () => {
      this.MANY(() => {
        this.OR([
          { ALT: () => this.SUBRULE(this.applicationSubConfig) },
          { ALT: () => this.SUBRULE(this.applicationSubEntities) }
        ]);
      });
    });
  }

  applicationSubConfig() {
    this.RULE('applicationSubConfig', () => {
      this.CONSUME(LexerTokens.CONFIG);
      this.CONSUME(LexerTokens.LCURLY);
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(LexerTokens.JAVADOC) },
          { ALT: () => this.SUBRULE(this.applicationConfigDeclaration) }
        ]);
      });
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  applicationConfigDeclaration() {
    this.RULE('applicationConfigDeclaration', () => {
      this.CONSUME(LexerTokens.CONFIG_KEY);
      this.SUBRULE(this.configValue);
      this.OPTION(() => {
        this.CONSUME(LexerTokens.COMMA);
      });
    });
  }

  configValue() {
    this.RULE('configValue', () => {
      this.OR([
        { ALT: () => this.CONSUME(LexerTokens.BOOLEAN) },
        { ALT: () => this.SUBRULE(this.qualifiedName) },
        { ALT: () => this.SUBRULE(this.list) },
        { ALT: () => this.CONSUME(LexerTokens.INTEGER) },
        { ALT: () => this.CONSUME(LexerTokens.STRING) }
      ]);
    });
  }

  qualifiedName() {
    this.RULE('qualifiedName', () => {
      this.AT_LEAST_ONE_SEP({
        SEP: LexerTokens.DOT,
        DEF: () => {
          this.CONSUME(LexerTokens.NAME);
        }
      });
    });
  }

  list() {
    this.RULE('list', () => {
      this.CONSUME(LexerTokens.LSQUARE);
      this.MANY_SEP({
        SEP: LexerTokens.COMMA,
        DEF: () => {
          this.CONSUME(LexerTokens.NAME);
        }
      });
      this.CONSUME(LexerTokens.RSQUARE);
    });
  }

  applicationSubEntities() {
    this.RULE('applicationSubEntities', () => {
      this.CONSUME(LexerTokens.ENTITIES);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }
};
