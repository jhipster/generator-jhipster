/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import type { TokenType } from 'chevrotain';
import { CstParser } from 'chevrotain';
import { NAME } from './lexer/shared-tokens.js';

export default class JDLParser extends CstParser {
  private tokens: Record<string, TokenType>;

  constructor(tokens: Record<string, TokenType>) {
    super(tokens);
    this.tokens = tokens;
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
    this.applicationSubNamespaceConfig();
    this.applicationSubEntities();
    this.applicationConfigDeclaration();
    this.configValue();
    this.applicationNamespaceConfigDeclaration();
    this.namespaceConfigValue();
    this.qualifiedName();
    this.quotedList();
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
          { ALT: () => this.CONSUME(this.tokens.JAVADOC) },
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
            GATE: () => this.LA(2).tokenType === this.tokens.EQUALS,
            ALT: () => this.SUBRULE(this.constantDeclaration),
          },
        ]);
      });
    });
  }

  constantDeclaration(): any {
    this.RULE('constantDeclaration', () => {
      this.CONSUME(this.tokens.NAME);
      this.CONSUME(this.tokens.EQUALS);
      this.OR([{ ALT: () => this.CONSUME(this.tokens.DECIMAL) }, { ALT: () => this.CONSUME(this.tokens.INTEGER) }]);
    });
  }

  entityDeclaration(): any {
    this.RULE('entityDeclaration', () => {
      this.OPTION(() => {
        this.CONSUME(this.tokens.JAVADOC);
      });

      this.MANY(() => {
        this.SUBRULE(this.annotationDeclaration);
      });

      this.CONSUME(this.tokens.ENTITY);
      this.CONSUME(this.tokens.NAME);

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
      this.CONSUME(this.tokens.AT);
      this.CONSUME(this.tokens.NAME, { LABEL: 'option' });
      this.OPTION(() => {
        this.CONSUME(this.tokens.LPAREN);
        this.OR({
          IGNORE_AMBIGUITIES: true,
          DEF: [
            { ALT: () => this.CONSUME(this.tokens.STRING, { LABEL: 'value' }) },
            { ALT: () => this.CONSUME(this.tokens.INTEGER, { LABEL: 'value' }) },
            { ALT: () => this.CONSUME(this.tokens.DECIMAL, { LABEL: 'value' }) },
            { ALT: () => this.CONSUME(this.tokens.TRUE, { LABEL: 'value' }) },
            { ALT: () => this.CONSUME(this.tokens.FALSE, { LABEL: 'value' }) },
            { ALT: () => this.CONSUME2(this.tokens.NAME, { LABEL: 'value' }) },
          ],
        });
        this.CONSUME(this.tokens.RPAREN);
      });
    });
  }

  entityTableNameDeclaration(): any {
    this.RULE('entityTableNameDeclaration', () => {
      this.CONSUME(this.tokens.LPAREN);
      this.CONSUME(this.tokens.NAME);
      this.CONSUME(this.tokens.RPAREN);
    });
  }

  entityBody(): any {
    this.RULE('entityBody', () => {
      this.CONSUME(this.tokens.LCURLY);
      this.MANY(() => {
        this.SUBRULE(this.fieldDeclaration);
        this.OPTION(() => {
          this.CONSUME(this.tokens.COMMA);
        });
      });
      this.CONSUME(this.tokens.RCURLY);
    });
  }

  fieldDeclaration(): any {
    this.RULE('fieldDeclaration', () => {
      this.OPTION(() => {
        this.CONSUME(this.tokens.JAVADOC);
      });

      this.MANY(() => {
        this.SUBRULE(this.annotationDeclaration);
      });

      this.CONSUME(this.tokens.NAME);
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
          this.CONSUME2(this.tokens.JAVADOC);
        },
      });
    });
  }

  type(): any {
    this.RULE('type', () => {
      this.CONSUME(this.tokens.NAME);
    });
  }

  validation(): any {
    this.RULE('validation', () => {
      this.OR([
        { ALT: () => this.CONSUME(this.tokens.REQUIRED) },
        { ALT: () => this.CONSUME(this.tokens.UNIQUE) },
        { ALT: () => this.SUBRULE(this.minMaxValidation) },
        { ALT: () => this.SUBRULE(this.pattern) },
      ]);
    });
  }

  minMaxValidation(): any {
    this.RULE('minMaxValidation', () => {
      // Note that "MIN_MAX_KEYWORD" is an abstract token and could match 6 different concrete token types
      this.CONSUME(this.tokens.MIN_MAX_KEYWORD);
      this.CONSUME(this.tokens.LPAREN);
      this.OR([
        { ALT: () => this.CONSUME(this.tokens.DECIMAL) },
        { ALT: () => this.CONSUME(this.tokens.INTEGER) },
        { ALT: () => this.CONSUME(this.tokens.NAME) },
      ]);
      this.CONSUME(this.tokens.RPAREN);
    });
  }

  pattern(): any {
    this.RULE('pattern', () => {
      this.CONSUME(this.tokens.PATTERN);
      this.CONSUME(this.tokens.LPAREN);
      this.CONSUME(this.tokens.REGEX);
      this.CONSUME(this.tokens.RPAREN);
    });
  }

  relationDeclaration(): any {
    this.RULE('relationDeclaration', () => {
      this.CONSUME(this.tokens.RELATIONSHIP);
      this.SUBRULE(this.relationshipType);
      this.CONSUME(this.tokens.LCURLY);
      this.AT_LEAST_ONE(() => {
        this.SUBRULE(this.relationshipBody);
        this.OPTION(() => {
          this.CONSUME(this.tokens.COMMA);
        });
      });
      this.CONSUME(this.tokens.RCURLY);
    });
  }

  relationshipType(): any {
    this.RULE('relationshipType', () => {
      this.CONSUME(this.tokens.RELATIONSHIP_TYPE);
    });
  }

  relationshipBody(): any {
    this.RULE('relationshipBody', () => {
      this.MANY1(() => {
        this.SUBRULE1(this.annotationDeclaration, { LABEL: 'annotationOnSourceSide' });
      });
      this.SUBRULE1(this.relationshipSide, { LABEL: 'from' });
      this.CONSUME(this.tokens.TO);
      this.MANY2(() => {
        this.SUBRULE2(this.annotationDeclaration, { LABEL: 'annotationOnDestinationSide' });
      });
      this.SUBRULE2(this.relationshipSide, { LABEL: 'to' });
      this.OPTION(() => {
        this.CONSUME(this.tokens.WITH);
        this.SUBRULE3(this.relationshipOptions, { LABEL: 'relationshipOptions' });
      });
    });
  }

  relationshipSide(): any {
    this.RULE('relationshipSide', () => {
      this.SUBRULE(this.comment);
      this.CONSUME(this.tokens.NAME);
      this.OPTION(() => {
        this.CONSUME(this.tokens.LCURLY);
        this.CONSUME2(this.tokens.NAME, { LABEL: 'injectedField' });

        this.OPTION1(() => {
          this.CONSUME(this.tokens.LPAREN);
          this.CONSUME3(this.tokens.NAME, { LABEL: 'injectedFieldParam' });
          this.CONSUME(this.tokens.RPAREN);
        });

        this.OPTION2(() => {
          this.CONSUME(this.tokens.REQUIRED);
        });
        this.CONSUME(this.tokens.RCURLY);
      });
    });
  }

  relationshipOptions(): any {
    this.RULE('relationshipOptions', () => {
      this.AT_LEAST_ONE_SEP({
        SEP: this.tokens.COMMA_WITHOUT_NEWLINE,
        DEF: () => {
          this.SUBRULE(this.relationshipOption, { LABEL: 'relationshipOption' });
        },
      });
    });
  }

  relationshipOption(): any {
    this.RULE('relationshipOption', () => {
      this.OR([{ ALT: () => this.CONSUME(this.tokens.BUILT_IN_ENTITY) }]);
    });
  }

  enumDeclaration(): any {
    this.RULE('enumDeclaration', () => {
      this.OPTION(() => {
        this.CONSUME(this.tokens.JAVADOC);
      });
      this.CONSUME(this.tokens.ENUM);
      this.CONSUME(this.tokens.NAME);
      this.CONSUME(this.tokens.LCURLY);
      this.SUBRULE(this.enumPropList);
      this.CONSUME(this.tokens.RCURLY);
    });
  }

  enumPropList(): any {
    this.RULE('enumPropList', () => {
      this.SUBRULE(this.enumProp);
      this.MANY(() => {
        this.OPTION(() => {
          this.CONSUME(this.tokens.COMMA);
        });
        this.SUBRULE1(this.enumProp);
      });
    });
  }

  enumProp(): any {
    this.RULE('enumProp', () => {
      this.OPTION(() => {
        this.CONSUME(this.tokens.JAVADOC);
      });
      this.CONSUME(this.tokens.NAME, { LABEL: 'enumPropKey' });
      this.OPTION1(() => {
        this.CONSUME(this.tokens.LPAREN);
        this.OR([
          { ALT: () => this.CONSUME2(this.tokens.STRING, { LABEL: 'enumPropValueWithQuotes' }) },
          { ALT: () => this.CONSUME3(this.tokens.NAME, { LABEL: 'enumPropValue' }) },
        ]);
        this.CONSUME(this.tokens.RPAREN);
      });
      this.OPTION2(() => {
        this.CONSUME1(this.tokens.JAVADOC);
      });
    });
  }

  entityList(): any {
    this.RULE('entityList', () => {
      this.commonEntityList();
      this.CONSUME(this.tokens.WITH);
      this.OR1([
        { ALT: () => this.CONSUME2(this.tokens.NAME, { LABEL: 'method' }) },
        { ALT: () => this.CONSUME3(this.tokens.STRING, { LABEL: 'methodPath' }) },
      ]);
    });
  }

  commonEntityList(): any {
    this.MANY({
      // the next section may contain [NAME, WITH], LA(2) check is used to resolve this.
      GATE: () => this.LA(2).tokenType === this.tokens.COMMA,
      DEF: () => {
        this.CONSUME(this.tokens.NAME);
        this.CONSUME(this.tokens.COMMA);
      },
    });
    this.OR([{ ALT: () => this.CONSUME(this.tokens.STAR) }, { ALT: () => this.CONSUME1(this.tokens.NAME) }]);
  }

  exclusion(): any {
    this.RULE('exclusion', () => {
      this.CONSUME(this.tokens.EXCEPT);
      this.CONSUME(this.tokens.NAME);
      this.MANY(() => {
        this.CONSUME(this.tokens.COMMA);
        this.CONSUME2(this.tokens.NAME);
      });
    });
  }

  useOptionDeclaration(): any {
    this.RULE('useOptionDeclaration', () => {
      this.CONSUME(this.tokens.USE);
      this.MANY({
        GATE: () => this.LA(2).tokenType === this.tokens.COMMA,
        DEF: () => {
          this.CONSUME(this.tokens.NAME);
          this.CONSUME(this.tokens.COMMA);
        },
      });
      this.CONSUME1(this.tokens.NAME);
      this.CONSUME(this.tokens.FOR);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  unaryOptionDeclaration(): any {
    this.RULE('unaryOptionDeclaration', () => {
      this.CONSUME(this.tokens.UNARY_OPTION);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }

  binaryOptionDeclaration(): any {
    this.RULE('binaryOptionDeclaration', () => {
      this.CONSUME(this.tokens.BINARY_OPTION);
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
        this.CONSUME(this.tokens.JAVADOC);
      });
    });
  }

  deploymentDeclaration(): any {
    this.RULE('deploymentDeclaration', () => {
      this.CONSUME(this.tokens.DEPLOYMENT);
      this.CONSUME(this.tokens.LCURLY);
      this.MANY(() => {
        this.OR([{ ALT: () => this.CONSUME(this.tokens.JAVADOC) }, { ALT: () => this.SUBRULE(this.deploymentConfigDeclaration) }]);
      });
      this.CONSUME(this.tokens.RCURLY);
    });
  }

  deploymentConfigDeclaration(): any {
    this.RULE('deploymentConfigDeclaration', () => {
      this.CONSUME(this.tokens.DEPLOYMENT_KEY);
      this.SUBRULE(this.deploymentConfigValue);
      this.OPTION(() => {
        this.CONSUME(this.tokens.COMMA);
      });
    });
  }

  deploymentConfigValue(): any {
    this.RULE('deploymentConfigValue', () => {
      this.OR([
        { ALT: () => this.CONSUME(this.tokens.BOOLEAN) },
        { ALT: () => this.SUBRULE(this.qualifiedName) },
        { ALT: () => this.SUBRULE(this.list) },
        { ALT: () => this.CONSUME(this.tokens.INTEGER) },
        { ALT: () => this.CONSUME(this.tokens.STRING) },
      ]);
    });
  }

  applicationDeclaration(): any {
    this.RULE('applicationDeclaration', () => {
      this.CONSUME(this.tokens.APPLICATION);
      this.CONSUME(this.tokens.LCURLY);
      this.SUBRULE(this.applicationSubDeclaration);
      this.CONSUME(this.tokens.RCURLY);
    });
  }

  applicationSubDeclaration(): any {
    this.RULE('applicationSubDeclaration', () => {
      this.MANY(() => {
        this.OR([
          { ALT: () => this.SUBRULE(this.applicationSubNamespaceConfig) },
          { ALT: () => this.SUBRULE(this.applicationSubConfig) },
          { ALT: () => this.SUBRULE(this.applicationSubEntities) },
          { ALT: () => this.SUBRULE(this.unaryOptionDeclaration) },
          { ALT: () => this.SUBRULE(this.binaryOptionDeclaration) },
          { ALT: () => this.SUBRULE(this.useOptionDeclaration) },
        ]);
      });
    });
  }

  applicationSubNamespaceConfig(): any {
    this.RULE('applicationSubNamespaceConfig', () => {
      this.CONSUME(this.tokens.CONFIG);
      this.CONSUME(this.tokens.LPAREN);
      this.CONSUME(this.tokens.NAME, { LABEL: 'namespace' });
      this.CONSUME(this.tokens.RPAREN);
      this.CONSUME(this.tokens.LCURLY);
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(this.tokens.JAVADOC) },
          { ALT: () => this.SUBRULE(this.applicationNamespaceConfigDeclaration) },
        ]);
      });
      this.CONSUME(this.tokens.RCURLY);
    });
  }

  applicationNamespaceConfigDeclaration(): any {
    this.RULE('applicationNamespaceConfigDeclaration', () => {
      this.CONSUME(NAME);
      this.SUBRULE(this.namespaceConfigValue);
      this.OPTION(() => {
        this.CONSUME(this.tokens.COMMA);
      });
    });
  }

  namespaceConfigValue(): any {
    this.RULE('namespaceConfigValue', () => {
      this.OR([
        { ALT: () => this.CONSUME(this.tokens.BOOLEAN) },
        { ALT: () => this.SUBRULE(this.qualifiedName) },
        { ALT: () => this.SUBRULE(this.list) },
        { ALT: () => this.CONSUME(this.tokens.INTEGER) },
        { ALT: () => this.CONSUME(this.tokens.STRING) },
      ]);
    });
  }

  applicationSubConfig(): any {
    this.RULE('applicationSubConfig', () => {
      this.CONSUME(this.tokens.CONFIG);
      this.CONSUME(this.tokens.LCURLY);
      this.MANY(() => {
        this.OR([{ ALT: () => this.CONSUME(this.tokens.JAVADOC) }, { ALT: () => this.SUBRULE(this.applicationConfigDeclaration) }]);
      });
      this.CONSUME(this.tokens.RCURLY);
    });
  }

  applicationConfigDeclaration(): any {
    this.RULE('applicationConfigDeclaration', () => {
      this.CONSUME(this.tokens.CONFIG_KEY);
      this.SUBRULE(this.configValue);
      this.OPTION(() => {
        this.CONSUME(this.tokens.COMMA);
      });
    });
  }

  configValue(): any {
    this.RULE('configValue', () => {
      this.OR([
        { ALT: () => this.CONSUME(this.tokens.BOOLEAN) },
        { ALT: () => this.SUBRULE(this.qualifiedName) },
        { ALT: () => this.SUBRULE(this.quotedList) },
        { ALT: () => this.SUBRULE(this.list) },
        { ALT: () => this.CONSUME(this.tokens.INTEGER) },
        { ALT: () => this.CONSUME(this.tokens.STRING) },
      ]);
    });
  }

  qualifiedName(): any {
    this.RULE('qualifiedName', () => {
      this.AT_LEAST_ONE_SEP({
        SEP: this.tokens.DOT,
        DEF: () => {
          this.CONSUME(this.tokens.NAME);
        },
      });
    });
  }

  list(): any {
    this.RULE('list', () => {
      this.CONSUME(this.tokens.LSQUARE);
      this.MANY_SEP({
        SEP: this.tokens.COMMA,
        DEF: () => {
          this.CONSUME(this.tokens.NAME);
        },
      });
      this.CONSUME(this.tokens.RSQUARE);
    });
  }

  quotedList(): any {
    this.RULE('quotedList', () => {
      this.CONSUME(this.tokens.LSQUARE);
      this.AT_LEAST_ONE_SEP({
        SEP: this.tokens.COMMA,
        DEF: () => {
          this.CONSUME(this.tokens.STRING);
        },
      });
      this.CONSUME(this.tokens.RSQUARE);
    });
  }

  applicationSubEntities(): any {
    this.RULE('applicationSubEntities', () => {
      this.CONSUME(this.tokens.ENTITIES);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
  }
}
