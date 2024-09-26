/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import type {
  GradleComment,
  GradleDependency,
  GradleLibraryDependency,
  GradleNeedleOptions,
  GradlePlugin,
  GradleProperty,
  GradleRepository,
  GradleScript,
  GradleTomlPlugin,
  GradleTomlVersion,
} from '../types.js';

const tomlItemToString = (item: Record<string, string | undefined>) =>
  `{ ${Object.entries(item)
    .filter(([_key, value]) => value !== undefined)
    .map(([key, value]) => `${key} = "${value}"`)
    .join(', ')} }`;

const gradleNameToReference = (name: string) => name.replaceAll('-', '.');

const scopeSortOrder = {
  'implementation platform': 1,
  implementation: 2,
  compileOnly: 3,
  runtimeOnly: 4,
  testImplementation: 5,
  testRuntimeOnly: 6,
};

const wrapScope = (scope: string, dependency: string, closure?: string[]) => {
  if (closure?.length || scope === 'implementation platform') {
    return `${scope}(${dependency})${closure?.length ? ` {\n${closure.join('\n')}\n}` : ''}`;
  }
  return `${scope} ${dependency}`;
};

const serializeDependency = (dependency: GradleDependency) => {
  if ('libraryName' in dependency) {
    return wrapScope(dependency.scope, `libs.${gradleNameToReference(dependency.libraryName)}`, dependency.closure);
  }

  const { groupId, artifactId, version, classifier, scope, closure } = dependency;
  return wrapScope(
    scope,
    classifier && !version
      ? `group: "${groupId}", name: "${artifactId}", classifier: "${classifier}"`
      : `"${groupId}:${artifactId}${version ? `:${version}` : ''}${classifier ? `:${classifier}` : ''}"`,
    closure,
  );
};

export const gradleNeedleOptionsWithDefaults = (options: GradleNeedleOptions): Required<GradleNeedleOptions> => {
  const { gradleFile = 'build.gradle', gradleVersionCatalogFile = 'gradle/libs.versions.toml' } = options;
  return { gradleFile, gradleVersionCatalogFile };
};

export const sortDependencies = (a: GradleDependency, b: GradleDependency): number => {
  let ret = (scopeSortOrder[a.scope] ?? 100) - (scopeSortOrder[b.scope] ?? 100);
  // Keep implementation platform scope dependencies in the order they were added
  if (ret !== 0 || a.scope === 'implementation platform') {
    return ret;
  }
  ret = a.scope.localeCompare(b.scope);
  if (ret !== 0) {
    return ret;
  }
  if ('libraryName' in a || 'libraryName' in b) {
    // Keep catalog dependencies on top
    if ('libraryName' in a && 'libraryName' in b) {
      return a.libraryName.localeCompare(b.libraryName);
    }
    return 'libraryName' in a ? -1 : 1;
  }
  ret = a.groupId.localeCompare(b.groupId);
  if (ret !== 0) {
    // Keep Spring dependencies on top
    const aIsSpring = a.groupId.startsWith('org.springframework.');
    const bIsSpring = b.groupId.startsWith('org.springframework.');
    if (aIsSpring !== bIsSpring && (aIsSpring || bIsSpring)) {
      return aIsSpring ? -1 : 1;
    }
    return ret;
  }
  return ret === 0 ? a.artifactId.localeCompare(b.artifactId) : ret;
};

export const applyFromGradleCallback = ({ script }: GradleScript) =>
  createNeedleCallback({
    needle: 'gradle-apply-from',
    contentToAdd: `apply from: "${script}"`,
  });

export const addGradleDependenciesCallback = (dependencies: GradleDependency[]) =>
  createNeedleCallback({
    needle: 'gradle-dependency',
    contentToAdd: dependencies.map(serializeDependency),
  });

export const addGradleBuildscriptDependenciesCallback = (dependencies: GradleDependency[]) =>
  createNeedleCallback({
    needle: 'gradle-buildscript-dependency',
    contentToAdd: dependencies.map(serializeDependency),
  });

/** @deprecated use addGradleDependenciesCallback */
export const addGradleBuildSrcDependencyCallback = (dependency: GradleDependency) =>
  createNeedleCallback({
    needle: 'gradle-build-src-dependency',
    contentToAdd: serializeDependency(dependency),
  });

export const addGradleDependenciesCatalogVersionCallback = (versions: GradleTomlVersion[]) =>
  createNeedleCallback({
    needle: 'gradle-dependency-catalog-version',
    contentToAdd: versions.map(({ name, version }) => `${name} = "${version}"`),
  });

export const addGradleDependencyCatalogLibrariesCallback = (libraries: (GradleLibraryDependency & { closure?: string[] })[]) =>
  createNeedleCallback({
    needle: 'gradle-dependency-catalog-libraries',
    contentToAdd: libraries.map(({ libraryName, scope: _scope, closure: _closure, ...others }) =>
      'library' in others ? `${libraryName} = "${others.library}"` : `${libraryName} = ${tomlItemToString(others)}`,
    ),
  });

export const addGradleDependencyCatalogPluginsCallback = (plugins: GradleTomlPlugin[]) =>
  createNeedleCallback({
    needle: 'gradle-dependency-catalog-plugins',
    contentToAdd: plugins.map(({ pluginName, addToBuild: _addToBuild, ...others }) =>
      'plugin' in others ? `${pluginName} = "${others.plugin}"` : `${pluginName} = ${tomlItemToString(others)}`,
    ),
  });

export const addGradlePluginFromCatalogCallback = (plugins: GradleTomlPlugin[]) =>
  createNeedleCallback({
    needle: 'gradle-plugins',
    contentToAdd: plugins
      .filter(({ addToBuild }) => addToBuild)
      .map(({ pluginName }) => `alias(libs.plugins.${gradleNameToReference(pluginName)})`),
  });

/** @deprecated use addGradleDependenciesCatalogVersionCallback */
export const addGradleBuildSrcDependencyCatalogVersionCallback = ({ name, version }: GradleTomlVersion) =>
  createNeedleCallback({
    needle: 'gradle-build-src-dependency-catalog-version',
    contentToAdd: `${name} = "${version}"`,
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

export const addGradlePropertyCallback = ({ comment, property, value }: GradleProperty & GradleComment) =>
  createNeedleCallback({
    needle: 'gradle-property',
    contentToAdd: `${typeof comment === 'string' ? `## ${comment}\n` : ''}${property}${typeof value === 'string' ? `=${value}` : ''}`,
    contentToCheck: new RegExp(`\n${property}${typeof value === 'string' ? '=' : '\n'}`),
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
