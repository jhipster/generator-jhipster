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
import type { CstNode, IToken } from 'chevrotain';

import type { ParsedJDLApplications, ParsedJDLConfigDeclaration, ParsedJDLOptionDeclaration } from '../types/parsed.ts';
import type { JDLRuntime } from '../types/runtime.ts';

import type { JDLDiagnostic } from './diagnostics.ts';
import { type SourceRange, isSourceToken, sourceRange } from './locations.ts';

type Context = Record<string, any[]>;
export type JDLAstBuilderOptions = {
  /** Include source locations and declaration occurrences for tooling and semantic validation. */
  locations?: boolean;
  onDiagnostic?: (diagnostic: JDLDiagnostic) => void;
};

const token = (context: Context, key: string) => (context[key] as IToken[] | undefined)?.find(isSourceToken);
const image = (context: Context, key: string) => token(context, key)?.image;
const images = (context: Context, key: string) => ((context[key] as IToken[] | undefined) ?? []).filter(isSourceToken).map(t => t.image);
const parseStringLiteral = (value: string) => value.slice(1, -1);
const deduplicate = <T>(values: T[]): T[] => [...new Set(values)];
const trimComment = (comment: string) => comment.replace(/^\/\*+ */, '').replace(/ *\*+\/$/, '');
const comment = (context: Context) => (image(context, 'JAVADOC') === undefined ? null : trimComment(image(context, 'JAVADOC')!));
const set = (target: object, key: string, value: unknown) =>
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });

