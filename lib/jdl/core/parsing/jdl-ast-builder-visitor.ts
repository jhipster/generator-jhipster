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
import type { CstNode, ICstVisitor, IToken } from 'chevrotain';

import { relationshipOptions, validations } from '../built-in-options/index.ts';
import type {
  ParsedJDLAnnotation,
  ParsedJDLApplications,
  ParsedJDLBinaryOption,
  ParsedJDLEntityField,
  ParsedJDLOption,
  ParsedJDLOptionConfig,
  ParsedJDLValidation,
} from '../types/parsed.js';
import type { JDLRuntime } from '../types/runtime.js';
import deduplicate from '../utils/array-utils.ts';
import logger from '../utils/objects/logger.ts';

const { BUILT_IN_ENTITY } = relationshipOptions;
const {
  Validations: { PATTERN, REQUIRED, UNIQUE },
} = validations;

type VisitorContext = {
  applicationDeclaration?: CstNode[];
  entityDeclaration?: CstNode[];
  constantDeclaration?: CstNode[];
  deploymentDeclaration?: CstNode[];
  relationDeclaration?: CstNode[];
  enumDeclaration?: CstNode[];
  unaryOptionDeclaration?: CstNode[];
  binaryOptionDeclaration?: CstNode[];
  useOptionDeclaration?: CstNode[];
  // filterDef?: CstNode[];
  // exclusion?: CstNode[];
  // comment?: CstNode[];
  // applicationSubDeclaration?: CstNode[];
};

