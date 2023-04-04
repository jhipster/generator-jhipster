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
/* eslint-disable consistent-return */
import assert from 'assert/strict';

import BaseApplicationGenerator from '../base-application/index.mjs';

import { GENERATOR_MAVEN, GENERATOR_BOOTSTRAP_APPLICATION_SERVER } from '../generator-list.mjs';
import files from './files.mjs';
import { MAVEN } from './constants.mjs';
import cleanupOldServerFilesTask from './cleanup.mjs';
import { type GeneratorDefinition as SpringBootGeneratorDefinition } from '../server/index.mjs';
import { createPomStorage, type PomStorage } from './support/index.mjs';

export default class MavenGenerator extends BaseApplicationGenerator<SpringBootGeneratorDefinition> {
  pomStorage!: PomStorage;

  constructor(args, options, features) {
    super(args, options, features);

    if (this.options.help) return;

    this.config.defaults({
      buildTool: MAVEN,
    });
  }

  async beforeQueue() {
    this.pomStorage = createPomStorage(this);

    if (!this.fromBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
      await this.composeWithBlueprints(GENERATOR_MAVEN);
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async verify({ application }) {
        assert.equal(application.buildTool, MAVEN);
      },
      addSourceNeddles({ source }) {
        function createForEach<T>(callback: (arg: T) => any): (arg: T | T[]) => void {
          return (arg: T | T[]): void => {
            const argArray = Array.isArray(arg) ? arg : [arg];
            for (const item of argArray) {
              callback(item);
            }
          };
        }
        source.addMavenAnnotationProcessor = createForEach(artifact => this.pomStorage.addAnnotationProcessor(artifact));
        source.addMavenDependency = createForEach(artifact => this.pomStorage.addDependency(artifact));
        source.addMavenDependencyManagement = createForEach(artifact => this.pomStorage.addDependencyManagement(artifact));
        source.addMavenDistributionManagement = createForEach(artifact => this.pomStorage.addDistributionManagement(artifact));
        source.addMavenPlugin = createForEach(plugin => this.pomStorage.addPlugin(plugin));
        source.addMavenPluginManagement = createForEach(plugin => this.pomStorage.addPluginManagement(plugin));
        source.addMavenPluginRepository = createForEach(repository => this.pomStorage.addPluginRepository(repository));
        source.addMavenProfile = createForEach(profile => this.pomStorage.addProfile(profile));
        source.addMavenProperty = createForEach(property => this.pomStorage.addProperty(property));
        source.addMavenRepository = createForEach(repository => this.pomStorage.addRepository(repository));
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
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
