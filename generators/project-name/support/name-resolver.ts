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
import path from 'node:path';

import { camelCase } from 'lodash-es';

const defaultName = 'jhipster';

export const validateJavaApplicationName = (name: string) => {
  if (!/^([\w]*)$/.test(name)) {
    return 'Your base name cannot contain special characters or a blank space';
  }
  if (name.includes('_')) {
    return 'Your base name cannot contain underscores as this does not meet the URI spec';
  }
  if (name.toLowerCase() === 'application') {
    return "Your base name cannot be named 'application' as this is a reserved name for Spring Boot";
  }
  return true;
};

export const validateNpmProjectName = (name: string) => {
  if (!/^([\w-.]*)$/.test(name)) {
    return 'Your base name cannot contain special characters or a blank space';
  }
  return true;
};

export const validateProjectName = (name: string, { javaApplication }: { javaApplication?: boolean } = {}) =>
  javaApplication ? validateJavaApplicationName(name) : validateNpmProjectName(name);

const getDefaultName = (options: { cwd?: string; reproducible?: boolean; javaApplication?: boolean } = {}) => {
  if (options.reproducible) {
    return defaultName;
  }

  const { javaApplication = false, cwd = process.cwd() } = options;
  let projectName = path.basename(cwd);
  if (javaApplication) {
    projectName = camelCase(projectName);
  } else {
    projectName = projectName.replace('generator-jhipster-', '');
  }
  return validateProjectName(projectName, { javaApplication }) === true ? projectName : defaultName;
};

export default getDefaultName;
