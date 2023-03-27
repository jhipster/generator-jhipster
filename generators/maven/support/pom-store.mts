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
import { MavenDependency, MavenProfile, MavenProperty } from '../types.mjs';

const { set, get } = _;

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
    /(\n {4}<(?:groupId|repositories|pluginRepositories|properties|dependencyManagement|dependencies|build|profiles)>)/g,
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

const sortProperties = properties =>
  Object.fromEntries(
    Object.entries(properties).sort((a, b) => {
      return sortWithTemplate(propertiesOrder, a[0], b[0]);
    })
  );

const dependencyEquals = (a: MavenDependency, b: MavenDependency) => {
  return a.groupId === b.groupId && a.artifactId === b.artifactId && a.scope === b.scope && a.type === b.type;
};

const profileEquals = (a: MavenProfile, b: MavenProfile) => {
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

/*
const groupIdOrder = ['tech.jhipster', 'org.springframework.boot', 'org.springframework.security', 'org.springdoc'];

const sortDependencies = dependencies =>
  dependencies.sort((a, b) => {
    const groupIdCompared = sortWithTemplate(groupIdOrder, a.groupId, b.groupId);
    if (groupIdCompared) return groupIdCompared;
    return a.artifactId.localeCompare(b.artifactId);
  });
*/

export default class PomStorage extends XmlStorage {
  constructor({ saveFile, loadFile }: { saveFile: (string) => void; loadFile: () => string }) {
    super({ saveFile, loadFile });
  }

  public addProperty({ property, value }: MavenProperty) {
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

  public addProfile(profile: MavenProfile): void {
    this.addProfileAt('project', profile);
    this.persist();
  }

  protected addDependencyAt(nodePath: string, { additionalContent, ...dependency }: MavenDependency) {
    const dependencyPath = `${nodePath}.dependencies.dependency`;
    const dependencyArray = ensureChildIsArray(this.store, dependencyPath);
    appendOrReplace(dependencyArray, this.mergeContent(dependency, additionalContent), dependencyEquals);
  }

  protected addProfileAt(nodePath: string, { content, ...profile }: MavenProfile): void {
    const profilePath = `${nodePath}.profiles.profile`;
    const profileArray = ensureChildIsArray(this.store, profilePath);
    appendOrReplace(profileArray, this.mergeContent(profile, content), profileEquals);
  }

  protected sort() {
    const project = this.store.project;
    if (project) {
      if (project.properties) {
        project.properties = sortProperties(project.properties);
      }
      /*
      if (project.dependencies) {
        project.dependencies.dependency = sortDependencies(project.dependencies.dependency);
      }
      */
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
