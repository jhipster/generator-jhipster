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

import { get, set } from 'lodash-es';

import type CoreGenerator from '../../base-core/index.js';
import XmlStorage from '../internal/xml-store.js';
import type {
  MavenAnnotationProcessor,
  MavenArtifact,
  MavenDependency,
  MavenDistributionManagement,
  MavenPlugin,
  MavenPomRepository,
  MavenProfile,
  MavenProperty,
  MavenRepository,
} from '../types.js';
import { formatPomFirstLevel, sortPomProject, type MavenProjectLike } from '../internal/pom-sort.js';

const artifactEquals = (a: MavenArtifact, b: MavenArtifact) => a.groupId === b.groupId && a.artifactId === b.artifactId;

const dependencyEquals = (a: MavenDependency, b: MavenDependency) => artifactEquals(a, b) && a.scope === b.scope && a.type === b.type;

const idEquals = (a: { id: string }, b: { id: string }) => a.id === b.id;

const ensureChildIsArray = (node: Record<string, any>, childPath: string): any[] => {
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

const ensureProfile = (project: Record<string, any>, profileId: string) => {
  const profileArray = ensureChildIsArray(project, 'profiles.profile');
  return appendOrGet(profileArray, { id: profileId }, idEquals);
};

const ensureChildPath = (node: Record<string, any>, childPath: string): Record<string, any> => {
  let child = get(node, childPath);
  if (child) return child;
  child = {};
  set(node, childPath, child);
  return child;
};

const ensureChild = (current: Record<string, any>, ...childPath: (string | ((node: any) => Record<string, any>))[]) => {
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

const reorderArtifact = <Artifact extends MavenArtifact = MavenArtifact>({
  groupId,
  artifactId,
  inProfile,
  version,
  ...rest
}: Artifact): Artifact => ({ inProfile, groupId, artifactId, version, ...rest }) as Artifact;

const reorderDependency = <Dependency extends MavenDependency = MavenDependency>({
  groupId,
  artifactId,
  inProfile,
  version,
  type,
  scope,
  classifier,
  ...rest
}: Dependency): Dependency => ({ inProfile, groupId, artifactId, version, type, scope, classifier, ...rest }) as Dependency;

export default class PomStorage extends XmlStorage {
  constructor({ saveFile, loadFile, sortFile }: { saveFile: (content: string) => void; loadFile: () => string; sortFile?: boolean }) {
    super({ saveFile, loadFile, sortFile });
  }

  public addProperty({ inProfile, property, value = null }: MavenProperty) {
    const node = this.getNode({ nodePath: 'properties', profile: inProfile });
    node[property] = value;
    this.persist();
  }

  public addDependency({ inProfile, ...dependency }: MavenDependency): void {
    this.addDependencyAt(this.getNode({ profile: inProfile }), reorderDependency(dependency));
    this.persist();
  }

  public addDependencyManagement({ inProfile, ...dependency }: MavenDependency): void {
    this.addDependencyAt(this.getNode({ profile: inProfile, nodePath: 'dependencyManagement' }), reorderDependency(dependency));
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
    const paths = ensureChildIsArray(annotationProcessorPaths!, 'path');
    appendOrReplace(paths, reorderArtifact(artifact), artifactEquals);
    this.persist();
  }

  protected getNode({ profile, nodePath }: { profile?: string; nodePath?: string } = {}): any {
    const node = profile ? ensureProfile(this.store.project, profile) : this.store.project;
    if (nodePath) {
      return ensureChild(node, nodePath);
    }
    return node;
  }

  protected addDependencyAt(node: MavenProjectLike, { additionalContent, ...dependency }: MavenDependency) {
    const dependencyArray = ensureChildIsArray(node, 'dependencies.dependency');
    appendOrReplace(dependencyArray, this.mergeContent(reorderDependency(dependency), additionalContent), dependencyEquals);
  }

  protected addPluginAt(node: MavenProjectLike, { additionalContent, ...artifact }: MavenPlugin) {
    const artifactArray = ensureChildIsArray(node, 'plugins.plugin');
    appendOrReplace(artifactArray, this.mergeContent(reorderArtifact(artifact), additionalContent), artifactEquals);
  }

  protected addRepositoryAt(node: MavenProjectLike, { releasesEnabled, snapshotsEnabled, ...repository }: MavenRepository): void {
    const releases = releasesEnabled === undefined ? undefined : { enabled: releasesEnabled };
    const snapshots = snapshotsEnabled === undefined ? undefined : { enabled: snapshotsEnabled };
    const repositoryArray = ensureChildIsArray(node, 'repositories.repository');
    appendOrReplace<MavenPomRepository>(repositoryArray, { ...repository, releases, snapshots }, idEquals);
  }

  protected addPluginRepositoryAt(node: MavenProjectLike, { releasesEnabled, snapshotsEnabled, ...repository }: MavenRepository): void {
    const releases = releasesEnabled === undefined ? undefined : { enabled: releasesEnabled };
    const snapshots = snapshotsEnabled === undefined ? undefined : { enabled: snapshotsEnabled };
    const repositoryArray = ensureChildIsArray(node, 'pluginRepositories.pluginRepository');
    appendOrReplace<MavenPomRepository>(repositoryArray, { ...repository, releases, snapshots }, idEquals);
  }

  protected sort() {
    if (this.store.project) {
      this.store.project = sortPomProject(this.store.project);
    }
  }
}

const emptyPomFile = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
</project>
`;

export const createPomStorage = (generator: CoreGenerator, { sortFile }: { sortFile?: boolean } = {}) => {
  const loadFile = () => generator.readDestination('pom.xml', { defaults: emptyPomFile })?.toString() ?? '';
  const pomStorage = new PomStorage({
    loadFile,
    saveFile: content => generator.writeDestination('pom.xml', formatPomFirstLevel(content)),
    sortFile,
  });
  generator.fs.store.on('change', filename => {
    if (filename === generator.destinationPath('pom.xml')) {
      pomStorage.clearCache();
    }
  });
  return pomStorage;
};
