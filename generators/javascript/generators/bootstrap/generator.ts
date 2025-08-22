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
import { CLIENT_MAIN_SRC_DIR } from '../../../generator-constants.js';
import { JavascriptSimpleApplicationGenerator } from '../../generator.ts';

export default class JavascriptBootstrapGenerator extends JavascriptSimpleApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('base-application');
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
          mjsExtension: application.packageJsonTypeModule ? '.js' : '.mjs',

          clientRootDir: '',
          clientSrcDir: ({ clientRootDir }) => `${clientRootDir}${clientRootDir ? 'src/' : CLIENT_MAIN_SRC_DIR}`,
        });
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.LOADING]() {
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

  get [JavascriptSimpleApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }
}
