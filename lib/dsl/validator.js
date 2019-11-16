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

const _ = require('lodash');
const matchesToken = require('chevrotain').tokenMatcher;
const JDLParser = require('./jdl_parser');
const LexerTokens = require('./lexer').tokens;
const checkConfigKeys = require('./self_checks/parsing_system_checker').checkConfigKeys;

const CONSTANT_PATTERN = /^[A-Z_]+$/;
const ENTITY_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const TYPE_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const ENUM_NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const ENUM_PROP_NAME_PATTERN = /^[A-Z][A-Za-z0-9_]*$/;
const ENUM_PROP_VALUE_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;
const METHOD_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9-_]*$/;
const JHI_PREFIX_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9-_]*$/;
const PACKAGE_NAME_PATTERN = /^[a-z_][a-z0-9_]*$/;
const ALPHABETIC = /^[A-Za-z]+$/;
const ALPHABETIC_LOWER = /^[a-z]+$/;
const ALPHANUMERIC = /^[A-Za-z][A-Za-z0-9]*$/;
const ALPHANUMERIC_DASH = /^[A-Za-z][A-Za-z0-9-]*$/;
const ALPHABETIC_DASH_LOWER = /^[a-z][a-z-]*$/;
const ALPHANUMERIC_SPACE = /^"?[A-Za-z][A-Za-z0-9- ]*"?$/;
const ALPHANUMERIC_UNDERSCORE = /^[A-Za-z][A-Za-z0-9_]*$/;
const LANGUAGE_PATTERN = /^[a-z]+(-[A-Za-z0-9]+)*$/;
// eslint-disable-next-line no-useless-escape
const PATH_PATTERN = /^"([^\/]+).*"$/;
// const PASSWORD_PATTERN = /^(.+)$/;
// eslint-disable-next-line no-useless-escape
const REPONAME_PATTERN = /^"((?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:\/?#[\]@!$&'()*+,;=]+|[a-zA-Z0-9]+)"$/;
const JWT_SECRET_KEY_PATTERN = /^[A-Za-z0-9\-_]*$/;

const configPropsValidations = {
  APPLICATION_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'applicationType property'
  },
  AUTHENTICATION_TYPE: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'authenticationType property'
  },
  BASE_NAME: {
    type: 'NAME',
    pattern: ALPHANUMERIC_UNDERSCORE,
    msg: 'baseName property'
  },
  BLUEPRINT: {
    type: 'NAME',
    pattern: ALPHANUMERIC_DASH,
    msg: 'blueprint property'
  },
  BUILD_TOOL: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'buildTool property'
  },
  CACHE_PROVIDER: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'cacheProvider property'
  },
  CLIENT_FRAMEWORK: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'clientFramework property'
  },
  CLIENT_THEME: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'clientTheme property'
  },
  CLIENT_THEME_VARIANT: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'clientThemeVariant property'
  },
  CLIENT_PACKAGE_MANAGER: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'clientPackageManager property'
  },
  DATABASE_TYPE: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'databaseType property'
  },
  DEV_DATABASE_TYPE: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'devDatabaseType property'
  },
  ENTITY_SUFFIX: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'entitySuffix property'
  },
  DTO_SUFFIX: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'dtoSuffix property'
  },
  ENABLE_HIBERNATE_CACHE: { type: 'BOOLEAN' },
  ENABLE_SWAGGER_CODEGEN: { type: 'BOOLEAN' },
  ENABLE_TRANSLATION: { type: 'BOOLEAN' },
  FRONT_END_BUILDER: {
    type: 'NAME',
    pattern: ALPHABETIC,
    msg: 'frontendBuilder property'
  },
  JHIPSTER_VERSION: { type: 'STRING' },
  JHI_PREFIX: {
    type: 'NAME',
    pattern: JHI_PREFIX_NAME_PATTERN,
    msg: 'jhiPrefix property'
  },
  JWT_SECRET_KEY: {
    type: 'qualifiedName',
    pattern: JWT_SECRET_KEY_PATTERN,
    msg: 'JWT secret key property'
  },
  LANGUAGES: {
    type: 'list',
    pattern: LANGUAGE_PATTERN,
    msg: 'languages property'
  },
  MESSAGE_BROKER: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'messageBroker property'
  },
  NATIVE_LANGUAGE: {
    type: 'NAME',
    pattern: LANGUAGE_PATTERN,
    msg: 'nativeLanguage property'
  },
  PACKAGE_NAME: {
    type: 'qualifiedName',
    pattern: PACKAGE_NAME_PATTERN,
    msg: 'packageName property'
  },
  PROD_DATABASE_TYPE: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'prodDatabaseType property'
  },
  REACTIVE: { type: 'BOOLEAN' },
  SEARCH_ENGINE: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'searchEngine property'
  },
  SERVER_PORT: { type: 'INTEGER' },
  SERVICE_DISCOVERY_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'serviceDiscoveryType property'
  },
  SKIP_CLIENT: { type: 'BOOLEAN' },
  SKIP_SERVER: { type: 'BOOLEAN' },
  SKIP_USER_MANAGEMENT: { type: 'BOOLEAN' },
  TEST_FRAMEWORKS: {
    type: 'list',
    pattern: ALPHANUMERIC,
    msg: 'testFrameworks property'
  },
  UAA_BASE_NAME: { type: 'STRING' },
  USE_SASS: { type: 'BOOLEAN' },
  WEBSOCKET: {
    type: 'NAME',
    pattern: ALPHANUMERIC_DASH,
    msg: 'websocket property'
  }
};

