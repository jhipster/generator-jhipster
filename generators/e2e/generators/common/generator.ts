/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import BaseApplicationGenerator from '../../../base-application/index.ts';
import type { Application as E2eApplication, Entity as E2eEntity } from '../../types.ts';

/**
 * What the e2e test frameworks, cypress and playwright, have in common: the scripts of the root package.json running the
 * application and the e2e tests together, and their dependencies. The scripts of a framework, `e2e` and `e2e:headless`
 * among them, are its own.
 */
export default class E2eCommonGenerator extends BaseApplicationGenerator<E2eEntity, E2eApplication> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('e2e');
      await this.dependsOnJHipster('javascript-simple-application');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      loadPackageJson({ application }) {
        // The versions of concurrently and wait-on, which the common generator declares.
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('common', 'resources', 'package.json'),
        );
      },
      npmScripts({ application }) {
        Object.assign(application.packageJsonScripts, {
          'ci:e2e:dev': 'concurrently -k -s first -n application,e2e -c red,blue npm:app:start npm:e2e:headless',
          'e2e:dev': 'concurrently -k -s first -n application,e2e -c red,blue npm:app:start npm:e2e',
          'pree2e:headless': 'npm run ci:server:await --if-present',
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get postPreparing() {
    return this.asPostPreparingTaskGroup({
      clientWorkspaceScripts({ application }) {
        if (application.clientRootDir) {
          // The e2e tests run from the client workspace.
          application.packageJsonScripts['e2e:headless'] = `${application.clientNpmRun} e2e:headless`;
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.postPreparing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      packageJson({ application }) {
        // The e2e scripts run the application and the e2e tests together, and wait for the server.
        this.packageJson.merge({
          devDependencies: {
            concurrently: application.nodeDependencies.concurrently,
            'wait-on': application.nodeDependencies['wait-on'],
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
