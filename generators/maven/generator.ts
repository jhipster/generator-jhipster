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

import assert from 'node:assert/strict';
import { passthrough } from '@yeoman/transform';
import { isFileStateModified } from 'mem-fs-editor/state';

import BaseApplicationGenerator from '../base-application/index.js';

import files from './files.js';
import { MAVEN } from './constants.js';
import cleanupOldServerFilesTask from './cleanup.js';
import { type PomStorage, createPomStorage, sortPomFile } from './support/index.js';
import type { MavenArtifact, MavenDistributionManagement, MavenPlugin, MavenProfile, MavenRepository } from './types.js';

export default class MavenGenerator extends BaseApplicationGenerator {
  pomStorage!: PomStorage;
  sortMavenPom!: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:bootstrap');
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      pomStorage() {
        this.pomStorage = createPomStorage(this, { sortFile: false });
      },
    });
  }

  get [BaseApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configure() {
        if (this.jhipsterConfigWithDefaults.buildTool !== MAVEN) {
          this.config.defaults({
            buildTool: MAVEN,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async verify({ application }) {
        assert.equal(application.buildTool, MAVEN);
      },
      addSourceNeddles({ application, source }) {
        const { javaProperties } = application;
        function createForEach<T>(callback: (arg: T) => any): (arg: T | T[]) => void {
          return (arg: T | T[]): void => {
            const argArray = Array.isArray(arg) ? arg : [arg];
            for (const item of argArray) {
              callback(item);
            }
          };
        }
        source.mergeMavenPomContent = content => this.pomStorage.merge(content);
        source.addMavenAnnotationProcessor = createForEach((artifact: MavenArtifact) => this.pomStorage.addAnnotationProcessor(artifact));
        source.addMavenDependency = createForEach((artifact: MavenArtifact) => this.pomStorage.addDependency(artifact));
        source.addMavenDependencyManagement = createForEach((artifact: MavenArtifact) => this.pomStorage.addDependencyManagement(artifact));
        source.addMavenDistributionManagement = createForEach((artifact: MavenDistributionManagement) =>
          this.pomStorage.addDistributionManagement(artifact),
        );
        source.addMavenPlugin = createForEach((plugin: MavenPlugin) => this.pomStorage.addPlugin(plugin));
        source.addMavenPluginManagement = createForEach((plugin: MavenPlugin) => this.pomStorage.addPluginManagement(plugin));
        source.addMavenPluginRepository = createForEach((repository: MavenRepository) => this.pomStorage.addPluginRepository(repository));
        source.addMavenProfile = createForEach((profile: MavenProfile) => this.pomStorage.addProfile(profile));
        source.addMavenProperty = properties => {
          properties = Array.isArray(properties) ? properties : [properties];
          for (const property of properties) {
            javaProperties![property.property] = property.value!;
            this.pomStorage.addProperty(property);
          }
        };
        source.addMavenRepository = createForEach((repository: MavenRepository) => this.pomStorage.addRepository(repository));

        source.addMavenDefinition = definition => {
          // profiles should be added first due to inProfile
          definition.profiles?.forEach(profile => this.pomStorage.addProfile(profile));
          // annotationProcessors may depend on pluginManagement
          definition.pluginManagement?.forEach(plugin => this.pomStorage.addPluginManagement(plugin));

          definition.dependencies?.forEach(dependency => this.pomStorage.addDependency(dependency));
          definition.dependencyManagement?.forEach(dependency => this.pomStorage.addDependencyManagement(dependency));
          definition.distributionManagement?.forEach(distribution => this.pomStorage.addDistributionManagement(distribution));
          definition.plugins?.forEach(plugin => this.pomStorage.addPlugin(plugin));
          definition.pluginRepositories?.forEach(repository => this.pomStorage.addPluginRepository(repository));
          if (definition.properties) {
            source.addMavenProperty!(definition.properties);
          }
          definition.repositories?.forEach(repository => this.pomStorage.addRepository(repository));
          definition.annotationProcessors?.forEach(annotation => this.pomStorage.addAnnotationProcessor(annotation));
        };
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get default() {
    return this.asDefaultTaskGroup({
      queueTranslateTransform() {
        if (this.sortMavenPom) {
          this.queueTransformStream(
            {
              name: 'sorting pom.xml file',
              filter: file => isFileStateModified(file) && file.path === this.destinationPath('pom.xml'),
              refresh: false,
            },
            passthrough(file => {
              file.contents = Buffer.from(sortPomFile(file.contents.toString()));
            }),
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupOldServerFilesTask,
      async writeFiles({ application }) {
        await this.writeFiles({ sections: files, context: application });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      sortPom() {
        this.pomStorage.save();
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
