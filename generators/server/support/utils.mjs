/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { XMLParser } from 'fast-xml-parser';

/**
 * Extract properties from pom content
 * @param {string} pomContent
 * @returns {Record<string, string>}
 */
export function getPomProperties(pomContent) {
  return new XMLParser().parse(pomContent).project.properties;
}

/**
 * Extract version properties from pom content
 * @param {string} pomContent
 * @returns {Record<string, string>}
 */
export function getPomVersionProperties(pomContent) {
  return Object.fromEntries(
    Object.entries(getPomProperties(pomContent))
      .filter(([property]) => property.endsWith('.version'))
      .map(([property, value]) => [property.slice(0, -8), value])
  );
}

/**
 * @private
 * Utility function add condition to every block in addition to the already existing condition.
 */
export function addSectionsCondition(files, commonCondition) {
  return Object.fromEntries(
    Object.entries(files).map(([sectionName, sectionValue]) => {
      sectionValue = sectionValue.map(block => {
        const { condition } = block;
        let newCondition = commonCondition;
        if (typeof condition === 'function') {
          newCondition = (...args) => {
            return commonCondition(...args) && condition(...args);
          };
        } else if (condition !== undefined) {
          newCondition = (...args) => commonCondition(...args) && condition;
        }
        block = {
          ...block,
          condition: newCondition,
        };
        return block;
      });
      return [sectionName, sectionValue];
    })
  );
}

/**
 * @private
 * Utility function to merge sections (jhipster files structure)
 * Merging { foo: [blocks1], bar: [block2]} and { foo: [blocks3], bar: [block4]}
 * Results in { foo: [blocks1, block3], bar: [block2, block4]}
 */
export function mergeSections(...allFiles) {
  const generated = {};
  for (const files of allFiles) {
    for (const [sectionName, sectionValue] of Object.entries(files)) {
      generated[sectionName] = generated[sectionName] || [];
      generated[sectionName].push(...sectionValue);
    }
  }
  return generated;
}

export const replaceFilePathVariables = (data, filePath) => filePath?.replace(/_package_/, data.package)?.replace(/_\w*/, '');

export const replaceEntityFilePathVariables = (data, filePath) => {
  filePath = filePath
    ?.replace(/_package_/, data.entityJavaPackageFolder)
    ?.replace(/_PersistClass_/, data.persistClass)
    ?.replace(/_EntityClass_/, data.entityClass)
    ?.replace(/_DtoClass_/, data.dtoClass);
  return filePath?.includes('.jhi.') ? filePath : filePath?.replace(/_\w*/, '');
};

/**
 * Move the template to `javaPackageSrcDir` (defaults to`src/main/java/${packageFolder}/${filePath}`).
 * Removes trailing specifiers.
 */
export const moveToJavaPackageSrcDir = (data, filePath) => `${data.javaPackageSrcDir}${replaceFilePathVariables(data, filePath) ?? ''}`;

/**
 * Move the template to `javaPackageTestDir` (defaults to`src/main/java/${packageFolder}/${filePath}`).
 * Removes trailing specifiers.
 */
export const moveToJavaPackageTestDir = (data, filePath) => `${data.javaPackageTestDir}${replaceFilePathVariables(data, filePath) ?? ''}`;

export const moveToJavaEntityPackageSrcDir = (data, filePath) =>
  `${data.srcMainJava}${data.entityAbsoluteFolder}${replaceEntityFilePathVariables(data, filePath) ?? ''}`;

export const moveToJavaEntityPackageTestDir = (data, filePath) =>
  `${data.srcTestJava}${data.entityAbsoluteFolder}${replaceEntityFilePathVariables(data, filePath) ?? ''}`;
