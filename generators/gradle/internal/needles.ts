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
import { createNeedleCallback } from '../../base/support/index.js';
import { GradleScript, GradleDependency, GradlePlugin, GradleProperty, GradleRepository } from '../types.js';

export const applyFromGradleCallback = ({ script }: GradleScript) =>
  createNeedleCallback({
    needle: 'gradle-apply-from',
    contentToAdd: `apply from: "${script}"`,
  });

export const addGradleDependencyCallback = ({ groupId, artifactId, version, scope }: GradleDependency) =>
  createNeedleCallback({
    needle: 'gradle-dependency',
    contentToAdd: `${scope} "${groupId}:${artifactId}${version ? `:${version}` : ''}"`,
  });

export const addGradlePluginCallback = ({ id, version }: GradlePlugin) =>
  createNeedleCallback({
    needle: 'gradle-plugins',
    contentToAdd: `id "${id}"${version ? ` version "${version}"` : ''}`,
  });

export const addGradlePluginManagementCallback = ({ id, version }: GradlePlugin) =>
  createNeedleCallback({
    needle: 'gradle-plugin-management-plugins',
    contentToAdd: `id "${id}" version "${version}"`,
  });

export const addGradlePropertyCallback = ({ property, value }: GradleProperty) =>
  createNeedleCallback({
    needle: 'gradle-property',
    contentToAdd: `${property}=${value}`,
    contentToCheck: new RegExp(`\n${property}=`),
    autoIndent: false,
  });

export const addGradleMavenRepositoryCallback = ({ url, username, password }: GradleRepository) =>
  createNeedleCallback({
    needle: 'gradle-repositories',
    // prettier-ignore
    contentToAdd: `
maven {
    url "${url}"${ username || password ? `
    credentials {${ username ? `
        username = "${username}"` : ''}${ password ? `
        password = "${password}"` : ''}
    }` : ''}
}`,
  });
