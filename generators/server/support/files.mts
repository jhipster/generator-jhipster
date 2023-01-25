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

export const replaceFilePathVariables = (data: any, filePath: string) => filePath?.replace(/_package_/, data.package)?.replace(/_\w*/, '');

export const replaceEntityFilePathVariables = (data: any, filePath: string) => {
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
export const moveToJavaPackageSrcDir = (data: any, filePath: string) =>
  `${data.javaPackageSrcDir}${replaceFilePathVariables(data, filePath) ?? ''}`;

/**
 * Move the template to `javaPackageTestDir` (defaults to`src/main/java/${packageFolder}/${filePath}`).
 * Removes trailing specifiers.
 */
export const moveToJavaPackageTestDir = (data: any, filePath: string) =>
  `${data.javaPackageTestDir}${replaceFilePathVariables(data, filePath) ?? ''}`;

export const moveToJavaEntityPackageSrcDir = (data: any, filePath: string) =>
  `${data.srcMainJava}${data.entityAbsoluteFolder}${replaceEntityFilePathVariables(data, filePath) ?? ''}`;

export const moveToJavaEntityPackageTestDir = (data: any, filePath: string) =>
  `${data.srcTestJava}${data.entityAbsoluteFolder}${replaceEntityFilePathVariables(data, filePath) ?? ''}`;