export const buildJDLAstBuilderVisitor = (runtime: JDLRuntime) => {
  const BaseJDLCSTVisitor = runtime.parser.getBaseCstVisitorConstructor();

  class JDLAstBuilderVisitor extends BaseJDLCSTVisitor {
    constructor() {
      super();
      this.validateVisitor();
    }

    prog(context: VisitorContext) {
      const ast: ParsedJDLApplications = {
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
        context.unaryOptionDeclaration.map(this.visit, this).forEach((option: ParsedJDLOption) => {
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
        context.binaryOptionDeclaration.map(this.visit, this).forEach((option: ParsedJDLBinaryOption) => {
          if (option.optionName === 'paginate') {
            // TODO drop for v9
            logger.warn('The paginate option is deprecated, please use pagination instead.');
            option.optionName = 'pagination';
          }
          const newOption = !ast.options[option.optionName];
          if (newOption) {
            ast.options[option.optionName] = {};
          }
          const optionValuesMap = ast.options[option.optionName] as Record<string, ParsedJDLOptionConfig>;
          if (!optionValuesMap[option.optionValue]) {
            optionValuesMap[option.optionValue] = { list: [], excluded: [] };
          }
          const astResult = optionValuesMap[option.optionValue];

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

    constantDeclaration(context: Record<'INTEGER' | 'NAME' | 'DECIMAL', IToken[]>) {
      return {
        name: context.NAME[0].image,
        value: context.INTEGER ? context.INTEGER[0].image : context.DECIMAL?.[0].image,
      };
    }

    entityDeclaration(
      context: Record<'ENTITY' | 'NAME' | 'JAVADOC', IToken[]> &
        Record<'annotationDeclaration' | 'entityTableNameDeclaration' | 'entityBody', CstNode[]>,
    ) {
      const annotations: ParsedJDLAnnotation[] = [];
      if (context.annotationDeclaration) {
        context.annotationDeclaration.forEach(contextObject => {
          annotations.push(this.visit(contextObject));
        });
      }

      let documentation: string | null = null;
      if (context.JAVADOC) {
        documentation = trimComment(context.JAVADOC[0].image);
      }

      const name = context.NAME[0].image;

      let tableName: string | undefined;
      if (context.entityTableNameDeclaration) {
        tableName = this.visit(context.entityTableNameDeclaration);
      }

      let body: ParsedJDLEntityField[] = [];
      if (context.entityBody) {
        body = this.visit(context.entityBody);
      }

      return {
        annotations,
        name,
        tableName,
        body,
        documentation,
      };
    }

    annotationDeclaration(context: Record<'AT' | 'value' | 'option', IToken[]>) {
      const optionName = context.option[0].image;
      if (!context.value) {
        return { optionName, type: 'UNARY' };
      }
      const { image: valueImage } = context.value[0];
      const { tokenType } = context.value[0];
      let optionValue: unknown;
      switch (tokenType.name) {
        case 'INTEGER':
          optionValue = parseInt(valueImage, 10);
          break;
        case 'DECIMAL':
          optionValue = parseFloat(valueImage);
          break;
        case 'TRUE':
          optionValue = true;
          break;
        case 'FALSE':
          optionValue = false;
          break;
        default:
          optionValue = valueImage.replace(/"/g, '');
      }
      return { optionName, optionValue, type: 'BINARY' };
    }

    entityTableNameDeclaration(context: Record<'NAME', IToken[]>) {
      return context.NAME[0].image;
    }

    entityBody(context: Record<'fieldDeclaration', CstNode[]>) {
      if (!context.fieldDeclaration) {
        return [];
      }
      return context.fieldDeclaration.map(element => this.visit(element));
    }

    fieldDeclaration(context: Record<'JAVADOC' | 'NAME', IToken[]> & Record<'annotationDeclaration' | 'validation' | 'type', CstNode[]>) {
      const annotations: any[] = [];
      if (context.annotationDeclaration) {
        context.annotationDeclaration.forEach(contextObject => {
          annotations.push(this.visit(contextObject));
        });
      }

      // filter actual comment as the comment rule may be empty
      const comment = context.JAVADOC ? trimComment(context.JAVADOC[0].image) : null;

      let validations: ParsedJDLValidation[] = [];
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
        documentation: comment,
        annotations,
      };
    }

    type(context: Record<'NAME', IToken[]>) {
      return context.NAME[0].image;
    }

    validation(context: Record<'REQUIRED' | 'UNIQUE', IToken[]> & Record<'minMaxValidation' | 'pattern', CstNode[]>) {
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

    minMaxValidation(context: Record<'NAME' | 'MIN_MAX_KEYWORD' | 'INTEGER' | 'DECIMAL', IToken[]>) {
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

    pattern(context: Record<'REGEX', IToken[]>) {
      const patternImage = context.REGEX[0].image;

      return {
        key: PATTERN,
        value: patternImage.substring(1, patternImage.length - 1),
      };
    }

    relationDeclaration(context: Record<'relationshipType' | 'relationshipBody', CstNode[]>) {
      const cardinality = this.visit(context.relationshipType);
      const relationshipBodies = context.relationshipBody.map(this.visit, this);

      relationshipBodies.forEach(relationshipBody => {
        relationshipBody.cardinality = cardinality;
      });

      return relationshipBodies;
    }

    relationshipType(context: Record<'RELATIONSHIP_TYPE', IToken[]>) {
      return context.RELATIONSHIP_TYPE[0].image;
    }

    relationshipBody(
      context: Record<'from' | 'to' | 'annotationOnSourceSide' | 'annotationOnDestinationSide' | 'relationshipOptions', CstNode[]>,
    ) {
      const optionsForTheSourceSide = context.annotationOnSourceSide ? context.annotationOnSourceSide.map(this.visit, this) : [];
      const optionsForTheDestinationSide = context.annotationOnDestinationSide
        ? context.annotationOnDestinationSide.map(this.visit, this)
        : [];

      const from = this.visit(context.from);
      const to = this.visit(context.to);

      const relationshipOptions: ParsedJDLOption[] = [];
      if (context.relationshipOptions) {
        this.visit(context.relationshipOptions).forEach((option: ParsedJDLOption) => relationshipOptions.push(option));
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

    relationshipSide(
      context: Record<'NAME' | 'injectedField' | 'injectedFieldParam' | 'REQUIRED', IToken[]> & Record<'comment', CstNode[]>,
    ) {
      const documentation = this.visit(context.comment);
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
        documentation,
        required,
      };

      if (!injectedField) {
        delete ast.required;
      }
      return ast;
    }

    relationshipOptions(context: Record<'relationshipOption', CstNode[]>) {
      return context.relationshipOption.map(this.visit, this).reduce((final, current) => [...final, current], []);
    }

    relationshipOption(context: Record<'BUILT_IN_ENTITY', IToken[]>) {
      if (context.BUILT_IN_ENTITY) {
        return { optionName: BUILT_IN_ENTITY, type: 'UNARY' };
      }

      /* istanbul ignore next */
      throw new Error(`No valid relationship option found, expected '${context.BUILT_IN_ENTITY}'.`);
    }

    enumDeclaration(context: Record<'NAME' | 'JAVADOC', IToken[]> & Record<'enumPropList', CstNode[]>) {
      const name = context.NAME[0].image;
      const values = this.visit(context.enumPropList);
      let documentation: string | null = null;
      if (context.JAVADOC) {
        documentation = trimComment(context.JAVADOC[0].image);
      }

      return { name, values, documentation };
    }

    enumPropList(context: Record<'enumProp', CstNode[]>) {
      return context.enumProp.map(this.visit, this);
    }

    enumProp(context: Record<'enumPropKey' | 'enumPropValue' | 'enumPropValueWithQuotes' | 'JAVADOC', IToken[]>) {
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

    entityList(context: Record<'NAME' | 'STAR' | 'method' | 'methodPath', IToken[]>) {
      let entityList: string[] = [];
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

    exclusion(context: Record<'NAME', IToken[]>) {
      return context.NAME.map(nameToken => nameToken.image, this);
    }

    unaryOptionDeclaration(context: Record<'UNARY_OPTION', IToken[]> & Record<'filterDef' | 'exclusion', CstNode[]>) {
      return getUnaryOptionFromContext(context, this);
    }

    binaryOptionDeclaration(context: Record<'BINARY_OPTION', IToken[]> & Record<'entityList' | 'exclusion', CstNode[]>) {
      return getBinaryOptionFromContext(context, this);
    }

    useOptionDeclaration(context: Record<'NAME', IToken[]> & Record<'filterDef' | 'exclusion', CstNode[]>) {
      return getSpecialUnaryOptionDeclaration(context, this);
    }

    filterDef(context: Record<'NAME' | 'STAR', IToken[]>) {
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

    comment(context: Record<'JAVADOC', IToken[]>) {
      if (context.JAVADOC) {
        return trimComment(context.JAVADOC[0].image);
      }

      return null;
    }

    deploymentDeclaration(context: Record<'deploymentConfigDeclaration', CstNode[]>) {
      const config: Record<string, string | boolean> = {};

      if (context.deploymentConfigDeclaration) {
        const configProps: { key: string; value: string | boolean }[] = context.deploymentConfigDeclaration.map(this.visit, this);
        configProps.forEach(configProp => {
          config[configProp.key] = configProp.value;
        });
      }

      return config;
    }

    deploymentConfigDeclaration(context: Record<'DEPLOYMENT_KEY', IToken[]> & Record<'deploymentConfigValue', CstNode[]>) {
      const key = context.DEPLOYMENT_KEY[0].image;
      const value = this.visit(context.deploymentConfigValue);

      return { key, value };
    }

    deploymentConfigValue(
      context: Record<'INTEGER' | 'STRING' | 'BOOLEAN', IToken[]> & Record<'qualifiedName' | 'list' | 'quotedList', CstNode[]>,
    ) {
      return this.configValue(context);
    }

    applicationDeclaration(context: Record<'applicationSubDeclaration', CstNode[]>) {
      return this.visit(context.applicationSubDeclaration);
    }

    applicationSubDeclaration(
      context: Record<
        | 'applicationSubConfig'
        | 'applicationSubNamespaceConfig'
        | 'applicationSubEntities'
        | 'unaryOptionDeclaration'
        | 'binaryOptionDeclaration'
        | 'useOptionDeclaration',
        CstNode[]
      >,
    ) {
      const applicationSubDeclaration: ParsedJDLApplications['applications'][number] = {
        config: {} as any,
        namespaceConfigs: {},
        entitiesOptions: { entityList: [], excluded: [] },
        options: {},
        useOptions: [],
      };

      if (context.applicationSubConfig) {
        // Apparently the pegjs grammar only returned the last config
        applicationSubDeclaration.config = this.visit(context.applicationSubConfig[context.applicationSubConfig.length - 1]);
      }
      if (context.applicationSubNamespaceConfig) {
        const { namespace, config } = this.visit(context.applicationSubNamespaceConfig[context.applicationSubNamespaceConfig.length - 1]);
        applicationSubDeclaration.namespaceConfigs![namespace] = config;
      }

      if (context.applicationSubEntities) {
        // Apparently the pegjs grammar only returned the last entities
        applicationSubDeclaration.entitiesOptions = this.visit(context.applicationSubEntities[context.applicationSubEntities.length - 1]);
      }

      if (context.unaryOptionDeclaration) {
        context.unaryOptionDeclaration.map(this.visit, this).forEach(option => {
          if (!applicationSubDeclaration.options![option.optionName]) {
            applicationSubDeclaration.options![option.optionName] = {};
          }
          const astResult = applicationSubDeclaration.options![option.optionName];

          const { entityList, excludedEntityList } = getOptionEntityAndExcludedEntityLists(astResult, option);
          astResult.list = entityList;
          astResult.excluded = excludedEntityList;
        });
      }

      if (context.binaryOptionDeclaration) {
        context.binaryOptionDeclaration.map(this.visit, this).forEach(option => {
          if (option.optionName === 'paginate') {
            // TODO drop for v9
            logger.warn('The paginate option is deprecated, please use pagination instead.');
            option.optionName = 'pagination';
          }
          if (!applicationSubDeclaration.options![option.optionName]) {
            applicationSubDeclaration.options![option.optionName] = {};
          }
          const optionValuesMap = applicationSubDeclaration.options![option.optionName] as Record<string, ParsedJDLOptionConfig>;
          if (!optionValuesMap[option.optionValue]) {
            optionValuesMap[option.optionValue] = { list: [], excluded: [] };
          }
          const astResult = optionValuesMap[option.optionValue];

          const { entityList, excludedEntityList } = getOptionEntityAndExcludedEntityLists(astResult, option);
          astResult.list = entityList;
          astResult.excluded = excludedEntityList;
        });
      }

      if (context.useOptionDeclaration) {
        context.useOptionDeclaration.map(this.visit, this).forEach(option => {
          applicationSubDeclaration.useOptions!.push(option);
        });
      }

      return applicationSubDeclaration;
    }

    applicationSubNamespaceConfig(context: Record<'namespace', IToken[]> & Record<'applicationNamespaceConfigDeclaration', CstNode[]>) {
      const config: any = {};

      const namespace = context.namespace[0].image;
      if (context.applicationNamespaceConfigDeclaration) {
        const configProps = context.applicationNamespaceConfigDeclaration.map(this.visit, this);
        configProps.forEach(configProp => {
          config[configProp.key] = configProp.value;
        });
      }

      return { namespace, config };
    }

    applicationNamespaceConfigDeclaration(context: Record<'NAME', IToken[]> & Record<'namespaceConfigValue', CstNode[]>) {
      const key = context.NAME[0].image;
      const value = this.visit(context.namespaceConfigValue);

      return { key, value };
    }

    namespaceConfigValue(
      context: Record<'INTEGER' | 'STRING' | 'BOOLEAN', IToken[]> & Record<'qualifiedName' | 'list' | 'quotedList', CstNode[]>,
    ) {
      if (context.qualifiedName) {
        return this.visit(context.qualifiedName);
      }
      if (context.list) {
        return this.visit(context.list);
      }
      if (context.quotedList) {
        return this.visit(context.quotedList);
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

    applicationSubConfig(context: Record<'applicationConfigDeclaration', CstNode[]>) {
      const config: any = {};

      if (context.applicationConfigDeclaration) {
        const configProps = context.applicationConfigDeclaration.map(this.visit, this);
        configProps.forEach(configProp => {
          config[configProp.key] = configProp.value;
        });
      }

      return config;
    }

    applicationSubEntities(context: Record<'UNARY_OPTION', IToken[]> & Record<'filterDef' | 'exclusion', CstNode[]>) {
      return getEntityListFromContext(context, this);
    }

    applicationConfigDeclaration(context: Record<'CONFIG_KEY', IToken[]> & Record<'configValue', CstNode[]>) {
      const key = context.CONFIG_KEY[0].image;
      const value = this.visit(context.configValue);

      return { key, value };
    }

    configValue(context: Record<'INTEGER' | 'STRING' | 'BOOLEAN', IToken[]> & Record<'qualifiedName' | 'list' | 'quotedList', CstNode[]>) {
      if (context.qualifiedName) {
        return this.visit(context.qualifiedName);
      }
      if (context.list) {
        return this.visit(context.list);
      }
      if (context.quotedList) {
        return this.visit(context.quotedList);
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

    qualifiedName(context: Record<'NAME', IToken[]>) {
      return context.NAME.map(namePart => namePart.image, this).join('.');
    }

    list(context: Record<'NAME', IToken[]>) {
      if (!context.NAME) {
        return [];
      }
      return context.NAME.map(namePart => namePart.image, this);
    }

    quotedList(context: Record<'STRING', IToken[]>) {
      if (!context.STRING) {
        return [];
      }
      return context.STRING.map(namePart => namePart.image.slice(1, -1), this);
    }
  }

  return new JDLAstBuilderVisitor();
};

function getOptionEntityAndExcludedEntityLists(
  astResult: ParsedJDLOptionConfig | Record<string, ParsedJDLOptionConfig>,
  option: ParsedJDLOption,
) {
  const { list, excluded } = astResult;
  let entityList = Array.isArray(list) ? list : [];
  entityList = deduplicate(entityList.concat(option.list));

  let excludedEntityList = Array.isArray(excluded) ? excluded : [];
  if (option.excluded) {
    excludedEntityList = deduplicate(excludedEntityList.concat(option.excluded));
  }
  return { entityList, excludedEntityList };
}

function getEntityListFromContext(
  context: Record<'UNARY_OPTION', IToken[]> & Record<'filterDef' | 'exclusion', CstNode[]>,
  visitor: ICstVisitor<any, any>,
) {
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

function getUnaryOptionFromContext(
  context: Record<'UNARY_OPTION', IToken[]> & Record<'filterDef' | 'exclusion', CstNode[]>,
  visitor: ICstVisitor<any, any>,
) {
  const entityList = visitor.visit(context.filterDef);

  let excluded = [];
  if (context.exclusion) {
    excluded = visitor.visit(context.exclusion);
  }

  return { optionName: context.UNARY_OPTION[0].image, list: entityList, excluded };
}

function getBinaryOptionFromContext(
  context: Record<'BINARY_OPTION', IToken[]> & Record<'entityList' | 'exclusion', CstNode[]>,
  visitor: ICstVisitor<any, any>,
) {
  const entityListWithOptionValue: string[] = visitor.visit(context.entityList);
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

function getSpecialUnaryOptionDeclaration(
  context: Record<'NAME', IToken[]> & Record<'filterDef' | 'exclusion', CstNode[]>,
  visitor: ICstVisitor<any, any>,
) {
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

function trimComment(comment: string): string {
  return comment.replace(/^\/[*]+[ ]*/, '').replace(/[ ]*[*]+\/$/, '');
}
