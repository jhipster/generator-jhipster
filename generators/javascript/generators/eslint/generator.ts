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
import BaseApplicationGenerator from '../../../base-application/index.js';
import { createNeedleCallback } from '../../../base-core/support/needles.ts';

export default class EslintGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:javascript:bootstrap');
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
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      source({ application, source }) {
        application.eslintConfigFile = `eslint.config.${application.packageJsonType === 'module' ? 'js' : 'mjs'}`;
        source.addEslintConfig = ({ import: importToAdd, config }) =>
          this.editFile(
            application.eslintConfigFile!,
            config ? createNeedleCallback({ needle: 'eslint-add-config', contentToAdd: config }) : content => content,
            importToAdd ? createNeedleCallback({ needle: 'eslint-add-import', contentToAdd: importToAdd }) : content => content,
          );
        source.addEslintIgnore = ({ ignorePattern }) =>
          source.addEslintConfig!({ config: `{ ignores: '${ignorePattern.replaceAll("'", "\\')}")},` });
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
          blocks: [
            {
              templates: [{ sourceFile: 'eslint.config.js.jhi', destinationFile: ctx => `${ctx.eslintConfigFile}.jhi` }],
            },
          ],
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
      addDependencies({ application }) {
        this.packageJson.merge({
          devDependencies: {
            'eslint-config-prettier': application.nodeDependencies['eslint-config-prettier'],
            'eslint-plugin-prettier': application.nodeDependencies['eslint-plugin-prettier'],
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