const deploymentConfigPropsValidations = {
  DEPLOYMENT_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_DASH_LOWER,
    msg: 'deploymentType property'
  },
  GATEWAY_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'gatewayType property'
  },
  MONITORING: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'monitoring property'
  },
  DIRECTORY_PATH: {
    type: 'STRING',
    pattern: PATH_PATTERN,
    msg: 'directoryPath property'
  },
  APPS_FOLDERS: {
    type: 'list',
    pattern: ALPHANUMERIC_UNDERSCORE,
    msg: 'appsFolders property'
  },
  CLUSTERED_DB_APPS: {
    type: 'list',
    pattern: ALPHANUMERIC,
    msg: 'clusteredDbApps property'
  },
  CONSOLE_OPTIONS: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'consoleOptions property'
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
    msg: 'serviceDiscoveryType property'
  },
  DOCKER_REPOSITORY_NAME: {
    type: 'STRING',
    pattern: REPONAME_PATTERN,
    msg: 'dockerRepositoryName property'
  },
  DOCKER_PUSH_COMMAND: {
    type: 'STRING',
    pattern: ALPHANUMERIC_SPACE,
    msg: 'dockerPushCommand property'
  },
  KUBERNETES_NAMESPACE: {
    type: 'NAME',
    pattern: ALPHANUMERIC_DASH,
    msg: 'kubernetesNamespace property'
  },
  KUBERNETES_SERVICE_TYPE: {
    type: 'NAME',
    pattern: ALPHANUMERIC,
    msg: 'kubernetesServiceType property'
  },
  INGRESS_DOMAIN: {
    type: 'STRING',
    pattern: REPONAME_PATTERN,
    msg: 'ingressDomain property'
  },
  ISTIO: {
    type: 'BOOLEAN',
    msg: 'istio property'
  },
  OPENSHIFT_NAMESPACE: {
    type: 'NAME',
    pattern: ALPHANUMERIC_DASH,
    msg: 'openshiftNamespace property'
  },
  STORAGE_TYPE: {
    type: 'NAME',
    pattern: ALPHABETIC_LOWER,
    msg: 'storageType property'
  }
};

module.exports = {
  performAdditionalSyntaxChecks
};

const parser = JDLParser.getParser();
parser.parse();
const BaseJDLCSTVisitorWithDefaults = parser.getBaseCstVisitorConstructorWithDefaults();

class JDLSyntaxValidatorVisitor extends BaseJDLCSTVisitorWithDefaults {
  constructor() {
    super();
    this.validateVisitor();

    this.errors = [];
  }

