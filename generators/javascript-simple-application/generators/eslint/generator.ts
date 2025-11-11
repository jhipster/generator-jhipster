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
import { createNeedleCallback } from '../../../base-core/support/needles.ts';
import { JavascriptSimpleApplicationGenerator } from '../../generator.ts';

export default class EslintGenerator extends JavascriptSimpleApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:javascript-simple-application:bootstrap');
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadNodeDependencies({ application }) {
        this.loadNodeDependencies(application.nodeDependencies, {
          jiti: application.jhipsterPackageJson.devDependencies.jiti,
        });

        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('javascript-simple-application', 'resources', 'package.json'),
        );
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      source({ source }) {
        source.addEslintConfig = ({ import: importToAdd, config }) =>
          this.editFile(
            'eslint.config.ts',
            config ? createNeedleCallback({ needle: 'eslint-add-config', contentToAdd: config }) : content => content,
            importToAdd ? createNeedleCallback({ needle: 'eslint-add-import', contentToAdd: importToAdd }) : content => content,
          );
        source.addEslintIgnore = ({ ignorePattern }) =>
          source.addEslintConfig!({ config: `{ ignores: '${ignorePattern.replaceAll("'", "\\')}")},` });
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ control }) {
        await control.cleanupFiles({
          '9.0.0-alpha.0': [
            // Try to remove possibles old eslint config files
            'eslint.config.js',
            'eslint.config.mjs',
          ],
        });
      },
      async writing({ application }) {
        await this.writeFiles({
          blocks: [
            {
              templates: ['eslint.config.ts.jhi'],
            },
          ],
          context: application,
        });
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addDependencies({ application }) {
        this.packageJson.merge({
          devDependencies: {
            'eslint-config-prettier': application.nodeDependencies['eslint-config-prettier'],
            'eslint-plugin-prettier': application.nodeDependencies['eslint-plugin-prettier'],
            jiti: application.nodeDependencies.jiti,
          },
        });
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