export const buildJDLAstBuilderVisitor = (runtime: JDLRuntime, options: JDLAstBuilderOptions = {}) => {
  const BaseJDLCSTVisitor = runtime.parser.getBaseCstVisitorConstructor();
  const configDeclarations = new WeakMap<object, ParsedJDLConfigDeclaration[]>();
  const locate = <T extends object>(value: T, context: Context): T => {
    if (options.locations) Object.assign(value, { location: sourceRange(context) });
    return value;
  };
  const warn = (message: string, context: Context, range = sourceRange(context)) =>
    options.onDiagnostic?.({ ruleId: 'deprecated-option', severity: 'warning', message, range });
  const normalizeOptionName = (keyword: string, context: Context, range?: SourceRange): string => {
    for (const [name, { jdl }] of Object.entries(runtime.entityDefinition.configs)) {
      if ((jdl.keyword ?? name) === keyword) return name;
      if (jdl.deprecatedKeywords?.includes(keyword)) {
        warn(`The ${keyword} option is deprecated, please use ${name} instead.`, context, range);
        return name;
      }
    }
    return keyword;
  };
  const warnIfDeprecated = (key: string, context: Context, grammar: 'application' | 'deployment') => {
    const definition = grammar === 'application' ? runtime.applicationDefinition : runtime.deploymentDefinition;
    const deprecated = definition.optionTypes[key]?.deprecated;
    if (deprecated) warn(`The ${key} ${grammar} option is deprecated: ${deprecated}`, context);
  };
  const mergeOption = (target: Record<string, any>, declaration: ParsedJDLOptionDeclaration, context: Context) => {
    const name = normalizeOptionName(declaration.optionName, context, declaration.location);
    if (!Object.hasOwn(target, name)) set(target, name, {});
    let value = target[name];
    if (declaration.optionValue !== undefined) {
      if (!Object.hasOwn(value, declaration.optionValue)) set(value, declaration.optionValue, { list: [], excluded: [] });
      value = value[declaration.optionValue];
    }
    value.list = deduplicate([...(value.list ?? []), ...declaration.list]);
    value.excluded = deduplicate([...(value.excluded ?? []), ...declaration.excluded]);
    if (options.locations) value.location = declaration.location;
  };

  class JDLAstBuilderVisitor extends BaseJDLCSTVisitor {
    declare many: (context: Context, key: string) => any[];
    declare valueType: (nodes: (IToken | CstNode)[] | undefined) => ParsedJDLConfigDeclaration['valueType'];
    constructor() {
      super();
      this.validateVisitor();
    }

    prog(context: Context): ParsedJDLApplications {
      const constants = this.many(context, 'constantDeclaration');
      const declarations = this.many(context, 'optionDeclaration');
      const ast: ParsedJDLApplications = {
        applications: this.many(context, 'applicationDeclaration'),
        deployments: this.many(context, 'deploymentDeclaration'),
        constants: Object.fromEntries(constants.map(item => [item.name, item.value])),
        entities: this.many(context, 'entityDeclaration'),
        relationships: this.many(context, 'relationDeclaration').flat(),
        enums: this.many(context, 'enumDeclaration'),
        options: {},
        useOptions: this.many(context, 'useOptionDeclaration'),
      };
      for (const declaration of declarations) mergeOption(ast.options, declaration, context);
      if (options.locations) {
        ast.constantDeclarations = constants;
        ast.optionDeclarations = declarations;
      }
      return ast;
    }

    constantDeclaration(context: Context) {
      const name = image(context, 'NAME');
      const value = image(context, 'INTEGER') ?? image(context, 'DECIMAL');
      if (name === undefined || value === undefined) return undefined;
      return { name, value };
    }

    entityDeclaration(context: Context) {
      const name = image(context, 'NAME');
      if (name === undefined) return undefined;
      return {
        annotations: this.many(context, 'annotationDeclaration'),
        name,
        tableName: this.visit(context.entityTableNameDeclaration),
        body: this.visit(context.entityBody) ?? [],
        documentation: comment(context),
      };
    }

    annotationDeclaration(context: Context) {
      const optionName = image(context, 'option');
      if (optionName === undefined) return undefined;
      const value = token(context, 'value');
      if (!value && context.LPAREN) return undefined;
      if (!value) return { optionName, type: 'UNARY' };
      let optionValue: string | number | boolean = value.image;
      switch (value.tokenType.name) {
        case 'INTEGER':
          optionValue = Number.parseInt(value.image, 10);
          break;
        case 'DECIMAL':
          optionValue = Number.parseFloat(value.image);
          break;
        case 'TRUE':
          optionValue = true;
          break;
        case 'FALSE':
          optionValue = false;
          break;
        case 'STRING':
          optionValue = parseStringLiteral(value.image);
          break;
        default:
          break;
      }
      return { optionName, optionValue, type: 'BINARY' };
    }

    entityTableNameDeclaration(context: Context) {
      return image(context, 'NAME');
    }
    entityBody(context: Context) {
      return this.many(context, 'fieldDeclaration');
    }

    fieldDeclaration(context: Context) {
      const name = image(context, 'NAME');
      const type = this.visit(context.type);
      if (name === undefined || type === undefined) return undefined;
      return {
        name,
        type,
        validations: this.many(context, 'validation'),
        documentation: comment(context),
        annotations: this.many(context, 'annotationDeclaration'),
      };
    }

    type(context: Context) {
      return image(context, 'NAME');
    }

    validation(context: Context) {
      const flag = image(context, 'FLAG_VALIDATION');
      if (flag !== undefined) return { key: flag, value: '' };
      return this.visit(context.minMaxValidation ?? context.pattern);
    }

    minMaxValidation(context: Context) {
      const key = image(context, 'MIN_MAX_KEYWORD');
      const value = image(context, 'NAME') ?? image(context, 'INTEGER') ?? image(context, 'DECIMAL');
      if (key === undefined || value === undefined) return undefined;
      return image(context, 'NAME') === undefined ? { key, value } : { key, value, constant: true };
    }

    pattern(context: Context) {
      const value = image(context, 'REGEX');
      return value === undefined ? undefined : { key: image(context, 'PATTERN') ?? 'pattern', value: value.slice(1, -1) };
    }

    relationDeclaration(context: Context) {
      const cardinality = this.visit(context.relationshipType);
      if (cardinality === undefined) return [];
      return this.many(context, 'relationshipBody').map(relationship => ({ ...relationship, cardinality }));
    }
    relationshipType(context: Context) {
      return image(context, 'RELATIONSHIP_TYPE');
    }

    relationshipBody(context: Context) {
      const from = this.visit(context.from);
      const to = this.visit(context.to);
      if (!from || !to) return undefined;
      return {
        from,
        to,
        options: locate(
          {
            global: this.visit(context.relationshipOptions) ?? [],
            source: this.many(context, 'annotationOnSourceSide'),
            destination: this.many(context, 'annotationOnDestinationSide'),
          },
          context,
        ),
      };
    }

    relationshipSide(context: Context) {
      const name = image(context, 'NAME');
      if (name === undefined) return undefined;
      let injectedField = image(context, 'injectedField') ?? null;
      const parameter = image(context, 'injectedFieldParam');
      if (injectedField && parameter !== undefined) injectedField += `(${parameter})`;
      return {
        name,
        injectedField,
        documentation: this.visit(context.comment) ?? null,
        ...(injectedField ? { required: image(context, 'REQUIRED') === 'required' } : {}),
        ...(options.locations && token(context, 'REQUIRED') ?
          { validationDeclarations: [locate({ key: image(context, 'REQUIRED')!, value: '' }, { REQUIRED: [token(context, 'REQUIRED')!] })] }
        : {}),
      };
    }
    relationshipOptions(context: Context) {
      return this.many(context, 'relationshipOption');
    }
    relationshipOption(context: Context) {
      const optionName = image(context, 'RELATIONSHIP_OPTION');
      return optionName === undefined ? undefined : { optionName, type: 'UNARY', ...(options.locations ? { statement: true } : {}) };
    }

    enumDeclaration(context: Context) {
      const name = image(context, 'NAME');
      if (name === undefined) return undefined;
      return { name, values: this.visit(context.enumPropList) ?? [], documentation: comment(context) };
    }
    enumPropList(context: Context) {
      return this.many(context, 'enumProp');
    }
    enumProp(context: Context) {
      const key = image(context, 'enumPropKey');
      if (key === undefined) return undefined;
      const result: Record<string, unknown> = { key };
      if (image(context, 'JAVADOC') !== undefined) result.comment = comment(context);
      if (image(context, 'enumPropValue') !== undefined) result.value = image(context, 'enumPropValue');
      const quoted = image(context, 'enumPropValueWithQuotes');
      if (quoted !== undefined) {
        result.value = quoted.replace(/"/g, '');
        if (options.locations) result.quoted = true;
      }
      return result;
    }

    entityList(context: Context) {
      return [...this.filterDef(context), ...images(context, 'method'), ...images(context, 'methodPath')];
    }
    exclusion(context: Context) {
      return images(context, 'NAME');
    }
    optionDeclaration(context: Context) {
      const optionName = image(context, 'option');
      if (optionName === undefined) return undefined;
      const value = image(context, 'method') ?? image(context, 'methodPath');
      if (value === undefined && context.WITH) return undefined;
      return {
        optionName,
        ...(value === undefined ? {} : { optionValue: value }),
        list: this.visit(context.filterDef) ?? [],
        excluded: this.visit(context.exclusion) ?? [],
      };
    }
    useOptionDeclaration(context: Context) {
      return {
        optionValues: images(context, 'NAME'),
        list: this.visit(context.filterDef) ?? [],
        excluded: this.visit(context.exclusion) ?? [],
      };
    }
    filterDef(context: Context) {
      const names = images(context, 'NAME');
      return token(context, 'STAR') || (names.length === 1 && names[0] === 'all') ? ['*'] : deduplicate(names);
    }
    comment(context: Context) {
      return comment(context);
    }

    deploymentDeclaration(context: Context) {
      const declarations = this.many(context, 'deploymentConfigDeclaration');
      const config = Object.fromEntries(declarations.map(item => [item.key, item.value]));
      if (options.locations) config.configDeclarations = declarations;
      return config;
    }
    deploymentConfigDeclaration(context: Context) {
      const key = image(context, 'DEPLOYMENT_KEY');
      const value = this.visit(context.deploymentConfigValue);
      if (key === undefined || value === undefined) return undefined;
      warnIfDeprecated(key, context, 'deployment');
      return { key, value, ...(options.locations ? { valueType: this.valueType(context.deploymentConfigValue) } : {}) };
    }
    deploymentConfigValue(context: Context) {
      return this.configValue(context);
    }

    applicationDeclaration(context: Context) {
      return this.visit(context.applicationSubDeclaration);
    }
    applicationSubDeclaration(context: Context) {
      const configNodes = (context.applicationSubConfig ?? []) as CstNode[];
      const configs = configNodes.map(node => this.visit(node));
      const config = configs.at(-1) ?? locate({}, context);
      const namespaceConfigs: Record<string, any> = {};
      const namespaceNodes = (context.applicationSubNamespaceConfig ?? []) as CstNode[];
      if (namespaceNodes.length) {
        const namespace = this.visit(namespaceNodes.at(-1)!);
        if (namespace) set(namespaceConfigs, namespace.namespace, namespace.config);
      }
      const entitiesOptions = this.visit(context.applicationSubEntities?.slice(-1) ?? []) ?? {
        entityList: [],
        excluded: [],
      };
      const declarations = this.many(context, 'optionDeclaration');
      const optionValues = {};
      for (const declaration of declarations) mergeOption(optionValues, declaration, context);
      return {
        config,
        namespaceConfigs,
        entitiesOptions,
        options: optionValues,
        useOptions: this.many(context, 'useOptionDeclaration'),
        ...(options.locations ?
          { configDeclarations: configs.flatMap(config => configDeclarations.get(config) ?? []), optionDeclarations: declarations }
        : {}),
      };
    }
    applicationSubNamespaceConfig(context: Context) {
      const namespace = image(context, 'namespace');
      if (namespace === undefined) return undefined;
      const declarations = this.many(context, 'applicationNamespaceConfigDeclaration');
      return { namespace, config: locate(Object.fromEntries(declarations.map(item => [item.key, item.value])), context) };
    }
    applicationNamespaceConfigDeclaration(context: Context) {
      const key = image(context, 'NAME');
      const value = this.visit(context.namespaceConfigValue);
      return key === undefined || value === undefined ? undefined : { key, value };
    }
    namespaceConfigValue(context: Context) {
      return this.configValue(context);
    }
    applicationSubConfig(context: Context) {
      const declarations = this.many(context, 'applicationConfigDeclaration');
      const config = Object.fromEntries(declarations.map(item => [item.key, item.value]));
      configDeclarations.set(config, declarations);
      return config;
    }
    applicationSubEntities(context: Context) {
      return { entityList: this.visit(context.filterDef) ?? [], excluded: this.visit(context.exclusion) ?? [] };
    }
    applicationConfigDeclaration(context: Context) {
      const key = image(context, 'CONFIG_KEY');
      const value = this.visit(context.configValue);
      if (key === undefined || value === undefined) return undefined;
      warnIfDeprecated(key, context, 'application');
      return { key, value, ...(options.locations ? { valueType: this.valueType(context.configValue) } : {}) };
    }
    configValue(context: Context) {
      for (const key of ['qualifiedName', 'list', 'quotedList']) if (context[key]) return this.visit(context[key]);
      if (token(context, 'INTEGER')) return image(context, 'INTEGER');
      if (token(context, 'STRING')) return parseStringLiteral(image(context, 'STRING')!);
      if (token(context, 'BOOLEAN')) return image(context, 'BOOLEAN') === 'true';
      return undefined;
    }
    qualifiedName(context: Context) {
      const names = images(context, 'NAME');
      return names.length ? names.join('.') : undefined;
    }
    list(context: Context) {
      return images(context, 'NAME');
    }
    quotedList(context: Context) {
      return images(context, 'STRING').map(parseStringLiteral);
    }
  }

  const visitor = new JDLAstBuilderVisitor();
  // Attach helpers after validation: these are implementation helpers, not CST grammar rules.
  visitor.many = (context: Context, key: string) =>
    ((context[key] ?? []) as CstNode[]).map(node => visitor.visit(node)).filter(value => value !== undefined);
  visitor.valueType = (nodes: (IToken | CstNode)[] | undefined) => {
    const context = (nodes?.[0] as CstNode | undefined)?.children ?? {};
    return (['quotedList', 'list', 'qualifiedName', 'INTEGER', 'STRING', 'BOOLEAN'] as const).find(key => !!context[key]);
  };
  const visit = visitor.visit.bind(visitor);
  visitor.visit = (nodes: CstNode | CstNode[] | undefined, parameter?: unknown) => {
    const node = Array.isArray(nodes) ? nodes[0] : nodes;
    if (!node) return undefined;
    const result = visit(node, parameter);
    return result && typeof result === 'object' && !Array.isArray(result) ? locate(result, node.children) : result;
  };
  return visitor;
};