  checkNameSyntax(token, expectedPattern, errorMessagePrefix) {
    if (!expectedPattern.test(token.image)) {
      this.errors.push({
        message: `The ${errorMessagePrefix} name must match: ${trimAnchors(expectedPattern.toString())}, got ${
          token.image
        }.`,
        token
      });
    }
  }

  checkIsSingleName(fqnCstNode) {
    // A Boolean is allowed as a single name as it is a keyword.
    // Other keywords do not need special handling as they do not explicitly appear in the rule
    // of config values
    if (fqnCstNode.tokenType && fqnCstNode.tokenType.CATEGORIES.includes(LexerTokens.BOOLEAN)) {
      return false;
    }

    const dots = fqnCstNode.children.DOT;
    if (dots && dots.length >= 1) {
      this.errors.push({
        message: 'A single name is expected, but found a fully qualified name.',
        token: getFirstToken(fqnCstNode)
      });
      return false;
    }
    return true;
  }

  checkExpectedValueType(expected, actual) {
    switch (expected) {
      case 'NAME':
        if (
          actual.name !== 'qualifiedName' &&
          // a Boolean (true/false) is also a valid name.
          actual.tokenType &&
          !_.includes(actual.tokenType.CATEGORIES, LexerTokens.BOOLEAN)
        ) {
          this.errors.push({
            message: `A name is expected, but found: "${getFirstToken(actual).image}"`,
            token: getFirstToken(actual)
          });
          return false;
        }
        return this.checkIsSingleName(actual);

      case 'qualifiedName':
        if (actual.name !== 'qualifiedName') {
          this.errors.push({
            message: `A fully qualified name is expected, but found: "${getFirstToken(actual).image}"`,
            token: getFirstToken(actual)
          });
          return false;
        }
        return true;

      case 'list':
        if (actual.name !== 'list') {
          this.errors.push({
            message: `An array of names is expected, but found: "${getFirstToken(actual).image}"`,
            token: getFirstToken(actual)
          });
          return false;
        }
        return true;

      case 'INTEGER':
        if (actual.tokenType !== LexerTokens.INTEGER) {
          this.errors.push({
            message: `An integer literal is expected, but found: "${getFirstToken(actual).image}"`,
            token: getFirstToken(actual)
          });
          return false;
        }
        return true;

      case 'STRING':
        if (actual.tokenType !== LexerTokens.STRING) {
          this.errors.push({
            message: `A string literal is expected, but found: "${getFirstToken(actual).image}"`,
            token: getFirstToken(actual)
          });
          return false;
        }
        return true;

      case 'BOOLEAN':
        if (!matchesToken(actual, LexerTokens.BOOLEAN)) {
          this.errors.push({
            message: `A boolean literal is expected, but found: "${getFirstToken(actual).image}"`,
            token: getFirstToken(actual)
          });
          return false;
        }
        return true;

      default:
        throw Error(`Expected a boolean, a string, an integer, a list or a (qualified) name, got '${expected}'.`);
    }
  }

  checkConfigPropSyntax(key, value) {
    const propertyName = key.tokenType.name;
    const validation = configPropsValidations[propertyName];
    if (!validation) {
      throw Error(`Got an invalid application config property: '${propertyName}'.`);
    }

    if (
      this.checkExpectedValueType(validation.type, value) &&
      validation.pattern &&
      value.children &&
      value.children.NAME
    ) {
      value.children.NAME.forEach(nameTok => this.checkNameSyntax(nameTok, validation.pattern, validation.msg));
    }
  }

  checkDeploymentConfigPropSyntax(key, value) {
    const propertyName = key.tokenType.name;
    const validation = deploymentConfigPropsValidations[propertyName];
    if (!validation) {
      throw Error(`Got an invalid deployment config property: '${propertyName}'.`);
    }

    if (
      this.checkExpectedValueType(validation.type, value) &&
      validation.pattern &&
      value.children &&
      value.children.NAME
    ) {
      value.children.NAME.forEach(nameTok => this.checkNameSyntax(nameTok, validation.pattern, validation.msg));
    } else if (value.image && validation.pattern) {
      this.checkNameSyntax(value, validation.pattern, validation.msg);
    }
  }

