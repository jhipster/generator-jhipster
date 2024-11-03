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
import { packageJson } from '../../../../lib/index.js';
import BaseApplicationGenerator from '../../../base-application/index.js';
import { GENERATOR_PROJECT_NAME } from '../../../generator-list.js';

export default class BootstrapGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadNodeDependencies({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('javascript', 'resources', 'package.json'),
        );
      },
      jsExtensions({ applicationDefaults, application }) {
        applicationDefaults({
          cjsExtension: application.packageJsonTypeCommonjs ? '.js' : '.cjs',
          mjsExtension: application.packageJsonTypeCommonjs ? '.js' : '.mjs',
        });
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      addSource({ application, source }) {
        source.mergeClientPackageJson = args => {
          this.mergeDestinationJson(`${application.clientRootDir}package.json`, args);
        };
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [{ templates: [{ override: false, file: 'package.json' }] }],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      mergePackageJson({ application, source }) {
        const {
          packageJsonNodeEngine,
          packageJsonType,
          dasherizedBaseName,
          projectDescription,
          packageJsonScripts,
          clientPackageJsonScripts,
        } = application;

        this.packageJson.merge({ scripts: packageJsonScripts! });

        this.packageJson.defaults({
          name: dasherizedBaseName,
          version: '0.0.0',
          description: projectDescription,
          license: 'UNLICENSED',
        });

        if (packageJsonType === 'module') {
          this.packageJson.merge({ type: packageJsonType });
        }

        if (packageJsonNodeEngine) {
          const packageJsonEngines: any = this.packageJson.get('engines') ?? {};
          this.packageJson.set('engines', {
            ...packageJsonEngines,
            node: typeof packageJsonNodeEngine === 'string' ? packageJsonNodeEngine : packageJson.engines.node,
          });
        }

        if (Object.keys(clientPackageJsonScripts).length > 0) {
          source.mergeClientPackageJson!({ scripts: clientPackageJsonScripts });
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
