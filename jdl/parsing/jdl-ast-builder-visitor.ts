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
import JDLParser from './jdl-parser.js';
import deduplicate from '../utils/array-utils.js';

import { applicationOptions, entityOptions, validations } from '../jhipster/index.mjs';

const { OptionNames } = applicationOptions;
const { PaginationTypes } = entityOptions;
const {
  Validations: { PATTERN, REQUIRED, UNIQUE },
} = validations;

const { PAGINATION } = PaginationTypes;
const { PACKAGE_NAME } = OptionNames;

const parser = JDLParser.getParser();
parser.parse();

const BaseJDLCSTVisitor = parser.getBaseCstVisitorConstructor();

export default class JDLAstBuilderVisitor extends BaseJDLCSTVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  prog(context) {
    const ast = {
      applications: [],
      deployments: [],
      constants: {},
      entities: [],
      relationships: [],
      enums: [],
      options: {},
      useOptions: [],
    };

    if (context.constantDeclaration) {
      const constants = context.constantDeclaration.map(this.visit, this);
      constants.forEach(currConst => {
        ast.constants[currConst.name] = currConst.value;
      });
    }

    if (context.applicationDeclaration) {
      ast.applications = context.applicationDeclaration.map(this.visit, this);
    }

    if (context.deploymentDeclaration) {
      ast.deployments = context.deploymentDeclaration.map(this.visit, this);
    }

    if (context.entityDeclaration) {
      ast.entities = context.entityDeclaration.map(this.visit, this);
    }

    if (context.relationDeclaration) {
      ast.relationships = context.relationDeclaration.flatMap(this.visit, this);
    }

    if (context.enumDeclaration) {
      ast.enums = context.enumDeclaration.map(this.visit, this);
    }

    if (context.unaryOptionDeclaration) {
      context.unaryOptionDeclaration.map(this.visit, this).forEach(option => {
        if (!ast.options[option.optionName]) {
          ast.options[option.optionName] = {};
        }
        const astResult = ast.options[option.optionName];

        const { entityList, excludedEntityList } = getOptionEntityAndExcludedEntityLists(astResult, option);
        astResult.list = entityList;
        astResult.excluded = excludedEntityList;
      });
    }

    if (context.binaryOptionDeclaration) {
      context.binaryOptionDeclaration.map(this.visit, this).forEach(option => {
        if (option.optionName === 'paginate') {
          option.optionName = PAGINATION;
        }
        const newOption = !ast.options[option.optionName];
        if (newOption) {
          ast.options[option.optionName] = {};
        }
        const newOptionValue = !ast.options[option.optionName][option.optionValue];
        if (newOptionValue) {
          ast.options[option.optionName][option.optionValue] = {};
        }
        const astResult = ast.options[option.optionName][option.optionValue];

        const { entityList, excludedEntityList } = getOptionEntityAndExcludedEntityLists(astResult, option);
        astResult.list = entityList;
        astResult.excluded = excludedEntityList;
      });
    }

    if (context.useOptionDeclaration) {
      ast.useOptions = context.useOptionDeclaration.map(this.visit, this);
    }