  constantDeclaration(context) {
    super.constantDeclaration(context);
    this.checkNameSyntax(context.NAME[0], CONSTANT_PATTERN, 'constant');
  }

  entityDeclaration(context) {
    super.entityDeclaration(context);
    this.checkNameSyntax(context.NAME[0], ENTITY_NAME_PATTERN, 'entity');
  }

  fieldDeclaration(context) {
    super.fieldDeclaration(context);
    this.checkNameSyntax(context.NAME[0], ALPHANUMERIC, 'fieldName');
  }

  type(context) {
    super.type(context);
    this.checkNameSyntax(context.NAME[0], TYPE_NAME_PATTERN, 'typeName');
  }

  minMaxValidation(context) {
    super.minMaxValidation(context);
    if (context.NAME) {
      this.checkNameSyntax(context.NAME[0], CONSTANT_PATTERN, 'constant');
    }
  }

  relationshipSide(context) {
    super.relationshipSide(context);
    this.checkNameSyntax(context.NAME[0], ENTITY_NAME_PATTERN, 'entity');

    if (context.injectedField) {
      this.checkNameSyntax(context.injectedField[0], ALPHANUMERIC, 'injectedField');
      if (context.injectedFieldParam) {
        this.checkNameSyntax(context.injectedFieldParam[0], ALPHANUMERIC, 'injectedField');
      }
    }
  }

  enumDeclaration(context) {
    super.enumDeclaration(context);
    this.checkNameSyntax(context.NAME[0], ENUM_NAME_PATTERN, 'enum');
  }

  enumPropList(context) {
    super.enumPropList(context);
    context.enumProp.forEach(nameToken => {
      const propKey = nameToken.children.enumPropKey[0];
      this.checkNameSyntax(propKey, ENUM_PROP_NAME_PATTERN, 'enum property name');
      const propValue = nameToken.children.enumPropValue;
      if (propValue) {
        this.checkNameSyntax(propValue[0], ENUM_PROP_VALUE_PATTERN, 'enum property value');
      }
    });
  }

  entityList(context) {
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

  exclusion(context) {
    super.exclusion(context);
    context.NAME.forEach(nameToken => {
      this.checkNameSyntax(nameToken, ENTITY_NAME_PATTERN, 'entity');
    });
  }

  filterDef(context) {
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

  applicationConfigDeclaration(context) {
    this.visit(context.configValue, context.CONFIG_KEY[0]);
  }

  configValue(context, configKey) {
    const configValue = _.first(_.first(Object.values(context)));
    this.checkConfigPropSyntax(configKey, configValue);
  }

  deploymentConfigDeclaration(context) {
    this.visit(context.deploymentConfigValue, context.DEPLOYMENT_KEY[0]);
  }

  deploymentConfigValue(context, configKey) {
    const configValue = _.first(_.first(_.values(context)));
    this.checkDeploymentConfigPropSyntax(configKey, configValue);
  }
}

function performAdditionalSyntaxChecks(cst) {
  const syntaxValidatorVisitor = new JDLSyntaxValidatorVisitor();
  syntaxValidatorVisitor.visit(cst);
  return syntaxValidatorVisitor.errors;
}

checkConfigKeys(LexerTokens, Object.keys(configPropsValidations));

function trimAnchors(str) {
  return str.replace(/^\^/, '').replace(/\$$/, '');
}

function getFirstToken(tokOrCstNode) {
  if (tokOrCstNode.tokenType) {
    return tokOrCstNode;
  }

  // CST Node - - assumes no nested CST Nodes, only terminals
  return _.flatten(Object.values(tokOrCstNode.children)).reduce(
    (firstTok, nextTok) => (firstTok.startOffset > nextTok.startOffset ? nextTok : firstTok),
    { startOffset: Infinity }
  );
}
