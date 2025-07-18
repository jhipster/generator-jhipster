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
import sortKeys from 'sort-keys';

import type { MavenDependency, MavenProfile } from '../types.js';

export type MavenProjectLike = {
  properties?: Record<string, any>;
  dependencies?: { dependency: MavenDependency[] };
  dependencyManagement?: { dependencies: { dependency: MavenDependency[] } };
  build?: {
    plugins?: { plugin: MavenDependency[] };
    pluginManagement?: { plugins: { plugin: MavenDependency[] } };
  };
};

export type MavenProject = MavenProjectLike & {
  profiles?: { profile: (MavenProfile & MavenProjectLike)[] };
}

export const formatPomFirstLevel = (content: string) =>
  content.replace(
    /(\n {4}<(?:groupId|distributionManagement|repositories|pluginRepositories|properties|dependencyManagement|dependencies|build|profiles)>)/g,
    '\n$1',
  );

const rootAndProfileOrder = [
  'id',
  'activation',
  'modelVersion',
  'groupId',
  'artifactId',
  'version',
  'packaging',
  'name',
  'description',
  'parent',
  'repositories',
  'pluginRepositories',
  'distributionManagement',
  'properties',
  'dependencyManagement',
  'dependencies',
  'build',
  'profiles',
];

const propertiesOrder = [
  'maven.version',
  'java.version',
  'node.version',
  'npm.version',
  'project.build.sourceEncoding',
  'project.reporting.outputEncoding',
  'maven.build.timestamp.format',
  'maven.compiler.source',
  'maven.compiler.target',
  'start-class',
  'argLine',
  'm2e.apt.activation',
  'run.addResources',
  'jhipster-dependencies.version',
  'spring-boot.version',
];

const groupIdOrder = [
  'tech.jhipster',
  'org.apache.maven.plugins',
  'org.springframework.boot',
  'org.springframework.security',
  'org.springdoc',
];

const sortSection = <S extends Record<string, any>>(section: S): S => {
  return Object.fromEntries(
    Object.entries(section).sort(([key1, value1], [key2, value2]) => {
      if (typeof value1 === typeof value2) key1.localeCompare(key2);
      if (typeof value1 === 'string') return -1;
      if (typeof value2 === 'string') return 1;
      return 0;
    }),
  ) as S;
};

const isComment = (name: string): boolean => name.startsWith('#');

const toMaxInt = (nr: number): number => (nr === -1 ? Number.MAX_SAFE_INTEGER : nr);

const sortWithTemplate = (template: string[], a: string, b: string): number => {
  if (isComment(a)) return -1;
  if (isComment(b)) return 1;
  const indexOfA = toMaxInt(template.indexOf(a));
  const indexOfB = toMaxInt(template.indexOf(b));
  if (indexOfA === indexOfB) {
    return a.localeCompare(b);
  }
  return indexOfA - indexOfB;
};

const comparator = (order: string[]) => (a: string, b: string) => sortWithTemplate(order, a, b);

const sortProperties = (properties: Record<string, any>) => sortKeys(properties, { compare: comparator(propertiesOrder) });

const sortArtifacts = (artifacts: MavenDependency[]) =>
  artifacts.sort((a: MavenDependency, b: MavenDependency) => {
    if (a.scope === 'import' || b.scope === 'import') {
      if (a.scope === b.scope) {
        return 1;
      }
      return a.scope === 'import' ? -1 : 1;
    }
    if (a.groupId !== b.groupId) {
      if (a.groupId === undefined) {
        return -1;
      }
      if (b.groupId === undefined) {
        return 1;
      }
      const groupIdCompared = sortWithTemplate(groupIdOrder, a.groupId, b.groupId);
      if (groupIdCompared) return groupIdCompared;
    }
    return a.artifactId.localeCompare(b.artifactId);
  });

const sortProfiles = (profiles: MavenProfile[]) => profiles.sort((a, b) => a.id?.localeCompare(b.id) ?? 1);

const sortProjectLike = <P extends MavenProjectLike>(projectLike: P, options: { sortPlugins?: boolean } = {}): P => {
  const { sortPlugins = true } = options;
  projectLike = sortKeys(projectLike, { compare: comparator(rootAndProfileOrder) });
  if (projectLike.properties) {
    projectLike.properties = sortProperties(projectLike.properties);
  }
  if (Array.isArray(projectLike.dependencies?.dependency)) {
    projectLike.dependencies.dependency = sortArtifacts(projectLike.dependencies.dependency);
  }
  if (Array.isArray(projectLike.dependencyManagement?.dependencies?.dependency)) {
    projectLike.dependencyManagement.dependencies.dependency = sortArtifacts(projectLike.dependencyManagement.dependencies.dependency);
  }
  if (projectLike.build) {
    projectLike.build = sortSection(projectLike.build);

    if (sortPlugins && Array.isArray(projectLike.build.plugins?.plugin)) {
      projectLike.build.plugins.plugin = sortArtifacts(projectLike.build.plugins.plugin);
    }
    if (Array.isArray(projectLike.build.pluginManagement?.plugins?.plugin)) {
      projectLike.build.pluginManagement.plugins.plugin = sortArtifacts(projectLike.build.pluginManagement.plugins.plugin);
    }
  }
  return projectLike;
};

export const sortPomProject = <const T extends MavenProject>(project: T): T => {
  project = sortProjectLike(project);
  if (Array.isArray(project.profiles?.profile)) {
    project.profiles.profile = sortProfiles(project.profiles!.profile!.map(profile => sortProjectLike(profile, { sortPlugins: false })));
  } else if (project.profiles?.profile) {
    project.profiles.profile = sortProjectLike(project.profiles.profile, { sortPlugins: false });
  }
  return project;
};
