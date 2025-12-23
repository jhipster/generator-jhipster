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

export type JavaAnnotation = { package?: string; annotation: string; parameters?: (oldParameters?: string) => string };

const addJavaAnnotationToContent = (content: string, annotationDef: JavaAnnotation) => {
  const { package: packageName, annotation, parameters } = annotationDef;
  if (packageName) {
    content = addJavaImport(content, `${packageName}.${annotation}`);
  }
  const annotationWithParametersMatches = content.match(new RegExp(`@${annotation}\\((?<oldParameters>[^)]*)\\)`));
  const annotationToAdd = parameters ? `${annotation}(${parameters(annotationWithParametersMatches?.groups?.oldParameters)})` : annotation;
  if (annotationWithParametersMatches) {
    content = content.replace(new RegExp(`@${annotation}\\((?<oldParameters>[^)]*)\\)`), `@${annotationToAdd}`);
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
