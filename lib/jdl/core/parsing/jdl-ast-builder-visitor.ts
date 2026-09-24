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
import type { CstNode, ICstVisitor, IToken } from 'chevrotain';

import { mergeKeyLocations, setKeyLocations, setLocation, spanLocation, tokenLocation } from './location.ts';
import type { JDLRelationshipType } from './relationship-types.ts';
import type {
  JDLLocation,
  ParsedJDLAnnotation,
  ParsedJDLApplicationConfig,
  ParsedJDLApplicationDeclaration,
  ParsedJDLApplications,
  ParsedJDLBinaryOption,
  ParsedJDLDeployment,
  ParsedJDLEntity,
  ParsedJDLEntityField,
  ParsedJDLEnum,
  ParsedJDLEnumValue,
  ParsedJDLOption,
  ParsedJDLOptionConfig,
  ParsedJDLRelationship,
  ParsedJDLRelationshipSide,
  ParsedJDLUseOption,
  ParsedJDLValidation,
} from './types/parsed.ts';
import type { JDLApplicationOptionType } from './types/parsing.ts';
import type { JDLRuntime } from './types/runtime.ts';

type VisitorContext = {
  applicationDeclaration?: CstNode[];
  entityDeclaration?: CstNode[];
  constantDeclaration?: CstNode[];
  deploymentDeclaration?: CstNode[];
  relationDeclaration?: CstNode[];
  enumDeclaration?: CstNode[];
  optionDeclaration?: CstNode[];
  useOptionDeclaration?: CstNode[];
  // filterDef?: CstNode[];
  // exclusion?: CstNode[];
  // comment?: CstNode[];
  // applicationSubDeclaration?: CstNode[];
};

/**
 * Drop the quotes of a STRING token. The content is kept as written, an escaped quote stays `\"`: a
 * `@MapstructExpression` is copied into a java string literal.
 */
const parseStringLiteral = (image: string): string => image.slice(1, -1);

const deduplicate = <T>(array: T[]): T[] => [...new Set(array)];

/**
 * @param onWarning - receives the warnings about what the jdl uses, a deprecated option for instance.
 */
