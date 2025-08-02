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
/* eslint-disable no-useless-escape */

import type { CstElement, CstNode, ICstVisitor, IToken, TokenType } from 'chevrotain';
import { tokenMatcher as matchesToken } from 'chevrotain';
import { first, flatten, includes } from 'lodash-es';

import {
  ALPHABETIC,
  ALPHABETIC_DASH_LOWER,
  ALPHABETIC_LOWER,
  ALPHANUMERIC,
  ALPHANUMERIC_DASH,
  ALPHANUMERIC_SPACE,
  ALPHANUMERIC_UNDERSCORE,
} from '../built-in-options/validation-patterns.ts';
import type { JDLValidatorOptionType } from '../types/parsing.js';
import type { JDLRuntime } from '../types/runtime.js';

const CONSTANT_PATTERN = /^[A-Z_]+$/;
const ENTITY_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const TYPE_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const ENUM_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const ENUM_PROP_NAME_PATTERN = /^[A-Z][A-Za-z0-9_]*$/;
const ENUM_PROP_VALUE_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;
const METHOD_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9-_]*$/;

// const PASSWORD_PATTERN = /^(.+)$/;
const REPONAME_PATTERN = /^"((?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:\/?#[\]@!$&'()*+,;=]+|[a-zA-Z0-9]+)"$/;
const KUBERNETES_STORAGE_CLASS_NAME = /^"[A-Za-z]*"$/;
const PATH_PATTERN = /^"([^\/]+).*"$/;

const deploymentConfigPropsValidations = {
  DEPLOYMENT_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_DASH_LOWER,
    msg: 'deploymentType property',
  },
  GATEWAY_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC,
    msg: 'gatewayType property',
  },
  MONITORING: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'monitoring property',
  },
  DIRECTORY_PATH: {
    type: 'STRING',
    pattern: PATH_PATTERN,
    msg: 'directoryPath property',
  },
  APPS_FOLDERS: {
    type: 'list',
    pattern: ALPHANUMERIC_UNDERSCORE,
    msg: 'appsFolders property',
  },
  CLUSTERED_DB_APPS: {
    type: 'list',
    pattern: ALPHANUMERIC,
    msg: 'clusteredDbApps property',
  },
  // This is not secure, need to find a better way
  /*   ADMIN_PASSWORD: {
    type: 'STRING',
    pattern: PASSWORD_PATTERN,
    msg: 'adminPassword property'
  }, */
  SERVICE_DISCOVERY_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'serviceDiscoveryType property',
  },
  DOCKER_REPOSITORY_NAME: {
    type: 'STRING',
    pattern: REPONAME_PATTERN,
    msg: 'dockerRepositoryName property',
  },
  DOCKER_PUSH_COMMAND: {
    type: 'STRING',
    pattern: ALPHANUMERIC_SPACE,
    msg: 'dockerPushCommand property',
  },
  KUBERNETES_NAMESPACE: {
    type: 'NAME',
    pattern: ALPHANUMERIC_DASH,
    msg: 'kubernetesNamespace property',
  },
  KUBERNETES_SERVICE_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC,
    msg: 'kubernetesServiceType property',
  },
  KUBERNETES_STORAGE_CLASS_NAME: {
    type: 'STRING',
    pattern: KUBERNETES_STORAGE_CLASS_NAME,
    msg: 'kubernetesStorageClassName property',
  },
  KUBERNETES_USE_DYNAMIC_STORAGE: { type: 'BOOLEAN' },
  INGRESS_DOMAIN: {
    type: 'STRING',
    pattern: REPONAME_PATTERN,
    msg: 'ingressDomain property',
  },
  INGRESS_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC,
    msg: 'ingressType property',
  },
  ISTIO: {
    type: 'BOOLEAN',
    msg: 'istio property',
  },
  REGISTRY_REPLICAS: { type: 'INTEGER' },
  STORAGE_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'storageType property',
  },
} as const;

interface JDLCstVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new (): JDLCstVisitor<IN, OUT>;
  constantDeclaration(context: any): void;
  entityDeclaration(context: any): void;
  fieldDeclaration(context: any): void;
  type(context: any): void;
  minMaxValidation(context: any): void;
  relationshipSide(context: any): void;
  enumDeclaration(context: any): void;
  enumPropList(context: any): void;
  entityList(context: any): void;
  exclusion(context: any): void;
}

