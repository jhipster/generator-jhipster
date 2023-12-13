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

import * as _ from 'lodash-es';
import sortKeys from 'sort-keys';

import CoreGenerator from '../../base-core/index.js';
import XmlStorage from '../internal/xml-store.js';
import {
  MavenAnnotationProcessor,
  MavenArtifact,
  MavenDependency,
  MavenDistributionManagement,
  MavenPlugin,
  MavenProfile,
  MavenProperty,
  MavenRepository,
} from '../types.js';

const { set, get } = _;

const rootOrder = [
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

const formatFirstXmlLevel = content =>
  content.replace(
    /(\n {4}<(?:groupId|distributionManagement|repositories|pluginRepositories|properties|dependencyManagement|dependencies|build|profiles)>)/g,
    '\n$1',
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

const comparator = (order: string[]) => (a: string, b: string) => sortWithTemplate(order, a, b);

const sortProperties = properties => sortKeys(properties, { compare: comparator(propertiesOrder) });

const artifactEquals = (a: MavenArtifact, b: MavenArtifact) => {
  return a.groupId === b.groupId && a.artifactId === b.artifactId;
};

const dependencyEquals = (a: MavenDependency, b: MavenDependency) => {
  return artifactEquals(a, b) && a.scope === b.scope && a.type === b.type;
};

const idEquals = (a: { id: string }, b: { id: string }) => {
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

const ensureProfile = (project, profileId: string) => {
  const profileArray = ensureChildIsArray(project, 'profiles.profile');
  return appendOrGet(profileArray, { id: profileId }, idEquals);
};

const groupIdOrder = ['tech.jhipster', 'org.springframework.boot', 'org.springframework.security', 'org.springdoc'];

const sortArtifacts = (artifacts: MavenArtifact[]) =>
  artifacts.sort((a: MavenArtifact, b: MavenArtifact) => {
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

  public addProperty({ inProfile, property, value = null }: MavenProperty) {
    const node = this.getNode({ nodePath: 'properties', profile: inProfile });
    node[property] = value;
    this.persist();
  }

  public addDependency({ inProfile, ...dependency }: MavenDependency): void {
    this.addDependencyAt(this.getNode({ profile: inProfile }), dependency);
    this.persist();
  }

  public addDependencyManagement({ inProfile, ...dependency }: MavenDependency): void {
    this.addDependencyAt(this.getNode({ profile: inProfile, nodePath: 'dependencyManagement' }), dependency);
    this.persist();
  }

  public addDistributionManagement({ inProfile, snapshotsId, snapshotsUrl, releasesId, releasesUrl }: MavenDistributionManagement) {
    const store = this.getNode({ profile: inProfile });
    store.distributionManagement = {
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

  public addProfile({ content, ...profile }: MavenProfile): void {
    const profileArray = ensureChildIsArray(this.getNode(), 'profiles.profile');
    appendOrReplace(profileArray, this.mergeContent(profile, content), idEquals);
    this.persist();
  }

  public addPlugin({ inProfile, ...plugin }: MavenPlugin): void {
    this.addPluginAt(this.getNode({ profile: inProfile, nodePath: 'build' }), plugin);
    this.persist();
  }

  public addPluginManagement({ inProfile, ...plugin }: MavenPlugin): void {
    this.addPluginAt(this.getNode({ profile: inProfile, nodePath: 'build.pluginManagement' }), plugin);
    this.persist();
  }

  public addRepository({ inProfile, ...repository }: MavenRepository): void {
    this.addRepositoryAt(this.getNode({ profile: inProfile }), repository);
    this.persist();
  }

  public addPluginRepository({ inProfile, ...repository }: MavenRepository): void {
    this.addPluginRepositoryAt(this.getNode({ profile: inProfile }), repository);
    this.persist();
  }

  public addAnnotationProcessor({ inProfile, ...artifact }: MavenAnnotationProcessor) {
    const node = this.getNode({ profile: inProfile });
    const plugins = ensureChildIsArray(node, 'build.pluginManagement.plugins.plugin');
    const annotationProcessorPaths = ensureChild(
      plugins,
      pluginArray => {
        return appendOrGet(
          pluginArray,
          {
            groupId: 'org.apache.maven.plugins',
            artifactId: 'maven-compiler-plugin',
          },
          artifactEquals,
        );
      },
      'configuration.annotationProcessorPaths',
    );
    const paths = ensureChildIsArray(annotationProcessorPaths, 'path');
    appendOrReplace(paths, artifact, artifactEquals);
    this.persist();
  }

  protected getNode({ profile, nodePath }: { profile?: string; nodePath?: string } = {}): any {
    const node = profile ? ensureProfile(this.store.project, profile) : this.store.project;
    if (nodePath) {
      return ensureChild(node, nodePath);
    }
    return node;
  }

  protected addDependencyAt(node, { additionalContent, ...dependency }: MavenDependency) {
    const dependencyArray = ensureChildIsArray(node, 'dependencies.dependency');
    appendOrReplace(dependencyArray, this.mergeContent(dependency, additionalContent), dependencyEquals);
  }

  protected addPluginAt(node, { additionalContent, ...artifact }: MavenPlugin) {
    const artifactArray = ensureChildIsArray(node, 'plugins.plugin');
    appendOrReplace(artifactArray, this.mergeContent(artifact, additionalContent), artifactEquals);
  }

  protected addRepositoryAt(node, { releasesEnabled, snapshotsEnabled, ...repository }: MavenRepository): void {
    const releases = releasesEnabled === undefined ? undefined : { enabled: releasesEnabled };
    const snapshots = snapshotsEnabled === undefined ? undefined : { enabled: snapshotsEnabled };
    const repositoryArray = ensureChildIsArray(node, 'repositories.repository');
    appendOrReplace(repositoryArray, { ...repository, releases, snapshots }, idEquals);
  }

  protected addPluginRepositoryAt(node, { releasesEnabled, snapshotsEnabled, ...repository }: MavenRepository): void {
    const releases = releasesEnabled === undefined ? undefined : { enabled: releasesEnabled };
    const snapshots = snapshotsEnabled === undefined ? undefined : { enabled: snapshotsEnabled };
    const repositoryArray = ensureChildIsArray(node, 'pluginRepositories.pluginRepository');
    appendOrReplace(repositoryArray, { ...repository, releases, snapshots }, idEquals);
  }

  protected sort() {
    if (this.store.project) {
      const project = sortKeys(this.store.project, { compare: comparator(rootOrder) });
      this.store.project = project;
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
  const loadFile = () => generator.readDestination('pom.xml', { defaults: emptyPomFile })?.toString() ?? '';
  const pomStorage = new PomStorage({
    loadFile,
    saveFile: content => generator.writeDestination('pom.xml', formatFirstXmlLevel(content)),
  });
  generator.fs.store.on('change', filename => {
    if (filename === generator.destinationPath('pom.xml')) {
      pomStorage.clearCache();
    }
  });
  return pomStorage;
};
