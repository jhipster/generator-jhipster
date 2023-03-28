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

import _ from 'lodash';

import CoreGenerator from '../../base-core/index.mjs';
import XmlStorage from '../internal/xml-store.mjs';
import {
  MavenArtifact,
  MavenDependency,
  MavenDistributionManagement,
  MavenPlugin,
  MavenProfile,
  MavenProperty,
  MavenRepository,
} from '../types.mjs';

const { set, get } = _;

const rootOrder = [
  'modelVersion',
  'groupId',
  'artifactId',
  'version',
  'name',
  'description',
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

const formatFirstXmlLevel = content =>
  content.replace(
    /(\n {4}<(?:groupId|distributionManagement|repositories|pluginRepositories|properties|dependencyManagement|dependencies|build|profiles)>)/g,
    '\n$1'
  );

const isComment = name => name.startsWith('#');

const toMaxInt = nr => (nr === -1 ? Number.MAX_SAFE_INTEGER : nr);

const sortWithTemplate = (template: string[], a: string, b: string) => {
  if (isComment(a)) return -1;
  if (isComment(b)) return 1;
  const indexOfA = toMaxInt(template.findIndex(item => item === a));
  const indexOfB = toMaxInt(template.findIndex(item => item === b));
  if (indexOfA === indexOfB) {
    return a.localeCompare(b);
  }
  return indexOfA - indexOfB;
};

const sortObject = (order, obj) =>
  Object.fromEntries(
    Object.entries(obj).sort((a, b) => {
      return sortWithTemplate(order, a[0], b[0]);
    })
  );

const sortProperties = properties => sortObject(propertiesOrder, properties);

const artifactEquals = (a: MavenArtifact, b: MavenArtifact) => {
  return a.groupId === b.groupId && a.artifactId === b.artifactId;
};

const dependencyEquals = (a: MavenDependency, b: MavenDependency) => {
  return artifactEquals(a, b) && a.scope === b.scope && a.type === b.type;
};

const profileEquals = (a: MavenProfile, b: MavenProfile) => {
  return a.id === b.id;
};

const repositoryEquals = (a: MavenRepository, b: MavenRepository) => {
  return a.id === b.id;
};

const ensureChildIsArray = (node, childPath) => {
  let dependencyArray = get(node, childPath);
  if (!dependencyArray) {
    dependencyArray = [];
    set(node, childPath, dependencyArray);
  } else if (!Array.isArray(dependencyArray)) {
    // Convert to array
    dependencyArray = [dependencyArray];
    set(node, childPath, dependencyArray);
  }
  return dependencyArray;
};

function appendOrReplace<T>(array: T[], item: T, equals: (a: T, b: T) => boolean) {
  const dependencyIndex = array.findIndex(existing => equals(existing, item));
  if (dependencyIndex === -1) {
    array.push(item);
  } else {
    array[dependencyIndex] = item;
  }
}

function appendOrGet<T>(array: T[], item: T, equals: (a: T, b: T) => boolean) {
  const child = array.find(existing => equals(existing, item));
  if (child) {
    return child;
  }
  array.push(item);
  return item;
}

const groupIdOrder = ['tech.jhipster', 'org.springframework.boot', 'org.springframework.security', 'org.springdoc'];

const sortArtifacts = (artifacts: MavenArtifact[]) =>
  artifacts.sort((a, b) => {
    const groupIdCompared = sortWithTemplate(groupIdOrder, a.groupId, b.groupId);
    if (groupIdCompared) return groupIdCompared;
    return a.artifactId.localeCompare(b.artifactId);
  });

const sortProfiles = (profiles: MavenProfile[]) => profiles.sort((a, b) => a.id.localeCompare(b.id));

const ensureChildPath = (node: any, childPath) => {
  let child = get(node, childPath);
  if (child) return child;
  child = {};
  set(node, childPath, child);
  return child;
};

const ensureChild = (current: any, ...childPath) => {
  for (const node of childPath) {
    if (typeof node === 'string') {
      current = ensureChildPath(current, node);
    } else if (typeof node === 'function') {
      current = node(current);
    } else {
      throw new Error(`Path section not supported ${node}`);
    }
    if (!current) {
      return undefined;
    }
  }
  return current;
};

export default class PomStorage extends XmlStorage {
  constructor({ saveFile, loadFile }: { saveFile: (string) => void; loadFile: () => string }) {
    super({ saveFile, loadFile });
  }

  public addProperty({ property, value = null }: MavenProperty) {
    this.merge({
      project: {
        properties: {
          [property]: value,
        },
      },
    });
    this.persist();
  }

  public addDependency(dependecy: MavenDependency): void {
    this.addDependencyAt('project', dependecy);
    this.persist();
  }

  public addDependencyManagement(dependecy: MavenDependency): void {
    this.addDependencyAt('project.dependencyManagement', dependecy);
    this.persist();
  }

  public addDistributionManagement({ snapshotsId, snapshotsUrl, releasesId, releasesUrl }: MavenDistributionManagement) {
    this.store.project.distributionManagement = {
      snapshotRepository: {
        id: snapshotsId,
        url: snapshotsUrl,
      },
      repository: {
        id: releasesId,
        url: releasesUrl,
      },
    };
    this.persist();
  }

  public addProfile(profile: MavenProfile): void {
    this.addProfileAt('project', profile);
    this.persist();
  }

  public addPlugin(plugin: MavenPlugin): void {
    this.addPluginAt('project.build', plugin);
    this.persist();
  }

  public addPluginManagement(plugin: MavenPlugin): void {
    this.addPluginAt('project.build.pluginManagement', plugin);
    this.persist();
  }

  public addRepository(repository: MavenRepository): void {
    this.addRepositoryAt('project', repository);
    this.persist();
  }

  public addPluginRepository(repository: MavenRepository): void {
    this.addPluginRepositoryAt('project', repository);
    this.persist();
  }

  public addAnnotationProcessor(artifact: MavenArtifact) {
    const plugins = ensureChildIsArray(this.store, 'project.build.pluginManagement.plugins.plugin');
    const annotationProcessorPaths = ensureChild(
      plugins,
      pluginArray => {
        return appendOrGet(
          pluginArray,
          {
            groupId: 'org.apache.maven.plugins',
            artifactId: 'maven-compiler-plugin',
          },
          artifactEquals
        );
      },
      'configuration.annotationProcessorPaths'
    );
    const paths = ensureChildIsArray(annotationProcessorPaths, 'path');
    appendOrReplace(paths, artifact, artifactEquals);
    this.persist();
  }

  protected addDependencyAt(nodePath: string, { additionalContent, ...dependency }: MavenDependency) {
    const dependencyPath = `${nodePath}.dependencies.dependency`;
    const dependencyArray = ensureChildIsArray(this.store, dependencyPath);
    appendOrReplace(dependencyArray, this.mergeContent(dependency, additionalContent), dependencyEquals);
  }

  protected addPluginAt(nodePath: string, { additionalContent, ...artifact }: MavenPlugin) {
    const artifactPath = `${nodePath}.plugins.plugin`;
    const artifactArray = ensureChildIsArray(this.store, artifactPath);
    appendOrReplace(artifactArray, this.mergeContent(artifact, additionalContent), artifactEquals);
  }

  protected addProfileAt(nodePath: string, { content, ...profile }: MavenProfile): void {
    const profilePath = `${nodePath}.profiles.profile`;
    const profileArray = ensureChildIsArray(this.store, profilePath);
    appendOrReplace(profileArray, this.mergeContent(profile, content), profileEquals);
  }

  protected addRepositoryAt(nodePath: string, repository: MavenRepository): void {
    const repositoryPath = `${nodePath}.repositories.repository`;
    const repositoryArray = ensureChildIsArray(this.store, repositoryPath);
    appendOrReplace(repositoryArray, repository, repositoryEquals);
  }

  protected addPluginRepositoryAt(nodePath: string, repository: MavenRepository): void {
    const repositoryPath = `${nodePath}.pluginRepositories.pluginRepository`;
    const repositoryArray = ensureChildIsArray(this.store, repositoryPath);
    appendOrReplace(repositoryArray, repository, repositoryEquals);
  }

  protected sort() {
    const project = this.store.project;
    if (project) {
      this.store.project = sortObject(rootOrder, project);
      if (project.properties) {
        project.properties = sortProperties(project.properties);
      }
      if (Array.isArray(project.dependencies?.dependency)) {
        project.dependencies.dependency = sortArtifacts(project.dependencies.dependency);
      }
      if (Array.isArray(project.dependencyManagement?.dependencies?.dependency)) {
        project.dependencyManagement.dependencies.dependency = sortArtifacts(project.dependencyManagement.dependencies.dependency);
      }
      if (Array.isArray(project.build?.plugins?.plugin)) {
        project.build.plugins.plugin = sortArtifacts(project.build.plugins.plugin);
      }
      if (Array.isArray(project.build?.pluginManagement?.plugins?.plugin)) {
        project.build.pluginManagement.plugins.plugin = sortArtifacts(project.build.pluginManagement.plugins.plugin);
      }
      if (Array.isArray(project.profiles?.profile)) {
        project.profiles.profile = sortProfiles(project.profiles.profile);
      }
    }
  }
}

const emptyPomFile = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
</project>
`;

export const createPomStorage = (generator: CoreGenerator) => {
  const pomStorage = new PomStorage({
    loadFile: () =>
      generator.readDestination('pom.xml', {
        defaults: emptyPomFile,
      }),
    saveFile: content => generator.writeDestination('pom.xml', formatFirstXmlLevel(content)),
  });
  (generator.fs as any).store.on('change', filename => {
    if (filename === generator.destinationPath('pom.xml')) {
      pomStorage.clearCache();
    }
  });
  return pomStorage;
};