export const buildJDLAstBuilderVisitor = (runtime: JDLRuntime, onWarning: (message: string) => void) => {
  const BaseJDLCSTVisitor = runtime.parser.getBaseCstVisitorConstructor();

  const warnIfDeprecated = (key: string, optionType: JDLApplicationOptionType | undefined, grammar: 'application' | 'deployment') => {
    if (optionType?.deprecated) {
      onWarning(`The ${key} ${grammar} option is deprecated: ${optionType.deprecated}`);
    }
  };

  /** The binary option a statement keyword names, warning about a deprecated keyword. */
  const binaryOptionName = (keyword: string): string => {
    for (const [name, { jdl }] of Object.entries(runtime.entityDefinition.configs)) {
      if ((jdl.keyword ?? name) === keyword) {
        return name;
      }
      if (jdl.deprecatedKeywords?.includes(keyword)) {
        onWarning(`The ${keyword} option is deprecated, please use ${name} instead.`);
        return name;
      }
    }
    return keyword;
  };

  class JDLAstBuilderVisitor extends BaseJDLCSTVisitor {
    constructor() {
      super();
      this.validateVisitor();
    }

    prog(context: VisitorContext): ParsedJDLApplications {
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
        const constants = context.constantDeclaration.map(element => this.visit(element));
        const keyLocations: Record<string, JDLLocation | undefined> = {};
        constants.forEach(currConst => {
          ast.constants[currConst.name] = currConst.value;
          keyLocations[currConst.name] = currConst.location;
        });
        setKeyLocations(ast.constants, keyLocations);
      }

      if (context.applicationDeclaration) {
        ast.applications = context.applicationDeclaration.map(element => this.visit(element));
      }

      if (context.deploymentDeclaration) {
        ast.deployments = context.deploymentDeclaration.map(element => this.visit(element));
      }

      if (context.entityDeclaration) {
        ast.entities = context.entityDeclaration.map(element => this.visit(element));
      }

      if (context.relationDeclaration) {
        ast.relationships = context.relationDeclaration.flatMap(element => this.visit(element));
      }

      if (context.enumDeclaration) {
        ast.enums = context.enumDeclaration.map(element => this.visit(element));
      }

      const options: ParsedJDLOption[] = context.optionDeclaration?.map(element => this.visit(element)) ?? [];
      if (options.some(option => option.optionValue === undefined)) {
        options
          .filter(option => option.optionValue === undefined)
          .forEach((option: ParsedJDLOption) => {
            if (!ast.options[option.optionName]) {
              ast.options[option.optionName] = {};
            }
            const astResult = ast.options[option.optionName];

            const { entityList, excludedEntityList } = getOptionEntityAndExcludedEntityLists(astResult, option);
            astResult.list = entityList;
            astResult.excluded = excludedEntityList;
            mergeKeyLocations(astResult, option.keyLocations);
            // The statements are merged: the first one locates them.
            if (!astResult.location) setLocation(astResult, option.location);
          });
      }

      if (options.some(option => option.optionValue !== undefined)) {
        options
          .filter((option): option is ParsedJDLBinaryOption => option.optionValue !== undefined)
          .forEach((option: ParsedJDLBinaryOption) => {
            option.optionName = binaryOptionName(option.optionName);
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
            mergeKeyLocations(astResult, option.keyLocations);
            // The statements are merged: the first one locates them.
            if (!astResult.location) setLocation(astResult, option.location);
          });
      }

      if (context.useOptionDeclaration) {
        ast.useOptions = context.useOptionDeclaration.map(element => this.visit(element));
      }

      return ast;
    }

    constantDeclaration(context: Record<'INTEGER' | 'NAME' | 'DECIMAL', IToken[]>) {
      return {
        name: context.NAME[0].image,
        value: context.INTEGER ? context.INTEGER[0].image : context.DECIMAL?.[0].image,
        location: spanLocation(context),
      };
    }

    entityDeclaration(
      context: Record<'ENTITY' | 'NAME' | 'JAVADOC', IToken[]> &
        Record<'annotationDeclaration' | 'entityTableNameDeclaration' | 'entityBody', CstNode[]>,
    ): ParsedJDLEntity {
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

      return setLocation({ annotations, name, tableName, body, documentation }, spanLocation(context));
    }

    annotationDeclaration(context: Record<'AT' | 'value' | 'option', IToken[]>): ParsedJDLAnnotation {
      const optionName = context.option[0].image;
      if (!context.value) {
        return setLocation({ optionName, type: 'UNARY' }, spanLocation(context));
      }
      const { image: valueImage } = context.value[0];
      const { tokenType } = context.value[0];
      let optionValue: ParsedJDLAnnotation['optionValue'];
      switch (tokenType.name) {
        case 'INTEGER':
          optionValue = Number.parseInt(valueImage, 10);
          break;
        case 'DECIMAL':
          optionValue = Number.parseFloat(valueImage);
          break;
        case 'TRUE':
          optionValue = true;
          break;
        case 'FALSE':
          optionValue = false;
          break;
        case 'STRING':
          optionValue = parseStringLiteral(valueImage);
          break;
        default:
          optionValue = valueImage;
      }
      return setLocation({ optionName, optionValue, type: 'BINARY' }, spanLocation(context));
    }

    entityTableNameDeclaration(context: Record<'NAME', IToken[]>): string {
      return context.NAME[0].image;
    }

    entityBody(context: Record<'fieldDeclaration', CstNode[]>): ParsedJDLEntityField[] {
      if (!context.fieldDeclaration) {
        return [];
      }
      return context.fieldDeclaration.map(element => this.visit(element));
    }

    fieldDeclaration(
      context: Record<'JAVADOC' | 'NAME', IToken[]> & Record<'annotationDeclaration' | 'validation' | 'type', CstNode[]>,
    ): ParsedJDLEntityField {
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

      return setLocation(
        {
          name: context.NAME[0].image,
          // context.type is an array with a single item.
          // in that case:
          // this.visit(context.type) is equivalent to this.visit(context.type[0])
          type: this.visit(context.type),
          validations,
          documentation: comment,
          annotations,
        },
        spanLocation(context),
      );
    }

    type(context: Record<'NAME', IToken[]>): string {
      return context.NAME[0].image;
    }

    validation(context: Record<'REQUIRED' | 'UNIQUE', IToken[]> & Record<'valuedValidation', CstNode[]>): ParsedJDLValidation {
      // only one of these alternatives can exist at the same time; a validation is keyed by its keyword, as written.
      const keyword = context.REQUIRED ?? context.UNIQUE;
      const validation: ParsedJDLValidation = keyword ? { key: keyword[0].image, value: '' } : this.visit(context.valuedValidation);
      return setLocation(validation, spanLocation(context));
    }

    valuedValidation(context: Record<'validationName' | 'NAME' | 'INTEGER' | 'DECIMAL' | 'REGEX', IToken[]>): ParsedJDLValidation {
      const key = context.validationName[0].image;
      if (context.NAME) {
        return { key, value: context.NAME[0].image, constant: true };
      }
      if (context.REGEX) {
        const patternImage = context.REGEX[0].image;
        return { key, value: patternImage.substring(1, patternImage.length - 1) };
      }
      return { key, value: context.INTEGER ? context.INTEGER[0].image : context.DECIMAL[0].image };
    }

    relationDeclaration(context: Record<'relationshipType' | 'relationshipBody', CstNode[]>): ParsedJDLRelationship[] {
      const cardinality = this.visit(context.relationshipType);
      const relationshipBodies = context.relationshipBody.map(element => this.visit(element));

      relationshipBodies.forEach(relationshipBody => {
        relationshipBody.cardinality = cardinality;
      });

      return relationshipBodies;
    }

    relationshipType(context: Record<'RELATIONSHIP_TYPE', IToken[]>): JDLRelationshipType {
      // The token only matches the relationship types.
      return context.RELATIONSHIP_TYPE[0].image as JDLRelationshipType;
    }

    relationshipBody(
      context: Record<'from' | 'to' | 'annotationOnSourceSide' | 'annotationOnDestinationSide' | 'relationshipOptions', CstNode[]>,
    ): Omit<ParsedJDLRelationship, 'cardinality'> {
      const optionsForTheSourceSide = context.annotationOnSourceSide?.map(element => this.visit(element)) ?? [];
      const optionsForTheDestinationSide = context.annotationOnDestinationSide?.map(element => this.visit(element)) ?? [];

      const from = this.visit(context.from);
      const to = this.visit(context.to);

      const relationshipOptions: ParsedJDLAnnotation[] = [];
      if (context.relationshipOptions) {
        this.visit(context.relationshipOptions).forEach((option: ParsedJDLAnnotation) => relationshipOptions.push(option));
      }

      return setLocation(
        {
          from,
          to,
          options: {
            global: relationshipOptions,
            source: optionsForTheSourceSide,
            destination: optionsForTheDestinationSide,
          },
        },
        spanLocation(context),
      );
    }

    relationshipSide(
      context: Record<'NAME' | 'injectedField' | 'injectedFieldParam' | 'REQUIRED', IToken[]> & Record<'comment', CstNode[]>,
    ): ParsedJDLRelationshipSide {
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
      return setLocation(ast, spanLocation(context));
    }

    relationshipOptions(context: Record<'relationshipOption', CstNode[]>): ParsedJDLAnnotation[] {
      return context.relationshipOption.map(element => this.visit(element)).reduce((final, current) => [...final, current], []);
    }

    relationshipOption(context: Record<'NAME', IToken[]>): ParsedJDLAnnotation {
      return setLocation({ optionName: context.NAME[0].image, type: 'UNARY' }, spanLocation(context));
    }

    enumDeclaration(context: Record<'NAME' | 'JAVADOC', IToken[]> & Record<'enumPropList', CstNode[]>): ParsedJDLEnum {
      const name = context.NAME[0].image;
      const values = this.visit(context.enumPropList);
      let documentation: string | null = null;
      if (context.JAVADOC) {
        documentation = trimComment(context.JAVADOC[0].image);
      }

      return setLocation({ name, values, documentation }, spanLocation(context));
    }

    enumPropList(context: Record<'enumProp', CstNode[]>): ParsedJDLEnumValue[] {
      return context.enumProp.map(element => this.visit(element));
    }

    enumProp(context: Record<'enumPropKey' | 'enumPropValue' | 'enumPropValueWithQuotes' | 'JAVADOC', IToken[]>): ParsedJDLEnumValue {
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
      return setLocation(prop, spanLocation(context));
    }

    exclusion(context: Record<'NAME', IToken[]>): string[] {
      return context.NAME.map(nameToken => nameToken.image);
    }

    optionDeclaration(
      context: Record<'option' | 'method' | 'methodPath', IToken[]> & Record<'filterDef' | 'exclusion', CstNode[]>,
    ): ParsedJDLOption {
      return setLocation(getOptionFromContext(context, this), spanLocation(context));
    }

    useOptionDeclaration(context: Record<'NAME', IToken[]> & Record<'filterDef' | 'exclusion', CstNode[]>): ParsedJDLUseOption {
      return setLocation(getSpecialUnaryOptionDeclaration(context, this), spanLocation(context));
    }

    filterDef(context: Record<'NAME' | 'STAR', IToken[]>): string[] {
      let entityList: any[] = [];
      if (context.NAME) {
        entityList = context.NAME.map(nameToken => nameToken.image);
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

    deploymentDeclaration(context: Record<'deploymentConfigDeclaration', CstNode[]>): ParsedJDLDeployment {
      const config: ParsedJDLDeployment = {};
      const keyLocations: Record<string, JDLLocation | undefined> = {};

      if (context.deploymentConfigDeclaration) {
        const configProps: { key: string; value: string | boolean | string[]; location?: JDLLocation }[] =
          context.deploymentConfigDeclaration.map(element => this.visit(element));
        configProps.forEach(configProp => {
          config[configProp.key] = configProp.value;
          keyLocations[configProp.key] = configProp.location;
        });
      }

      return setKeyLocations(setLocation(config, spanLocation(context)), keyLocations);
    }

    deploymentConfigDeclaration(context: Record<'NAME', IToken[]> & Record<'deploymentConfigValue', CstNode[]>) {
      const key = context.NAME[0].image;
      const value = this.visit(context.deploymentConfigValue);

      warnIfDeprecated(key, runtime.deploymentDefinition.optionTypes[key], 'deployment');

      return { key, value, location: spanLocation(context) };
    }

    deploymentConfigValue(
      context: Record<'INTEGER' | 'STRING' | 'BOOLEAN', IToken[]> & Record<'qualifiedName' | 'list' | 'quotedList', CstNode[]>,
    ) {
      return this.configValue(context);
    }

    applicationDeclaration(context: Record<'applicationSubDeclaration', CstNode[]>): ParsedJDLApplicationDeclaration {
      return setLocation(this.visit(context.applicationSubDeclaration), spanLocation(context));
    }

    applicationSubDeclaration(
      context: Record<
        'applicationSubConfig' | 'applicationSubNamespaceConfig' | 'applicationSubEntities' | 'optionDeclaration' | 'useOptionDeclaration',
        CstNode[]
      >,
    ): ParsedJDLApplicationDeclaration {
      const applicationSubDeclaration: ParsedJDLApplications['applications'][number] = {
        config: {} as any,
        namespaceConfigs: {},
        entitiesOptions: { entityList: [], excluded: [] },
        options: {},
        useOptions: [],
      };

      if (context.applicationSubConfig) {
        // Apparently the pegjs grammar only returned the last config
        applicationSubDeclaration.config = this.visit(context.applicationSubConfig.at(-1)!);
      }
      if (context.applicationSubNamespaceConfig) {
        const { namespace, config } = this.visit(context.applicationSubNamespaceConfig.at(-1)!);
        applicationSubDeclaration.namespaceConfigs![namespace] = config;
      }

      if (context.applicationSubEntities) {
        // Apparently the pegjs grammar only returned the last entities
        applicationSubDeclaration.entitiesOptions = this.visit(context.applicationSubEntities.at(-1)!);
      }

      const options: ParsedJDLOption[] = context.optionDeclaration?.map(element => this.visit(element)) ?? [];
      if (options.some(option => option.optionValue === undefined)) {
        options
          .filter(option => option.optionValue === undefined)
          .forEach(option => {
            if (!applicationSubDeclaration.options![option.optionName]) {
              applicationSubDeclaration.options![option.optionName] = {};
            }
            const astResult = applicationSubDeclaration.options![option.optionName];

            const { entityList, excludedEntityList } = getOptionEntityAndExcludedEntityLists(astResult, option);
            astResult.list = entityList;
            astResult.excluded = excludedEntityList;
            mergeKeyLocations(astResult, option.keyLocations);
            // The statements are merged: the first one locates them.
            if (!astResult.location) setLocation(astResult, option.location);
          });
      }

      if (options.some(option => option.optionValue !== undefined)) {
        options
          .filter((option): option is ParsedJDLBinaryOption => option.optionValue !== undefined)
          .forEach(option => {
            option.optionName = binaryOptionName(option.optionName);
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
            mergeKeyLocations(astResult, option.keyLocations);
            // The statements are merged: the first one locates them.
            if (!astResult.location) setLocation(astResult, option.location);
          });
      }

      if (context.useOptionDeclaration) {
        context.useOptionDeclaration
          .map(element => this.visit(element))
          .forEach(option => {
            applicationSubDeclaration.useOptions!.push(option);
          });
      }

      return applicationSubDeclaration;
    }

    applicationSubNamespaceConfig(context: Record<'namespace', IToken[]> & Record<'applicationNamespaceConfigDeclaration', CstNode[]>) {
      const config: any = {};

      const keyLocations: Record<string, JDLLocation | undefined> = {};
      const namespace = context.namespace[0].image;
      if (context.applicationNamespaceConfigDeclaration) {
        const configProps = context.applicationNamespaceConfigDeclaration.map(element => this.visit(element));
        configProps.forEach(configProp => {
          config[configProp.key] = configProp.value;
          keyLocations[configProp.key] = configProp.location;
        });
      }

      return { namespace, config: setKeyLocations(config, keyLocations) };
    }

    applicationNamespaceConfigDeclaration(context: Record<'NAME', IToken[]> & Record<'namespaceConfigValue', CstNode[]>) {
      const key = context.NAME[0].image;
      const value = this.visit(context.namespaceConfigValue);

      return { key, value, location: spanLocation(context) };
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
        return parseStringLiteral(context.STRING[0].image);
      }
      if (context.BOOLEAN) {
        return context.BOOLEAN[0].image === 'true';
      }

      /* istanbul ignore next */
      throw new Error('No valid config value was found, expected a qualified name, a list, an integer, a string or a boolean.');
    }

    applicationSubConfig(context: Record<'applicationConfigDeclaration', CstNode[]>): ParsedJDLApplicationConfig {
      const config: any = {};
      const keyLocations: Record<string, JDLLocation | undefined> = {};

      if (context.applicationConfigDeclaration) {
        const configProps = context.applicationConfigDeclaration.map(element => this.visit(element));
        configProps.forEach(configProp => {
          config[configProp.key] = configProp.value;
          keyLocations[configProp.key] = configProp.location;
        });
      }

      return setKeyLocations(config, keyLocations);
    }

    applicationSubEntities(context: Record<'filterDef' | 'exclusion', CstNode[]>) {
      return getEntityListFromContext(context, this);
    }

    applicationConfigDeclaration(context: Record<'NAME', IToken[]> & Record<'configValue', CstNode[]>) {
      const key = context.NAME[0].image;
      const value = this.visit(context.configValue);

      warnIfDeprecated(key, runtime.applicationDefinition.optionTypes[key], 'application');

      return { key, value, location: spanLocation(context) };
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
        return parseStringLiteral(context.STRING[0].image);
      }
      if (context.BOOLEAN) {
        return context.BOOLEAN[0].image === 'true';
      }

      /* istanbul ignore next */
      throw new Error('No valid config value was found, expected a qualified name, a list, an integer, a string or a boolean.');
    }

    qualifiedName(context: Record<'NAME', IToken[]>): string {
      return context.NAME.map(namePart => namePart.image).join('.');
    }

    list(context: Record<'NAME', IToken[]>): string[] {
      if (!context.NAME) {
        return [];
      }
      return context.NAME.map(namePart => namePart.image);
    }

    quotedList(context: Record<'STRING', IToken[]>): string[] {
      if (!context.STRING) {
        return [];
      }
      return context.STRING.map(namePart => parseStringLiteral(namePart.image));
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

/** Where each entity name of a list, and of its exclusion, is written: the first occurrence of a name. */
function getEntityNameLocations(context: Record<'filterDef' | 'exclusion', CstNode[]>): Record<string, JDLLocation> {
  const nameTokens = [context.filterDef?.[0], context.exclusion?.[0]].flatMap(node => (node?.children.NAME ?? []) as IToken[]);
  const keyLocations: Record<string, JDLLocation> = {};
  for (const token of nameTokens) {
    keyLocations[token.image] ??= tokenLocation(token);
  }
  return keyLocations;
}

function getEntityListFromContext(context: Record<'filterDef' | 'exclusion', CstNode[]>, visitor: ICstVisitor<any, any>) {
  const entityList = visitor.visit(context.filterDef);

  let excluded = [];
  if (context.exclusion) {
    excluded = visitor.visit(context.exclusion);
  }

  return setKeyLocations({ entityList, excluded }, getEntityNameLocations(context));
}

/** An option statement: unary without a value, binary with the `with` value. */
function getOptionFromContext(
  context: Record<'option' | 'method' | 'methodPath', IToken[]> & Record<'filterDef' | 'exclusion', CstNode[]>,
  visitor: ICstVisitor<any, any>,
) {
  const { entityList, excluded } = getEntityListFromContext(context, visitor);
  const value = context.method?.[0] ?? context.methodPath?.[0];
  return setKeyLocations(
    {
      optionName: context.option[0].image,
      ...(value ? { optionValue: value.image } : {}),
      list: entityList,
      excluded,
    },
    getEntityNameLocations(context),
  );
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

  return setKeyLocations({ optionValues, list, excluded }, getEntityNameLocations(context));
}

function trimComment(comment: string): string {
  return comment.replace(/^\/\*+ */, '').replace(/ *\*+\/$/, '');
}