export default function performAdditionalSyntaxChecks(cst: CstNode, runtime: JDLRuntime) {
  const parser = runtime.parser;
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

    checkNameSyntax(token: IToken, expectedPattern: RegExp, errorMessagePrefix: string) {
      if (!expectedPattern.test(token.image)) {
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
      if (dots && dots.length >= 1) {
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
            !includes(actual.tokenType.CATEGORIES, this.tokens.BOOLEAN)
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
      const propertyName = key.tokenType.name;
      const validation = runtime.propertyValidations[propertyName];
      if (!validation) {
        throw Error(`Got an invalid application config property: '${propertyName}'.`);
      }

      if (this.checkExpectedValueType(validation.type, value) && validation.pattern && 'children' in value && value.children) {
        if (value.children.NAME) {
          value.children.NAME.forEach(nameTok => this.checkNameSyntax(nameTok as IToken, validation.pattern!, validation.msg!));
        }
        if (value.children.STRING) {
          value.children.STRING.forEach(nameTok => this.checkNameSyntax(nameTok as IToken, validation.pattern!, validation.msg!));
        }
      }
    }

    checkDeploymentConfigPropSyntax(key: IToken, value: CstElement) {
      const propertyName = key.tokenType.name;
      const validation = deploymentConfigPropsValidations[propertyName as keyof typeof deploymentConfigPropsValidations];
      if (!validation) {
        throw Error(`Got an invalid deployment config property: '${propertyName}'.`);
      }

      if (
        this.checkExpectedValueType(validation.type, value) &&
        'pattern' in validation &&
        validation.pattern &&
        'children' in value &&
        value.children?.NAME
      ) {
        value.children.NAME.forEach(nameTok => this.checkNameSyntax(nameTok as IToken, validation.pattern, validation.msg));
      } else if ('image' in value && value.image && 'pattern' in validation && validation.pattern) {
        this.checkNameSyntax(value, validation.pattern, validation.msg);
      }
    }

    constantDeclaration(context: Record<'NAME', IToken[]>) {
      super.constantDeclaration(context);
      this.checkNameSyntax(context.NAME[0], CONSTANT_PATTERN, 'constant');
    }

    entityDeclaration(context: Record<'NAME', IToken[]>) {
      super.entityDeclaration(context);
      this.checkNameSyntax(context.NAME[0], ENTITY_NAME_PATTERN, 'entity');
    }

    fieldDeclaration(context: Record<'NAME', IToken[]>) {
      super.fieldDeclaration(context);
      this.checkNameSyntax(context.NAME[0], ALPHANUMERIC, 'fieldName');
    }

    type(context: Record<'NAME', IToken[]>) {
      super.type(context);
      this.checkNameSyntax(context.NAME[0], TYPE_NAME_PATTERN, 'typeName');
    }

    minMaxValidation(context: Record<'NAME', IToken[]>) {
      super.minMaxValidation(context);
      if (context.NAME) {
        this.checkNameSyntax(context.NAME[0], CONSTANT_PATTERN, 'constant');
      }
    }

    relationshipSide(context: Record<'NAME' | 'injectedField' | 'injectedFieldParam', IToken[]>) {
      super.relationshipSide(context);
      this.checkNameSyntax(context.NAME[0], ENTITY_NAME_PATTERN, 'entity');

      if (Array.isArray(context.injectedField)) {
        this.checkNameSyntax(context.injectedField[0], ALPHANUMERIC, 'injectedField');
        if (context.injectedFieldParam) {
          this.checkNameSyntax(context.injectedFieldParam[0], ALPHANUMERIC, 'injectedField');
        }
      }
    }

    enumDeclaration(context: Record<'NAME', IToken[]>) {
      super.enumDeclaration(context);
      this.checkNameSyntax(context.NAME[0], ENUM_NAME_PATTERN, 'enum');
    }

    enumPropList(context: Record<'enumProp', CstNode[]>) {
      super.enumPropList(context);
      context.enumProp.forEach(nameToken => {
        const propKey = nameToken.children.enumPropKey[0];
        this.checkNameSyntax(propKey as IToken, ENUM_PROP_NAME_PATTERN, 'enum property name');
        const propValue = nameToken.children.enumPropValue;
        if (propValue) {
          this.checkNameSyntax(propValue[0] as IToken, ENUM_PROP_VALUE_PATTERN, 'enum property value');
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
          this.checkNameSyntax(nameToken, ENTITY_NAME_PATTERN, 'entity');
        });
      }

      if (context.method) {
        this.checkNameSyntax(context.method[0], METHOD_NAME_PATTERN, 'method');
      }
      if (context.methodPath) {
        this.checkNameSyntax(context.methodPath[0], PATH_PATTERN, 'methodPath');
      }
    }

    override exclusion(context: Record<'NAME', IToken[]>) {
      super.exclusion(context);
      context.NAME.forEach(nameToken => {
        this.checkNameSyntax(nameToken, ENTITY_NAME_PATTERN, 'entity');
      });
    }

    filterDef(context: Record<'NAME', IToken[]>) {
      if (context.NAME) {
        context.NAME.forEach(nameToken => {
          // we don't want this validated as it's an alias for '*'
          if (nameToken.image === 'all') {
            return;
          }
          this.checkNameSyntax(nameToken, ENTITY_NAME_PATTERN, 'entity');
        });
      }
    }

    applicationConfigDeclaration(context: Record<'CONFIG_KEY', IToken[]> & Record<'configValue', CstNode[]>) {
      this.visit(context.configValue, context.CONFIG_KEY[0]);
    }

    configValue(context: Record<string, CstElement[]>, configKey: IToken) {
      const configValue = first(first(Object.values(context)));
      this.checkConfigPropSyntax(configKey, configValue!);
    }

    deploymentConfigDeclaration(context: Record<'DEPLOYMENT_KEY', IToken[]> & Record<'deploymentConfigValue', CstNode[]>) {
      this.visit(context.deploymentConfigValue, context.DEPLOYMENT_KEY[0]);
    }

    deploymentConfigValue(context: Record<string, CstElement[]>, configKey: IToken) {
      const configValue = first(first(Object.values(context)));
      this.checkDeploymentConfigPropSyntax(configKey, configValue!);
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
  return flatten(Object.values(tokOrCstNode.children)).reduce<any>(
    (firstTok: any, nextTok: any) => (firstTok.startOffset > nextTok.startOffset ? nextTok : firstTok),
    { startOffset: Infinity },
  );
}
