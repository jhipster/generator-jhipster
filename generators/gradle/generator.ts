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

import assert from 'assert/strict';

import BaseApplicationGenerator from '../base-application/index.ts';

import { GRADLE_BUILD_SRC_DIR } from '../generator-constants.js';
import { mutateData } from '../../lib/utils/index.ts';
import { QUEUES } from '../base-core/priorities.ts';
import files from './files.ts';
import { GRADLE } from './constants.ts';
import cleanupOldServerFilesTask from './cleanup.ts';
import {
  addGradleDependenciesCallback,
  addGradleDependenciesCatalogVersionCallback,
  addGradleDependencyCatalogLibrariesCallback,
  addGradleDependencyCatalogPluginsCallback,
  addGradleMavenRepositoryCallback,
  addGradlePluginCallback,
  addGradlePluginFromCatalogCallback,
  addGradlePluginManagementCallback,
  addGradlePropertyCallback,
  applyFromGradleCallback,
  gradleNeedleOptionsWithDefaults,
  sortDependencies,
} from './internal/needles.ts';
import type {
  Application as GradleApplication,
  Config as GradleConfig,
  GradleDependency,
  Entity as GradleEntity,
  Options as GradleOptions,
  Source as GradleSource,
} from './types.js';

const { PRE_CONFLICTS_QUEUE } = QUEUES;

export default class GradleGenerator extends BaseApplicationGenerator<
  GradleEntity,
  GradleApplication<GradleEntity>,
  GradleConfig,
  GradleOptions,
  GradleSource
> {
  gradleVersionFromWrapper: string | undefined;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:bootstrap');
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configure() {
        if (this.jhipsterConfigWithDefaults.buildTool !== GRADLE) {
          this.config.defaults({
            buildTool: GRADLE,
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadGradleVersion({ application }) {
        const propFile = this.readTemplate(this.jhipsterTemplatePath('gradle/wrapper/gradle-wrapper.properties'));
        this.gradleVersionFromWrapper = propFile?.toString().match(/gradle-(\d+\.\d+(?:\.\d+)?)-/)?.[1];
        if (!this.gradleVersionFromWrapper) {
          throw new Error('Could not determine Gradle version from gradle-wrapper.properties');
        }
        mutateData(application, {
          gradleVersion: this.useVersionPlaceholders ? 'GRADLE_VERSION' : this.gradleVersionFromWrapper,
        });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async verify({ application }) {
        assert.equal(application.buildTool, GRADLE);
      },
      prepareConventionsPlugins({ applicationDefaults }) {
        applicationDefaults({
          __override__: false,
          gradleBuildSrc: GRADLE_BUILD_SRC_DIR,
          gradleDevelocityHost: ({ gradleDevelocityHost }) =>
            !gradleDevelocityHost || gradleDevelocityHost.startsWith('https://') ? gradleDevelocityHost : `https://${gradleDevelocityHost}`,
        });
      },
      addSourceNeddles({ application, source }) {
        const { gradleBuildSrc } = application;
        source.applyFromGradle = script => this.editFile('build.gradle', applyFromGradleCallback(script));
        source.addGradleDependencies = (dependencies, options = {}) => {
          const { gradleFile } = gradleNeedleOptionsWithDefaults(options);
          if (gradleFile === 'build.gradle') {
            source._gradleDependencies = source._gradleDependencies ?? [];
            source._gradleDependencies.push(...dependencies);
            this.queueTask({
              method: () => {
                this.editFile(gradleFile, addGradleDependenciesCallback((source as any)._gradleDependencies.sort(sortDependencies)));
                (source as any)._gradleDependencies = [];
              },
              taskName: '_persiteGradleDependencies',
              once: true,
              queueName: PRE_CONFLICTS_QUEUE,
            });
            return;
          }
          dependencies = [...dependencies].sort(sortDependencies);
          this.editFile(gradleFile, addGradleDependenciesCallback(dependencies));
        };
        source.addGradleDependency = (dependency, options) => source.addGradleDependencies!([dependency], options);
        source.addGradlePlugin = plugin => this.editFile('build.gradle', addGradlePluginCallback(plugin));
        source.addGradleMavenRepository = repository => this.editFile('build.gradle', addGradleMavenRepositoryCallback(repository));
        source.addGradlePluginManagement = plugin => this.editFile('settings.gradle', addGradlePluginManagementCallback(plugin));
        source.addGradleProperty = property => {
          application.javaProperties![property.property] = property.value!;
          this.editFile('gradle.properties', addGradlePropertyCallback(property));
        };
        source.addGradleDependencyCatalogVersions = (versions, { gradleVersionCatalogFile = 'gradle/libs.versions.toml' } = {}) =>
          this.editFile(gradleVersionCatalogFile, addGradleDependenciesCatalogVersionCallback(versions));
        source.addGradleDependencyCatalogVersion = (version, options) => source.addGradleDependencyCatalogVersions!([version], options);
        source.addGradleDependencyCatalogLibraries = (libs, options = {}) => {
          const { gradleFile, gradleVersionCatalogFile } = gradleNeedleOptionsWithDefaults(options);
          libs = [...libs].sort((a, b) => a.libraryName.localeCompare(b.libraryName));
          this.editFile(gradleVersionCatalogFile, addGradleDependencyCatalogLibrariesCallback(libs));
          source.addGradleDependencies!(libs.filter(lib => lib.scope) as GradleDependency[], { gradleFile });
        };
        source.addGradleDependencyCatalogLibrary = (lib, options) => source.addGradleDependencyCatalogLibraries!([lib], options);
        source.addGradleDependencyCatalogPlugins = plugins => {
          this.editFile('gradle/libs.versions.toml', addGradleDependencyCatalogPluginsCallback(plugins));
          this.editFile('build.gradle', addGradlePluginFromCatalogCallback(plugins));
        };
        source.addGradleDependencyCatalogPlugin = plugin => source.addGradleDependencyCatalogPlugins!([plugin]);

        source.addGradleBuildSrcDependency = dependency =>
          source.addGradleDependencies!([dependency], { gradleFile: `${gradleBuildSrc}/build.gradle` });
        source.addGradleBuildSrcDependencyCatalogVersion = version =>
          source.addGradleDependencyCatalogVersions!([version], {
            gradleVersionCatalogFile: `${gradleBuildSrc}/gradle/libs.versions.toml`,
          });
        source.addGradleBuildSrcDependencyCatalogVersions = versions => source.addGradleDependencyCatalogVersions!(versions);
        source.addGradleBuildSrcDependencyCatalogLibraries = libs =>
          source.addGradleDependencyCatalogLibraries!(libs, {
            gradleFile: `${gradleBuildSrc}/build.gradle`,
            gradleVersionCatalogFile: `${gradleBuildSrc}/gradle/libs.versions.toml`,
          });
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
      updateGradleVersion({ application }) {
        const { gradleVersion } = application;
        if (gradleVersion !== this.gradleVersionFromWrapper) {
          this.editFile('gradle/wrapper/gradle-wrapper.properties', content =>
            content.replace(`-${this.gradleVersionFromWrapper!}-`, `-${gradleVersion!}-`),
          );
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
