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
import { escapeRegExp } from 'lodash-es';

export type JavaImportType = { staticImport?: boolean };

const addJavaImportToContent = (content: string, identifier: string, { staticImport }: JavaImportType = {}) => {
  const importStatement = `import ${staticImport ? 'static ' : ''}${identifier};`;
  return new RegExp(escapeRegExp(importStatement)).test(content)
    ? content
    : content.replace(/(package [\w.]+;\n\n?)/, `$1${importStatement}\n`);
};

export function addJavaImport(identifier: string, type?: JavaImportType): (content: string) => string;
export function addJavaImport(content: string, identifierOrType: string, type?: JavaImportType): string;
export function addJavaImport(
  contentOrIdentifier: string,
  identifierOrType?: string | JavaImportType,
  type?: JavaImportType,
): string | ((content: string) => string) {
  if (typeof identifierOrType === 'string') {
    return addJavaImportToContent(contentOrIdentifier, identifierOrType, type);
  }
  return (content: string) => addJavaImportToContent(content, contentOrIdentifier, identifierOrType);
}

type JavaAnnotationParameter = { value?: string | string[] } & Record<string, string | string[]>;

export type JavaAnnotation = {
  package?: string;
  annotation: string;
  parameters?: (
    oldParameters: JavaAnnotationParameter,
    callbacks: {
      addKeyValue: (key: string, item: string) => void;
      setKeyValue: (key: string, item: string) => void;
    },
  ) => void | string | JavaAnnotationParameter;
};

export function parseJavaAnnotation(annotation?: string): JavaAnnotationParameter {
  if (annotation === undefined) {
    return {};
  }
  const params = [];
  let current = '';
  let depth = 0;

  // Iterate to find top-level commas
  for (const char of annotation) {
    if (char === '(' || char === '{' || char === '[') depth++;
    if (char === ')' || char === '}' || char === ']') depth--;

    if (char === ',' && depth === 0) {
      params.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  params.push(current.trim());

  // Convert array of strings into a key-value object
  return params.reduce((acc, param) => {
    const eqIdx = param.indexOf('=');
    if (eqIdx === -1) {
      acc.value = param.trim();
      return acc;
    }

    const key = param.substring(0, eqIdx).trim();
    let value: string | string[] = param.substring(eqIdx + 1).trim();

    if (value.startsWith('{')) {
      // Handle Java arrays by stripping braces and splitting
      value = value
        .slice(1, -1)
        .split(/,\s*/)
        .map(v => v.replace(/^"|"$/g, ''));
    } else {
      value = value.replace(/^"|"$/g, ''); // Simple strings
    }

    acc[key] = value;
    return acc;
  }, {} as JavaAnnotationParameter);
}

const serializeJavaAnnotationParameters = (params?: JavaAnnotationParameter): string => {
  if (!params) {
    return '';
  }
  const entries = Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? `{${value.join(', ')}}` : value]);
  if (entries.length === 0) {
    return '';
  } else if (entries.length === 1 && entries[0][0] === 'value') {
    return entries[0][1] as string;
  }
  return entries.map(([key, value]) => `${key} = ${value}`).join(', ');
};

const addJavaAnnotationToContent = (content: string, annotationDef: JavaAnnotation) => {
  const { package: packageName, annotation, parameters } = annotationDef;
  if (packageName) {
    content = addJavaImport(content, `${packageName}.${annotation}`);
  }
  const annotationWithParametersMatches = content.match(new RegExp(String.raw`@${annotation}\((?<oldParameters>[^)]*)\)`));
  let annotationToAdd: string | undefined;
  if (parameters) {
    const oldParameters = annotationWithParametersMatches?.groups?.oldParameters?.trim?.();
    const parsedParameters = parseJavaAnnotation(oldParameters);
    const returnedParameters = parameters(parsedParameters, {
      addKeyValue: (key, value) => {
        const existing = parsedParameters[key];
        if (existing) {
          if (Array.isArray(existing)) {
            parsedParameters[key] = Array.isArray(value) ? [...existing, ...value] : [...existing, value];
          } else {
            parsedParameters[key] = Array.isArray(value) ? [existing, ...value] : [existing, value];
          }
        } else {
          parsedParameters[key] = value;
        }
      },
      setKeyValue: (key, value) => {
        const existing = parsedParameters[key];
        if (existing) {
          if (Array.isArray(existing)) {
            parsedParameters[key] = Array.isArray(value) ? [...existing, ...value] : [...existing, value];
          } else {
            parsedParameters[key] = Array.isArray(value) ? [existing, ...value] : [existing, value];
          }
        } else {
          parsedParameters[key] = value;
        }
      },
    });
    const serializedParam =
      typeof returnedParameters === 'string'
        ? returnedParameters
        : serializeJavaAnnotationParameters(returnedParameters ?? parsedParameters);
    annotationToAdd = serializedParam ? `${annotation}(${serializedParam})` : annotation;
  } else {
    annotationToAdd = annotation;
  }
  if (annotationWithParametersMatches) {
    content = content.replace(new RegExp(String.raw`@${annotation}\((?<oldParameters>[^)]*)\)`), `@${annotationToAdd}`);
  } else if (!new RegExp(escapeRegExp(`\n@${annotationToAdd}\n`)).test(content)) {
    // add the annotation before class or interface
    content = content.replace(/\n([a-w ]*(class|@?interface|enum) )/, `\n@${annotationToAdd}\n$1`);
  }
  return content;
};

export function addJavaAnnotation(annotation: JavaAnnotation): (content: string) => string;
export function addJavaAnnotation(content: string, annotation: JavaAnnotation): string;
export function addJavaAnnotation(
  contentOrAnnotation: string | JavaAnnotation,
  annotation?: JavaAnnotation,
): string | ((content: string) => string) {
  if (typeof contentOrAnnotation === 'string') {
    return addJavaAnnotationToContent(contentOrAnnotation, annotation!);
  }
  return (content: string) => addJavaAnnotationToContent(content, contentOrAnnotation);
}
