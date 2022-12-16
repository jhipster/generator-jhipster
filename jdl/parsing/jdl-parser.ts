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
import { CstParser } from 'chevrotain';
import { tokens as LexerTokens } from './lexer/lexer.js';

let instance;

export default class JDLParser extends CstParser {
  constructor() {
    super(LexerTokens);
  }

  static getParser(): any {
    if (instance) {
      return instance;
    }
    instance = new JDLParser();
    return instance;
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
    this.entityList();
    this.exclusion();
    this.useOptionDeclaration();
    this.unaryOptionDeclaration();
    this.binaryOptionDeclaration();
    this.filterDef();
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
          { ALT: () => this.CONSUME(LexerTokens.JAVADOC) },
          { ALT: () => this.SUBRULE(this.useOptionDeclaration) },
          { ALT: () => this.SUBRULE(this.unaryOptionDeclaration) },
          { ALT: () => this.SUBRULE(this.binaryOptionDeclaration) },
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
            ALT: () => this.SUBRULE(this.constantDeclaration),
          },
        ]);
      });
    });
  }

  constantDeclaration(): any {
    this.RULE('constantDeclaration', () => {
      this.CONSUME(LexerTokens.NAME);
      this.CONSUME(LexerTokens.EQUALS);
      this.OR([{ ALT: () => this.CONSUME(LexerTokens.DECIMAL) }, { ALT: () => this.CONSUME(LexerTokens.INTEGER) }]);
    });
  }

  entityDeclaration(): any {
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

  annotationDeclaration(): any {
    this.RULE('annotationDeclaration', () => {
      this.CONSUME(LexerTokens.AT);
      this.CONSUME(LexerTokens.NAME, { LABEL: 'option' });
      this.OPTION(() => {
        this.CONSUME(LexerTokens.LPAREN);
        this.OR([
          { ALT: () => this.CONSUME2(LexerTokens.STRING, { LABEL: 'value' }) },
          { ALT: () => this.CONSUME2(LexerTokens.NAME, { LABEL: 'value' }) },
          { ALT: () => this.CONSUME3(LexerTokens.INTEGER, { LABEL: 'value' }) },
          { ALT: () => this.CONSUME3(LexerTokens.DECIMAL, { LABEL: 'value' }) },
        ]);
        this.CONSUME(LexerTokens.RPAREN);
      });
    });
  }

  entityTableNameDeclaration(): any {
    this.RULE('entityTableNameDeclaration', () => {
      this.CONSUME(LexerTokens.LPAREN);
      this.CONSUME(LexerTokens.NAME);
      this.CONSUME(LexerTokens.RPAREN);
    });
  }

  entityBody(): any {
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

  fieldDeclaration(): any {
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
        },
      });
    });
  }

  type(): any {
    this.RULE('type', () => {
      this.CONSUME(LexerTokens.NAME);
    });
  }

  validation(): any {
    this.RULE('validation', () => {
      this.OR([
        { ALT: () => this.CONSUME(LexerTokens.REQUIRED) },
        { ALT: () => this.CONSUME(LexerTokens.UNIQUE) },
        { ALT: () => this.SUBRULE(this.minMaxValidation) },
        { ALT: () => this.SUBRULE(this.pattern) },
      ]);
    });
  }

  minMaxValidation(): any {
    this.RULE('minMaxValidation', () => {
      // Note that "MIN_MAX_KEYWORD" is an abstract token and could match 6 different concrete token types
      this.CONSUME(LexerTokens.MIN_MAX_KEYWORD);
      this.CONSUME(LexerTokens.LPAREN);
      this.OR([
        { ALT: () => this.CONSUME(LexerTokens.DECIMAL) },
        { ALT: () => this.CONSUME(LexerTokens.INTEGER) },
        { ALT: () => this.CONSUME(LexerTokens.NAME) },
      ]);
      this.CONSUME(LexerTokens.RPAREN);
    });
  }

  pattern(): any {
    this.RULE('pattern', () => {
      this.CONSUME(LexerTokens.PATTERN);
      this.CONSUME(LexerTokens.LPAREN);
      this.CONSUME(LexerTokens.REGEX);
      this.CONSUME(LexerTokens.RPAREN);
    });
  }

  relationDeclaration(): any {
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

  relationshipType(): any {
    this.RULE('relationshipType', () => {
      this.CONSUME(LexerTokens.RELATIONSHIP_TYPE);
    });
  }

  relationshipBody(): any {
    this.RULE('relationshipBody', () => {
      this.MANY1(() => {
        this.SUBRULE1(this.annotationDeclaration, { LABEL: 'annotationOnSourceSide' });
      });
      this.SUBRULE1(this.relationshipSide, { LABEL: 'from' });
      this.CONSUME(LexerTokens.TO);
      this.MANY2(() => {
        this.SUBRULE2(this.annotationDeclaration, { LABEL: 'annotationOnDestinationSide' });
      });
      this.SUBRULE2(this.relationshipSide, { LABEL: 'to' });
      this.OPTION(() => {
        this.CONSUME(LexerTokens.WITH);
        this.SUBRULE3(this.relationshipOptions, { LABEL: 'relationshipOptions' });
      });
    });
  }

  relationshipSide(): any {
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

  relationshipOptions(): any {
    this.RULE('relationshipOptions', () => {
      this.AT_LEAST_ONE_SEP({
        SEP: LexerTokens.COMMA_WITHOUT_NEWLINE,
        DEF: () => {
          this.SUBRULE(this.relationshipOption, { LABEL: 'relationshipOption' });
        },
      });
    });
  }

  relationshipOption(): any {
    this.RULE('relationshipOption', () => {
      this.OR([{ ALT: () => this.CONSUME(LexerTokens.JPA_DERIVED_IDENTIFIER) }]);
    });
  }

  enumDeclaration(): any {
    this.RULE('enumDeclaration', () => {
      this.OPTION(() => {
        this.CONSUME(LexerTokens.JAVADOC);
      });
      this.CONSUME(LexerTokens.ENUM);
      this.CONSUME(LexerTokens.NAME);
      this.CONSUME(LexerTokens.LCURLY);
      this.SUBRULE(this.enumPropList);
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  enumPropList(): any {
    this.RULE('enumPropList', () => {
      this.SUBRULE(this.enumProp);
      this.MANY(() => {
        this.OPTION(() => {
          this.CONSUME(LexerTokens.COMMA);
        });
        this.SUBRULE1(this.enumProp);
      });
    });
  }

  enumProp(): any {
    this.RULE('enumProp', () => {
      this.OPTION(() => {
        this.CONSUME(LexerTokens.JAVADOC);
      });
      this.CONSUME(LexerTokens.NAME, { LABEL: 'enumPropKey' });
      this.OPTION1(() => {
        this.CONSUME(LexerTokens.LPAREN);
        this.OR([
          { ALT: () => this.CONSUME2(LexerTokens.STRING, { LABEL: 'enumPropValueWithQuotes' }) },
          { ALT: () => this.CONSUME3(LexerTokens.NAME, { LABEL: 'enumPropValue' }) },
        ]);
        this.CONSUME(LexerTokens.RPAREN);
      });
      this.OPTION2(() => {
        this.CONSUME1(LexerTokens.JAVADOC);
      });
    });
  }

  entityList(): any {
    this.RULE('entityList', () => {
      this.commonEntityList();
      this.CONSUME(LexerTokens.WITH);
      this.OR1([
        { ALT: () => this.CONSUME2(LexerTokens.NAME, { LABEL: 'method' }) },
        { ALT: () => this.CONSUME3(LexerTokens.STRING, { LABEL: 'methodPath' }) },
      ]);
    });
  }

  commonEntityList(): any {
    this.MANY({
      // the next section may contain [NAME, WITH], LA(2) check is used to resolve this.
      GATE: () => this.LA(2).tokenType === LexerTokens.COMMA,
      DEF: () => {
        this.CONSUME(LexerTokens.NAME);
        this.CONSUME(LexerTokens.COMMA);
      },
    });
    this.OR([{ ALT: () => this.CONSUME(LexerTokens.STAR) }, { ALT: () => this.CONSUME1(LexerTokens.NAME) }]);
  }

  exclusion(): any {
    this.RULE('exclusion', () => {
      this.CONSUME(LexerTokens.EXCEPT);
      this.CONSUME(LexerTokens.NAME);
      this.MANY(() => {
        this.CONSUME(LexerTokens.COMMA);
        this.CONSUME2(LexerTokens.NAME);
      });
    });
  }

  useOptionDeclaration(): any {
    this.RULE('useOptionDeclaration', () => {
      this.CONSUME(LexerTokens.USE);
      this.MANY({
        GATE: () => this.LA(2).tokenType === LexerTokens.COMMA,
        DEF: () => {
          this.CONSUME(LexerTokens.NAME);
          this.CONSUME(LexerTokens.COMMA);
        },
      });
      this.CONSUME1(LexerTokens.NAME);
      this.CONSUME(LexerTokens.FOR);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  unaryOptionDeclaration(): any {
    this.RULE('unaryOptionDeclaration', () => {
      this.CONSUME(LexerTokens.UNARY_OPTION);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  binaryOptionDeclaration(): any {
    this.RULE('binaryOptionDeclaration', () => {
      this.CONSUME(LexerTokens.BINARY_OPTION);
      this.SUBRULE(this.entityList);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  filterDef(): any {
    this.RULE('filterDef', this.commonEntityList);
  }

  comment(): any {
    this.RULE('comment', () => {
      this.OPTION(() => {
        this.CONSUME(LexerTokens.JAVADOC);
      });
    });
  }

  deploymentDeclaration(): any {
    this.RULE('deploymentDeclaration', () => {
      this.CONSUME(LexerTokens.DEPLOYMENT);
      this.CONSUME(LexerTokens.LCURLY);
      this.MANY(() => {
        this.OR([{ ALT: () => this.CONSUME(LexerTokens.JAVADOC) }, { ALT: () => this.SUBRULE(this.deploymentConfigDeclaration) }]);
      });
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  deploymentConfigDeclaration(): any {
    this.RULE('deploymentConfigDeclaration', () => {
      this.CONSUME(LexerTokens.DEPLOYMENT_KEY);
      this.SUBRULE(this.deploymentConfigValue);
      this.OPTION(() => {
        this.CONSUME(LexerTokens.COMMA);
      });
    });
  }

  deploymentConfigValue(): any {
    this.RULE('deploymentConfigValue', () => {
      this.OR([
        { ALT: () => this.CONSUME(LexerTokens.BOOLEAN) },
        { ALT: () => this.SUBRULE(this.qualifiedName) },
        { ALT: () => this.SUBRULE(this.list) },
        { ALT: () => this.CONSUME(LexerTokens.INTEGER) },
        { ALT: () => this.CONSUME(LexerTokens.STRING) },
      ]);
    });
  }

  applicationDeclaration(): any {
    this.RULE('applicationDeclaration', () => {
      this.CONSUME(LexerTokens.APPLICATION);
      this.CONSUME(LexerTokens.LCURLY);
      this.SUBRULE(this.applicationSubDeclaration);
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  applicationSubDeclaration(): any {
    this.RULE('applicationSubDeclaration', () => {
      this.MANY(() => {
        this.OR([
          { ALT: () => this.SUBRULE(this.applicationSubConfig) },
          { ALT: () => this.SUBRULE(this.applicationSubEntities) },
          { ALT: () => this.SUBRULE(this.unaryOptionDeclaration) },
          { ALT: () => this.SUBRULE(this.binaryOptionDeclaration) },
          { ALT: () => this.SUBRULE(this.useOptionDeclaration) },
        ]);
      });
    });
  }

  applicationSubConfig(): any {
    this.RULE('applicationSubConfig', () => {
      this.CONSUME(LexerTokens.CONFIG);
      this.CONSUME(LexerTokens.LCURLY);
      this.MANY(() => {
        this.OR([{ ALT: () => this.CONSUME(LexerTokens.JAVADOC) }, { ALT: () => this.SUBRULE(this.applicationConfigDeclaration) }]);
      });
      this.CONSUME(LexerTokens.RCURLY);
    });
  }

  applicationConfigDeclaration(): any {
    this.RULE('applicationConfigDeclaration', () => {
      this.CONSUME(LexerTokens.CONFIG_KEY);
      this.SUBRULE(this.configValue);
      this.OPTION(() => {
        this.CONSUME(LexerTokens.COMMA);
      });
    });
  }

  configValue(): any {
    this.RULE('configValue', () => {
      this.OR([
        { ALT: () => this.CONSUME(LexerTokens.BOOLEAN) },
        { ALT: () => this.SUBRULE(this.qualifiedName) },
        { ALT: () => this.SUBRULE(this.list) },
        { ALT: () => this.CONSUME(LexerTokens.INTEGER) },
        { ALT: () => this.CONSUME(LexerTokens.STRING) },
      ]);
    });
  }

  qualifiedName(): any {
    this.RULE('qualifiedName', () => {
      this.AT_LEAST_ONE_SEP({
        SEP: LexerTokens.DOT,
        DEF: () => {
          this.CONSUME(LexerTokens.NAME);
        },
      });
    });
  }

  list(): any {
    this.RULE('list', () => {
      this.CONSUME(LexerTokens.LSQUARE);
      this.MANY_SEP({
        SEP: LexerTokens.COMMA,
        DEF: () => {
          this.CONSUME(LexerTokens.NAME);
        },
      });
      this.CONSUME(LexerTokens.RSQUARE);
    });
  }

  applicationSubEntities(): any {
    this.RULE('applicationSubEntities', () => {
      this.CONSUME(LexerTokens.ENTITIES);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }
}
