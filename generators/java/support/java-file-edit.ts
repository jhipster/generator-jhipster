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
import assert from 'assert';
import { escapeRegExp } from 'lodash-es';

export type JavaClassName = { className: string };
export type JavaContructorParam = JavaClassName & { param: string | string[] };
export type JavaField = JavaClassName & { field: string | string[] };
export type JavaContructorSetter = JavaClassName & { setter: string | string[] };

const findJavaConstructor = (content: string, className: string) => {
  const regex = `(?<before>\\n(?<ident>[^\\S\\r\\n]*)(?:public|protect|private)?\\s*${className}\\s*\\()(?<params>[^(]*)(?<after>\\))\\s*\\{`;
  const result = new RegExp(regex, 'g').exec(content);
  if (!result || result.length === 1) {
    throw new Error(`Constructor not found for ${className}`);
  }
  const paramStartIndex = result.index! + result.groups!.before!.length;
  const { params, ident } = result.groups!;
  return {
    newLineIndex: result?.index,
    params,
    ident,
    paramStartIndex,
    paramEndIndex: paramStartIndex + params.length,
    blockStartIndex: result.index + result[0].length,
  };
};

export function injectJavaConstructorParam(options: JavaContructorParam): (content: string) => string;
export function injectJavaConstructorParam(content: string, options: JavaContructorParam): string;
export function injectJavaConstructorParam(
  paramOrAnnotation: string | JavaContructorParam,
  options?: JavaContructorParam,
): string | ((content: string) => string) {
  const injectJavaConstructorParamToContent = (content: string, opts: JavaContructorParam): string => {
    const { className } = opts;
    const paramSpec = Array.isArray(opts.param) ? opts.param : [opts.param];
    const { params: constructorParams, paramStartIndex, paramEndIndex } = findJavaConstructor(content, className);
    const paramsToAdd = paramSpec.filter(param => !constructorParams.split(',').find(existing => existing.trim() === param.trim()));
    if (paramsToAdd.length === 0) {
      return content;
    }
    const newParams = constructorParams ? `${constructorParams}, ${paramsToAdd.join(', ')}` : paramSpec.join(', ');
    return `${content.slice(0, paramStartIndex)}${newParams}${content.slice(paramEndIndex)}`;
  };
  if (typeof paramOrAnnotation === 'string') {
    return injectJavaConstructorParamToContent(paramOrAnnotation, options!);
  }
  return (content: string) => injectJavaConstructorParamToContent(content, paramOrAnnotation);
}

export function injectJavaField(options: JavaField): (content: string) => string;
export function injectJavaField(content: string, options: JavaField): string;
export function injectJavaField(paramOrOptions: string | JavaField, options?: JavaField): string | ((content: string) => string) {
  const injectJavaFieldToContent = (content: string, opts: JavaField): string => {
    assert(opts.className, 'className is required');
    assert(opts.field, 'field is required');

    const { className } = opts;
    let fieldsToAdd = Array.isArray(opts.field) ? opts.field : [opts.field];

    const { newLineIndex, ident } = findJavaConstructor(content, className);
    fieldsToAdd = fieldsToAdd
      .map(field => (field.trim() === field ? `${ident}${field}` : field))
      .filter(field => !new RegExp(escapeRegExp(field)).test(content));
    if (fieldsToAdd.length === 0) {
      return content;
    }

    return `${content.slice(0, newLineIndex)}\n${fieldsToAdd.join('\n')}\n${content.slice(newLineIndex)}`;
  };
  if (typeof paramOrOptions === 'string') {
    return injectJavaFieldToContent(paramOrOptions, options!);
  }
  return (content: string) => injectJavaFieldToContent(content, paramOrOptions);
}

export function injectJavaConstructorSetter(options: JavaContructorSetter): (content: string) => string;
export function injectJavaConstructorSetter(content: string, options: JavaContructorSetter): string;
export function injectJavaConstructorSetter(
  paramOrAnnotation: string | JavaContructorSetter,
  options?: JavaContructorSetter,
): string | ((content: string) => string) {
  const injectJavaConstructorParamToContent = (content: string, opts: JavaContructorSetter): string => {
    assert(opts.className, 'className is required');
    assert(opts.setter, 'setter is required');

    const { className } = opts;
    let setterSpec = Array.isArray(opts.setter) ? opts.setter : [opts.setter];
    const { ident, blockStartIndex } = findJavaConstructor(content, className);
    setterSpec = setterSpec
      .map(setter => (setter.trim() === setter ? `${ident.repeat(2)}${setter}` : setter))
      .filter(setter => !new RegExp(escapeRegExp(setter)).test(content));
    if (setterSpec.length === 0) {
      return content;
    }
    return `${content.slice(0, blockStartIndex)}\n${setterSpec.join('\n')}\n${content.slice(blockStartIndex)}`;
  };
  if (typeof paramOrAnnotation === 'string') {
    return injectJavaConstructorParamToContent(paramOrAnnotation, options!);
  }
  return (content: string) => injectJavaConstructorParamToContent(content, paramOrAnnotation);
}
