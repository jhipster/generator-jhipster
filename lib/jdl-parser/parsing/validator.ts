/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import { type CstElement, type CstNode, type ICstVisitor, type IToken, type TokenType, tokenMatcher as matchesToken } from 'chevrotain';

import type { JDLValidatorOptionType } from '../types/parsing.ts';
import type { JDLRuntime } from '../types/runtime.ts';

import { findConfigValidation, findOptionDefinition } from './definitions.ts';

interface JDLCstVisitorInstance<IN, OUT> extends ICstVisitor<IN, OUT> {
  constantDeclaration(context: any): void;
  entityDeclaration(context: any): void;
  fieldDeclaration(context: any): void;
  type(context: any): void;
  minMaxValidation(context: any): void;
  relationshipSide(context: any): void;
  enumDeclaration(context: any): void;
  enumPropList(context: any): void;
  entityList(context: any): void;
  optionDeclaration(context: any): void;
  relationshipOption(context: any): void;
  exclusion(context: any): void;
}

type JDLCstVisitor<IN, OUT> = new () => JDLCstVisitorInstance<IN, OUT>;

export default function performAdditionalSyntaxChecks(cst: CstNode, runtime: JDLRuntime) {
  const { parser } = runtime;
  parser.parse();
  const BaseJDLCSTVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults() as unknown as JDLCstVisitor<any, any>;

  class JDLSyntaxValidatorVisitor extends BaseJDLCSTVisitorWithDefaults {
    errors: any[];
    tokens: Record<string, TokenType>;

    constructor(runtime: JDLRuntime) {
      super();
      this.tokens = runtime.tokens;

      this.validateVisitor();

      this.errors = [];
    }

    validateVisitor() {}

    checkNameSyntax(token: IToken, expectedPattern: RegExp | undefined, errorMessagePrefix: string) {
      if (expectedPattern && !new RegExp(expectedPattern.source, expectedPattern.flags).test(token.image)) {
        this.errors.push({
          message: `The ${errorMessagePrefix} name must match: ${trimAnchors(expectedPattern.toString())}, got ${token.image}.`,
          token,
        });
      }
    }

    checkIsSingleName(fqnCstNode: CstElement): boolean {
      // A Boolean is allowed as a single name as it is a keyword.
      // Other keywords do not need special handling as they do not explicitly appear in the rule
      // of config values
      if ('tokenType' in fqnCstNode) {
        return !fqnCstNode.tokenType?.CATEGORIES?.includes(this.tokens.BOOLEAN);
      }
      const dots = fqnCstNode.children.DOT;
      if (dots?.length) {
        this.errors.push({
          message: 'A single name is expected, but found a fully qualified name.',
          token: getFirstToken(fqnCstNode),
        });
        return false;
      }
      return true;
    }

    checkExpectedValueType(expected: JDLValidatorOptionType, actual: CstElement): boolean {
      switch (expected) {
        case 'NAME':
          if (
            'tokenType' in actual &&
            // a Boolean (true/false) is also a valid name.
            actual.tokenType &&
            !actual.tokenType.CATEGORIES?.includes(this.tokens.BOOLEAN)
          ) {
            this.errors.push({
              message: `A name is expected, but found: "${getFirstToken(actual).image}"`,
              token: getFirstToken(actual),
            });
            return false;
          }
          return this.checkIsSingleName(actual);

        case 'qualifiedName':
          if (!('name' in actual) || actual.name !== 'qualifiedName') {
            this.errors.push({
              message: `A fully qualified name is expected, but found: "${getFirstToken(actual).image}"`,
              token: getFirstToken(actual),
            });
            return false;
          }
          return true;

        case 'list':
          if (!('name' in actual) || actual.name !== 'list') {
            this.errors.push({
              message: `An array of names is expected, but found: "${getFirstToken(actual).image}"`,
              token: getFirstToken(actual),
            });
            return false;
          }
          return true;

        case 'quotedList':
          if (!('name' in actual) || actual.name !== 'quotedList') {
            this.errors.push({
              message: `An array of names is expected, but found: "${getFirstToken(actual).image}"`,
              token: getFirstToken(actual),
            });
            return false;
          }
          return true;

        case 'INTEGER':
          if (!('tokenType' in actual) || actual.tokenType !== this.tokens.INTEGER) {
            this.errors.push({
              message: `An integer literal is expected, but found: "${getFirstToken(actual).image}"`,
              token: getFirstToken(actual),
            });
            return false;
          }
          return true;

        case 'STRING':
          if (!('tokenType' in actual) || actual.tokenType !== this.tokens.STRING) {
            this.errors.push({
              message: `A string literal is expected, but found: "${getFirstToken(actual).image}"`,
              token: getFirstToken(actual),
            });
            return false;
          }
          return true;

        case 'BOOLEAN':
          if (!('tokenType' in actual) || !matchesToken(actual, this.tokens.BOOLEAN)) {
            this.errors.push({
              message: `A boolean literal is expected, but found: "${getFirstToken(actual).image}"`,
              token: getFirstToken(actual),
            });
            return false;
          }
          return true;

        default:
          throw Error(`Expected a boolean, a string, an integer, a list or a (qualified) name, got '${expected}'.`);
      }
    }

    checkConfigPropSyntax(key: IToken, value: CstElement) {
      const propertyName = key.image;
      const validation = findConfigValidation(runtime.definitions.application, propertyName);
      if (!validation) {
        this.errors.push({ message: `Unknown application option: ${propertyName}.`, token: key });
        return;
      }

      if (this.checkExpectedValueType(validation.type, value) && validation.pattern && 'children' in value && value.children) {
        if (value.children.NAME) {
          value.children.NAME.forEach(nameTok => this.checkNameSyntax(nameTok as IToken, validation.pattern, validation.msg!));
        }
        if (value.children.STRING) {
          value.children.STRING.forEach(nameTok => this.checkNameSyntax(nameTok as IToken, validation.pattern, validation.msg!));
        }
      }
    }

    checkDeploymentConfigPropSyntax(key: IToken, value: CstElement) {
      const propertyName = key.image;
      const validation = findConfigValidation(runtime.definitions.deployment, propertyName);
      if (!validation) {
        this.errors.push({ message: `Unknown deployment option: ${propertyName}.`, token: key });
        return;
      }

      if (
        this.checkExpectedValueType(validation.type, value) &&
        'pattern' in validation &&
        validation.pattern &&
        'children' in value &&
        value.children?.NAME
      ) {
        value.children.NAME.forEach(nameTok => this.checkNameSyntax(nameTok as IToken, validation.pattern, validation.msg!));
      } else if ('image' in value && value.image && 'pattern' in validation && validation.pattern) {
        this.checkNameSyntax(value, validation.pattern, validation.msg!);
      }
    }

    constantDeclaration(context: Record<'NAME', IToken[]>) {
      super.constantDeclaration(context);
      this.checkNameSyntax(context.NAME[0], runtime.definitions.names?.constant, 'constant');
    }

    entityDeclaration(context: Record<'NAME', IToken[]>) {
      super.entityDeclaration(context);
      this.checkNameSyntax(context.NAME[0], runtime.definitions.names?.entity, 'entity');
    }

    fieldDeclaration(context: Record<'NAME', IToken[]>) {
      super.fieldDeclaration(context);
      this.checkNameSyntax(context.NAME[0], runtime.definitions.names?.field, 'fieldName');
    }

    type(context: Record<'NAME', IToken[]>) {
      super.type(context);
      this.checkNameSyntax(context.NAME[0], runtime.definitions.names?.type, 'typeName');
    }

    minMaxValidation(context: Record<'NAME', IToken[]>) {
      super.minMaxValidation(context);
      if (context.NAME) {
        this.checkNameSyntax(context.NAME[0], runtime.definitions.names?.constant, 'constant');
      }
    }

    relationshipSide(context: Record<'NAME' | 'injectedField' | 'injectedFieldParam', IToken[]>) {
      super.relationshipSide(context);
      this.checkNameSyntax(context.NAME[0], runtime.definitions.names?.entity, 'entity');

      if (Array.isArray(context.injectedField)) {
        this.checkNameSyntax(context.injectedField[0], runtime.definitions.names?.injectedField, 'injectedField');
        if (context.injectedFieldParam) {
          this.checkNameSyntax(context.injectedFieldParam[0], runtime.definitions.names?.injectedField, 'injectedField');
        }
      }
    }

    enumDeclaration(context: Record<'NAME', IToken[]>) {
      super.enumDeclaration(context);
      this.checkNameSyntax(context.NAME[0], runtime.definitions.names?.enum, 'enum');
    }

    enumPropList(context: Record<'enumProp', CstNode[]>) {
      super.enumPropList(context);
      context.enumProp.forEach(nameToken => {
        const propKey = nameToken.children.enumPropKey[0];
        this.checkNameSyntax(propKey as IToken, runtime.definitions.names?.enumValue, 'enum property name');
        const propValue = nameToken.children.enumPropValue;
        if (propValue) {
          this.checkNameSyntax(propValue[0] as IToken, runtime.definitions.names?.enumValueValue, 'enum property value');
        }
      });
    }

    entityList(context: Record<'NAME' | 'method' | 'methodPath', IToken[]>) {
      super.entityList(context);
      if (context.NAME) {
        context.NAME.forEach(nameToken => {
          // we don't want this validated as it's an alias for '*'
          if (nameToken.image === 'all') {
            return;
          }
          this.checkNameSyntax(nameToken, runtime.definitions.names?.entity, 'entity');
        });
      }

      if (context.method) {
        this.checkNameSyntax(context.method[0], runtime.definitions.names?.method, 'method');
      }
      if (context.methodPath) {
        this.checkNameSyntax(context.methodPath[0], runtime.definitions.names?.path, 'methodPath');
      }
    }

    optionDeclaration(context: Record<'option' | 'method' | 'methodPath', IToken[]>) {
      super.optionDeclaration(context);
      const option = context.option[0];
      const binary = Boolean(context.method ?? context.methodPath);
      const definition = findOptionDefinition(runtime.entityDefinition, option.image)?.[1];
      if (!definition) {
        this.errors.push({ message: `Unknown option: ${option.image}.`, token: option });
      } else if ((definition.jdl.type === 'binary') !== binary) {
        this.errors.push({
          message:
            binary ?
              `The ${option.image} option takes no value.`
            : `The ${option.image} option needs a value: ${option.image} <entities> with <value>.`,
          token: option,
        });
      }
      if (context.method) this.checkNameSyntax(context.method[0], runtime.definitions.names?.method, 'method');
      if (context.methodPath) this.checkNameSyntax(context.methodPath[0], runtime.definitions.names?.path, 'methodPath');
    }

    relationshipOption(context: Record<'RELATIONSHIP_OPTION', IToken[]>) {
      super.relationshipOption(context);
      const option = context.RELATIONSHIP_OPTION[0];
      if (!findOptionDefinition(runtime.relationshipDefinition, option.image)) {
        this.errors.push({ message: `Unknown relationship option: ${option.image}.`, token: option });
      }
    }

    override exclusion(context: Record<'NAME', IToken[]>) {
      super.exclusion(context);
      context.NAME.forEach(nameToken => {
        this.checkNameSyntax(nameToken, runtime.definitions.names?.entity, 'entity');
      });
    }

    filterDef(context: Record<'NAME', IToken[]>) {
      if (context.NAME) {
        context.NAME.forEach(nameToken => {
          // we don't want this validated as it's an alias for '*'
          if (nameToken.image === 'all') {
            return;
          }
          this.checkNameSyntax(nameToken, runtime.definitions.names?.entity, 'entity');
        });
      }
    }

    applicationConfigDeclaration(context: Record<'CONFIG_KEY', IToken[]> & Record<'configValue', CstNode[]>) {
      this.visit(context.configValue, context.CONFIG_KEY[0]);
    }

    configValue(context: Record<string, CstElement[]>, configKey: IToken) {
      const configValue = Object.values(context)[0]?.[0];
      this.checkConfigPropSyntax(configKey, configValue);
    }

    deploymentConfigDeclaration(context: Record<'DEPLOYMENT_KEY', IToken[]> & Record<'deploymentConfigValue', CstNode[]>) {
      this.visit(context.deploymentConfigValue, context.DEPLOYMENT_KEY[0]);
    }

    deploymentConfigValue(context: Record<string, CstElement[]>, configKey: IToken) {
      const configValue = Object.values(context)[0]?.[0];
      this.checkDeploymentConfigPropSyntax(configKey, configValue);
    }
  }
  const syntaxValidatorVisitor = new JDLSyntaxValidatorVisitor(runtime);

  syntaxValidatorVisitor.visit(cst);
  return syntaxValidatorVisitor.errors;
}

function trimAnchors(str: string): string {
  return str.replace(/^\^/, '').replace(/\$$/, '');
}

function getFirstToken(tokOrCstNode: CstElement): IToken {
  if ('tokenType' in tokOrCstNode) {
    return tokOrCstNode;
  }

  // CST Node - - assumes no nested CST Nodes, only terminals
  return Object.values(tokOrCstNode.children)
    .flat()
    .reduce<any>((firstTok: any, nextTok: any) => (firstTok.startOffset > nextTok.startOffset ? nextTok : firstTok), {
      startOffset: Infinity,
    });
}
