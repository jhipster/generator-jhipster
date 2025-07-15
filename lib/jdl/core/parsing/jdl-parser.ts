/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import type { CstNode, TokenType } from 'chevrotain';
import { CstParser } from 'chevrotain';
import { NAME } from './lexer/shared-tokens.js';

// Chevrotain actually returns a CstNode instead of this noopCst
const noopCst = undefined as unknown as CstNode;

export default class JDLParser extends CstParser {
  private tokens: Record<string, TokenType>;

  constructor(tokens: Record<string, TokenType>) {
    super(tokens, { outputCst: true } as any);
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

  prog(): CstNode {
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
    return noopCst;
  }

  constantDeclaration(): CstNode {
    this.RULE('constantDeclaration', () => {
      this.CONSUME(this.tokens.NAME);
      this.CONSUME(this.tokens.EQUALS);
      this.OR([{ ALT: () => this.CONSUME(this.tokens.DECIMAL) }, { ALT: () => this.CONSUME(this.tokens.INTEGER) }]);
    });
    return noopCst;
  }

  entityDeclaration(): CstNode {
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
    return noopCst;
  }

  annotationDeclaration(): CstNode {
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
    return noopCst;
  }

  entityTableNameDeclaration(): CstNode {
    this.RULE('entityTableNameDeclaration', () => {
      this.CONSUME(this.tokens.LPAREN);
      this.CONSUME(this.tokens.NAME);
      this.CONSUME(this.tokens.RPAREN);
    });
    return noopCst;
  }

  entityBody(): CstNode {
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
    return noopCst;
  }

  fieldDeclaration(): CstNode {
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
    return noopCst;
  }

  type(): CstNode {
    this.RULE('type', () => {
      this.CONSUME(this.tokens.NAME);
    });
    return noopCst;
  }

  validation(): CstNode {
    this.RULE('validation', () => {
      this.OR([
        { ALT: () => this.CONSUME(this.tokens.REQUIRED) },
        { ALT: () => this.CONSUME(this.tokens.UNIQUE) },
        { ALT: () => this.SUBRULE(this.minMaxValidation) },
        { ALT: () => this.SUBRULE(this.pattern) },
      ]);
    });
    return noopCst;
  }

  minMaxValidation(): CstNode {
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
    return noopCst;
  }

  pattern(): CstNode {
    this.RULE('pattern', () => {
      this.CONSUME(this.tokens.PATTERN);
      this.CONSUME(this.tokens.LPAREN);
      this.CONSUME(this.tokens.REGEX);
      this.CONSUME(this.tokens.RPAREN);
    });
    return noopCst;
  }

  relationDeclaration(): CstNode {
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
    return noopCst;
  }

  relationshipType(): CstNode {
    this.RULE('relationshipType', () => {
      this.CONSUME(this.tokens.RELATIONSHIP_TYPE);
    });
    return noopCst;
  }

  relationshipBody(): CstNode {
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
    return noopCst;
  }

  relationshipSide(): CstNode {
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
    return noopCst;
  }

  relationshipOptions(): CstNode {
    this.RULE('relationshipOptions', () => {
      this.AT_LEAST_ONE_SEP({
        SEP: this.tokens.COMMA_WITHOUT_NEWLINE,
        DEF: () => {
          this.SUBRULE(this.relationshipOption, { LABEL: 'relationshipOption' });
        },
      });
    });
    return noopCst;
  }

  relationshipOption(): CstNode {
    this.RULE('relationshipOption', () => {
      this.OR([{ ALT: () => this.CONSUME(this.tokens.BUILT_IN_ENTITY) }]);
    });
    return noopCst;
  }

  enumDeclaration(): CstNode {
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
    return noopCst;
  }

  enumPropList(): CstNode {
    this.RULE('enumPropList', () => {
      this.SUBRULE(this.enumProp);
      this.MANY(() => {
        this.OPTION(() => {
          this.CONSUME(this.tokens.COMMA);
        });
        this.SUBRULE1(this.enumProp);
      });
    });
    return noopCst;
  }

  enumProp(): CstNode {
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
    return noopCst;
  }

  entityList(): CstNode {
    this.RULE('entityList', () => {
      this.commonEntityList();
      this.CONSUME(this.tokens.WITH);
      this.OR1([
        { ALT: () => this.CONSUME2(this.tokens.NAME, { LABEL: 'method' }) },
        { ALT: () => this.CONSUME3(this.tokens.STRING, { LABEL: 'methodPath' }) },
      ]);
    });
    return noopCst;
  }

  commonEntityList(): CstNode {
    this.MANY({
      // the next section may contain [NAME, WITH], LA(2) check is used to resolve this.
      GATE: () => this.LA(2).tokenType === this.tokens.COMMA,
      DEF: () => {
        this.CONSUME(this.tokens.NAME);
        this.CONSUME(this.tokens.COMMA);
      },
    });
    this.OR([{ ALT: () => this.CONSUME(this.tokens.STAR) }, { ALT: () => this.CONSUME1(this.tokens.NAME) }]);
    return noopCst;
  }

  exclusion(): CstNode {
    this.RULE('exclusion', () => {
      this.CONSUME(this.tokens.EXCEPT);
      this.CONSUME(this.tokens.NAME);
      this.MANY(() => {
        this.CONSUME(this.tokens.COMMA);
        this.CONSUME2(this.tokens.NAME);
      });
    });
    return noopCst;
  }

  useOptionDeclaration(): CstNode {
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
    return noopCst;
  }

  unaryOptionDeclaration(): CstNode {
    this.RULE('unaryOptionDeclaration', () => {
      this.CONSUME(this.tokens.UNARY_OPTION);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
    return noopCst;
  }

  binaryOptionDeclaration(): CstNode {
    this.RULE('binaryOptionDeclaration', () => {
      this.CONSUME(this.tokens.BINARY_OPTION);
      this.SUBRULE(this.entityList);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
    return noopCst;
  }

  filterDef(): CstNode {
    this.RULE('filterDef', this.commonEntityList);
    return noopCst;
  }

  comment(): CstNode {
    this.RULE('comment', () => {
      this.OPTION(() => {
        this.CONSUME(this.tokens.JAVADOC);
      });
    });
    return noopCst;
  }

  deploymentDeclaration(): CstNode {
    this.RULE('deploymentDeclaration', () => {
      this.CONSUME(this.tokens.DEPLOYMENT);
      this.CONSUME(this.tokens.LCURLY);
      this.MANY(() => {
        this.OR([{ ALT: () => this.CONSUME(this.tokens.JAVADOC) }, { ALT: () => this.SUBRULE(this.deploymentConfigDeclaration) }]);
      });
      this.CONSUME(this.tokens.RCURLY);
    });
    return noopCst;
  }

  deploymentConfigDeclaration(): CstNode {
    this.RULE('deploymentConfigDeclaration', () => {
      this.CONSUME(this.tokens.DEPLOYMENT_KEY);
      this.SUBRULE(this.deploymentConfigValue);
      this.OPTION(() => {
        this.CONSUME(this.tokens.COMMA);
      });
    });
    return noopCst;
  }

  deploymentConfigValue(): CstNode {
    this.RULE('deploymentConfigValue', () => {
      this.OR([
        { ALT: () => this.CONSUME(this.tokens.BOOLEAN) },
        { ALT: () => this.SUBRULE(this.qualifiedName) },
        { ALT: () => this.SUBRULE(this.list) },
        { ALT: () => this.CONSUME(this.tokens.INTEGER) },
        { ALT: () => this.CONSUME(this.tokens.STRING) },
      ]);
    });
    return noopCst;
  }

  applicationDeclaration(): CstNode {
    this.RULE('applicationDeclaration', () => {
      this.CONSUME(this.tokens.APPLICATION);
      this.CONSUME(this.tokens.LCURLY);
      this.SUBRULE(this.applicationSubDeclaration);
      this.CONSUME(this.tokens.RCURLY);
    });
    return noopCst;
  }

  applicationSubDeclaration(): CstNode {
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
    return noopCst;
  }

  applicationSubNamespaceConfig(): CstNode {
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
    return noopCst;
  }

  applicationNamespaceConfigDeclaration(): CstNode {
    this.RULE('applicationNamespaceConfigDeclaration', () => {
      this.CONSUME(NAME);
      this.SUBRULE(this.namespaceConfigValue);
      this.OPTION(() => {
        this.CONSUME(this.tokens.COMMA);
      });
    });
    return noopCst;
  }

  namespaceConfigValue(): CstNode {
    this.RULE('namespaceConfigValue', () => {
      this.OR([
        { ALT: () => this.CONSUME(this.tokens.BOOLEAN) },
        { ALT: () => this.SUBRULE(this.qualifiedName) },
        { ALT: () => this.SUBRULE(this.list) },
        { ALT: () => this.CONSUME(this.tokens.INTEGER) },
        { ALT: () => this.CONSUME(this.tokens.STRING) },
      ]);
    });
    return noopCst;
  }

  applicationSubConfig(): CstNode {
    this.RULE('applicationSubConfig', () => {
      this.CONSUME(this.tokens.CONFIG);
      this.CONSUME(this.tokens.LCURLY);
      this.MANY(() => {
        this.OR([{ ALT: () => this.CONSUME(this.tokens.JAVADOC) }, { ALT: () => this.SUBRULE(this.applicationConfigDeclaration) }]);
      });
      this.CONSUME(this.tokens.RCURLY);
    });
    return noopCst;
  }

  applicationConfigDeclaration(): CstNode {
    this.RULE('applicationConfigDeclaration', () => {
      this.CONSUME(this.tokens.CONFIG_KEY);
      this.SUBRULE(this.configValue);
      this.OPTION(() => {
        this.CONSUME(this.tokens.COMMA);
      });
    });
    return noopCst;
  }

  configValue(): CstNode {
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
    return noopCst;
  }

  qualifiedName(): CstNode {
    this.RULE('qualifiedName', () => {
      this.AT_LEAST_ONE_SEP({
        SEP: this.tokens.DOT,
        DEF: () => {
          this.CONSUME(this.tokens.NAME);
        },
      });
    });
    return noopCst;
  }

  list(): CstNode {
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
    return noopCst;
  }

  quotedList(): CstNode {
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
    return noopCst;
  }

  applicationSubEntities(): CstNode {
    this.RULE('applicationSubEntities', () => {
      this.CONSUME(this.tokens.ENTITIES);
      this.SUBRULE(this.filterDef);
      this.OPTION(() => {
        this.SUBRULE(this.exclusion);
      });
    });
    return noopCst;
  }
}