    return ast;
  }

  constantDeclaration(context) {
    return {
      name: context.NAME[0].image,
      value: context.INTEGER ? context.INTEGER[0].image : context.DECIMAL[0].image,
    };
  }

  entityDeclaration(context) {
    const annotations: any[] = [];
    if (context.annotationDeclaration) {
      context.annotationDeclaration.forEach(contextObject => {
        annotations.push(this.visit(contextObject));
      });
    }

    let javadoc = null;
    if (context.JAVADOC) {
      javadoc = trimComment(context.JAVADOC[0].image);
    }

    const name = context.NAME[0].image;

    let tableName = name;
    if (context.entityTableNameDeclaration) {
      tableName = this.visit(context.entityTableNameDeclaration);
    }

    let body = [];
    if (context.entityBody) {
      body = this.visit(context.entityBody);
    }

    return {
      annotations,
      name,
      tableName,
      body,
      javadoc,
    };
  }

  annotationDeclaration(context) {
    if (!context.value) {
      return { optionName: context.option[0].image, type: 'UNARY' };
    }
    return {
      optionName: context.option[0].image,
      optionValue: context.value[0].image.replace(/"/g, ''),
      type: 'BINARY',
    };
  }

  entityTableNameDeclaration(context) {
    return context.NAME[0].image;
  }

  entityBody(context) {
    if (!context.fieldDeclaration) {
      return [];
    }
    return context.fieldDeclaration.map(element => this.visit(element));
  }

  fieldDeclaration(context) {
    const annotations: any[] = [];
    if (context.annotationDeclaration) {
      context.annotationDeclaration.forEach(contextObject => {
        annotations.push(this.visit(contextObject));
      });
    }

    // filter actual comment as the comment rule may be empty
    const comment = context.JAVADOC ? trimComment(context.JAVADOC[0].image) : null;

    let validations = [];
    if (context.validation) {
      validations = context.validation.map(element => this.visit(element));
    }

    return {
      name: context.NAME[0].image,
      // context.type is an array with a single item.
      // in that case:
      // this.visit(context.type) is equivalent to this.visit(context.type[0])
      type: this.visit(context.type),
      validations,
      javadoc: comment,
      annotations,
    };
  }

  type(context) {
    return context.NAME[0].image;
  }

  validation(context) {
    // only one of these alternatives can exist at the same time.
    if (context.REQUIRED) {
      return {
        key: REQUIRED,
        value: '',
      };
    }
    if (context.UNIQUE) {
      return {
        key: UNIQUE,
        value: '',
      };
    }
    if (context.minMaxValidation) {
      return this.visit(context.minMaxValidation);
    }
    return this.visit(context.pattern);
  }

  minMaxValidation(context) {
    if (context.NAME) {
      return {
        key: context.MIN_MAX_KEYWORD[0].image,
        value: context.NAME[0].image,
        constant: true,
      };
    }

    return {
      key: context.MIN_MAX_KEYWORD[0].image,
      value: context.INTEGER ? context.INTEGER[0].image : context.DECIMAL[0].image,
    };
  }

  pattern(context) {
    const patternImage = context.REGEX[0].image;

    return {
      key: PATTERN,
      value: patternImage.substring(1, patternImage.length - 1),
    };
  }

  relationDeclaration(context) {
    const cardinality = this.visit(context.relationshipType);
    const relationshipBodies = context.relationshipBody.map(this.visit, this);

    relationshipBodies.forEach(relationshipBody => {
      relationshipBody.cardinality = cardinality;
    });

    return relationshipBodies;
  }

  relationshipType(context) {
    return context.RELATIONSHIP_TYPE[0].image;
  }

  relationshipBody(context) {
    const optionsForTheSourceSide = context.annotationOnSourceSide ? context.annotationOnSourceSide.map(this.visit, this) : [];
    const optionsForTheDestinationSide = context.annotationOnDestinationSide
      ? context.annotationOnDestinationSide.map(this.visit, this)
      : [];

    const from = this.visit(context.from);
    const to = this.visit(context.to);

    const relationshipOptions: any[] = [];
    if (context.relationshipOptions) {
      this.visit(context.relationshipOptions).forEach(option => relationshipOptions.push(option));
    }

    return {
      from,
      to,
      options: {
        global: relationshipOptions,
        source: optionsForTheSourceSide,
        destination: optionsForTheDestinationSide,
      },
    };
  }

  relationshipSide(context) {
    const javadoc = this.visit(context.comment);
    const name = context.NAME[0].image;

    const required = !!context.REQUIRED;
    let injectedField: string | null = null;

    if (context.injectedField) {
      injectedField = context.injectedField[0].image;

      if (context.injectedFieldParam) {
        injectedField += `(${context.injectedFieldParam[0].image})`;
      }
    }

    const ast: any = {
      name,
      injectedField,
      javadoc,
      required,
    };

    if (!injectedField) {
      delete ast.required;
    }
    return ast;
  }

  relationshipOptions(context) {
    return context.relationshipOption.map(this.visit, this).reduce((final, current) => [...final, current], []);
  }

  relationshipOption(context) {
    if (context.JPA_DERIVED_IDENTIFIER) {
      return { optionName: 'jpaDerivedIdentifier', type: 'UNARY' };
    }

    /* istanbul ignore next */
    throw new Error("No valid relationship option found, expected 'jpaDerivedIdentifier'.");
  }

  enumDeclaration(context) {
    const name = context.NAME[0].image;
    const values = this.visit(context.enumPropList);
    let javadoc = null;
    if (context.JAVADOC) {
      javadoc = trimComment(context.JAVADOC[0].image);
    }

    return { name, values, javadoc };
  }

  enumPropList(context) {
    return context.enumProp.map(this.visit, this);
  }

  enumProp(context) {
    const prop: any = {
      key: context.enumPropKey[0].image,
    };

    if (context.JAVADOC) {
      prop.comment = trimComment(context.JAVADOC[0].image);
    }
    if (context.enumPropValue) {
      prop.value = context.enumPropValue[0].image;
    }
    if (context.enumPropValueWithQuotes) {
      prop.value = context.enumPropValueWithQuotes[0].image.replace(/"/g, '');
    }
    return prop;
  }

  entityList(context) {
    let entityList: any[] = [];
    if (context.NAME) {
      entityList = context.NAME.map(nameToken => nameToken.image);
    }

    const entityOnlyListContainsAll = entityList.length === 1 && entityList[0] === 'all';

    if (context.STAR || entityOnlyListContainsAll) {
      entityList = ['*'];
    }

    if (context.method) {
      entityList.push(context.method[0].image);
    }
    if (context.methodPath) {
      entityList.push(context.methodPath[0].image);
    }

    return deduplicate(entityList);
  }

  exclusion(context) {
    return context.NAME.map(nameToken => nameToken.image, this);
  }

  unaryOptionDeclaration(context) {
    return getUnaryOptionFromContext(context, this);
  }

  binaryOptionDeclaration(context) {
    return getBinaryOptionFromContext(context, this);
  }

  useOptionDeclaration(context) {
    return getSpecialUnaryOptionDeclaration(context, this);
  }

  filterDef(context) {
    let entityList: any[] = [];
    if (context.NAME) {
      entityList = context.NAME.map(nameToken => nameToken.image, this);
    }

    const entityOnlyListContainsAll = entityList.length === 1 && entityList[0] === 'all';

    if (context.STAR || entityOnlyListContainsAll) {
      entityList = ['*'];
    }

    return deduplicate(entityList);
  }

  comment(context) {
    if (context.JAVADOC) {
      return trimComment(context.JAVADOC[0].image);
    }

    return null;
  }

  deploymentDeclaration(context) {
    const config = {};

    if (context.deploymentConfigDeclaration) {
      const configProps = context.deploymentConfigDeclaration.map(this.visit, this);
      configProps.forEach(configProp => {
        config[configProp.key] = configProp.value;
      });
    }

    return config;
  }

  deploymentConfigDeclaration(context) {
    const key = context.DEPLOYMENT_KEY[0].image;
    const value = this.visit(context.deploymentConfigValue);

    return { key, value };
  }

  deploymentConfigValue(context) {
    return this.configValue(context);
  }

  applicationDeclaration(context) {
    return this.visit(context.applicationSubDeclaration);
  }

  applicationSubDeclaration(context) {
    const applicationSubDeclaration: {
      config: any;
      entities: {
        entityList: any[];
        excluded: any[];
      };
      options: any;
      useOptions: any[];
    } = {
      config: {},
      entities: { entityList: [], excluded: [] },
      options: {},
      useOptions: [],
    };

    if (context.applicationSubConfig) {
      // Apparently the pegjs grammar only returned the last config
      applicationSubDeclaration.config = this.visit(context.applicationSubConfig[context.applicationSubConfig.length - 1]);
    }

    if (context.applicationSubEntities) {
      // Apparently the pegjs grammar only returned the last entities
      applicationSubDeclaration.entities = this.visit(context.applicationSubEntities[context.applicationSubEntities.length - 1]);
    }

    if (context.unaryOptionDeclaration) {
      context.unaryOptionDeclaration.map(this.visit, this).forEach(option => {
        if (!applicationSubDeclaration.options[option.optionName]) {
          applicationSubDeclaration.options[option.optionName] = {};
        }
        const astResult = applicationSubDeclaration.options[option.optionName];

        const { entityList, excludedEntityList } = getOptionEntityAndExcludedEntityLists(astResult, option);
        astResult.list = entityList;
        astResult.excluded = excludedEntityList;
      });
    }

    if (context.binaryOptionDeclaration) {
      context.binaryOptionDeclaration.map(this.visit, this).forEach(option => {
        if (option.optionName === 'paginate') {
          option.optionName = PAGINATION;
        }
        const newOption = !applicationSubDeclaration.options[option.optionName];
        if (newOption) {
          applicationSubDeclaration.options[option.optionName] = {};
        }
        const newOptionValue = !applicationSubDeclaration.options[option.optionName][option.optionValue];
        if (newOptionValue) {
          applicationSubDeclaration.options[option.optionName][option.optionValue] = {};
        }
        const astResult = applicationSubDeclaration.options[option.optionName][option.optionValue];

        const { entityList, excludedEntityList } = getOptionEntityAndExcludedEntityLists(astResult, option);
        astResult.list = entityList;
        astResult.excluded = excludedEntityList;
      });
    }

    if (context.useOptionDeclaration) {
      context.useOptionDeclaration.map(this.visit, this).forEach(option => {
        applicationSubDeclaration.useOptions.push(option);
      });
    }

    return applicationSubDeclaration;
  }

  applicationSubConfig(context) {
    const config: any = {};

    if (context.applicationConfigDeclaration) {
      const configProps = context.applicationConfigDeclaration.map(this.visit, this);
      configProps.forEach(configProp => {
        config[configProp.key] = configProp.value;

        if (configProp.key === PACKAGE_NAME && !config.packageFolder) {
          config.packageFolder = configProp.value.replace(/[.]/g, '/');
        }
      });
    }

    return config;
  }

  applicationSubEntities(context) {
    return getEntityListFromContext(context, this);
  }

  applicationConfigDeclaration(context) {
    const key = context.CONFIG_KEY[0].image;
    const value = this.visit(context.configValue);

    return { key, value };
  }

  configValue(context) {
    if (context.qualifiedName) {
      return this.visit(context.qualifiedName);
    }
    if (context.list) {
      return this.visit(context.list);
    }
    if (context.INTEGER) {
      return context.INTEGER[0].image;
    }
    if (context.STRING) {
      const stringImage = context.STRING[0].image;
      return stringImage.substring(1, stringImage.length - 1);
    }
    if (context.BOOLEAN) {
      return context.BOOLEAN[0].image === 'true';
    }

    /* istanbul ignore next */
    throw new Error('No valid config value was found, expected a qualified name, a list, an integer, a string or a boolean.');
  }

  qualifiedName(context) {
    return context.NAME.map(namePart => namePart.image, this).join('.');
  }

  list(context) {
    if (!context.NAME) {
      return [];
    }
    return context.NAME.map(namePart => namePart.image, this);
  }
}

function getOptionEntityAndExcludedEntityLists(astResult, option) {
  let entityList = astResult.list || [];
  entityList = deduplicate(entityList.concat(option.list));

  let excludedEntityList = astResult.excluded || [];
  if (option.excluded) {
    excludedEntityList = deduplicate(excludedEntityList.concat(option.excluded));
  }
  return { entityList, excludedEntityList };
}

function getEntityListFromContext(context, visitor) {
  const entityList = visitor.visit(context.filterDef);

  let excluded = [];
  if (context.exclusion) {
    excluded = visitor.visit(context.exclusion);
  }

  const result: any = { entityList, excluded };
  if (context.UNARY_OPTION) {
    result.optionName = context.UNARY_OPTION[0].image;
  }
  return result;
}

function getUnaryOptionFromContext(context, visitor) {
  const entityList = visitor.visit(context.filterDef);

  let excluded = [];
  if (context.exclusion) {
    excluded = visitor.visit(context.exclusion);
  }

  return { optionName: context.UNARY_OPTION[0].image, list: entityList, excluded };
}

function getBinaryOptionFromContext(context, visitor) {
  const entityListWithOptionValue = visitor.visit(context.entityList);
  const optionValue = entityListWithOptionValue[entityListWithOptionValue.length - 1];
  const list = entityListWithOptionValue.slice(0, entityListWithOptionValue.length - 1);

  let excluded = [];
  if (context.exclusion) {
    excluded = visitor.visit(context.exclusion);
  }

  return {
    optionName: context.BINARY_OPTION[0].image,
    optionValue,
    list,
    excluded,
  };
}

function getSpecialUnaryOptionDeclaration(context, visitor) {
  const optionValues = context.NAME.map(name => name.image);
  const list = visitor.visit(context.filterDef);

  let excluded = [];
  if (context.exclusion) {
    excluded = visitor.visit(context.exclusion);
  }

  return {
    optionValues,
    list,
    excluded,
  };
}

function trimComment(comment) {
  return comment.replace(/^\/[*]+[ ]*/, '').replace(/[ ]*[*]+\/$/, '');
}
