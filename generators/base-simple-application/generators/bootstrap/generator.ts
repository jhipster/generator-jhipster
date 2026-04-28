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
import { packageJson } from '../../../../lib/index.ts';
import { getConfigWithDefaults } from '../../../../lib/jhipster/default-application-options.ts';
import { finalizeMutations, removeFieldsWithNullishValues } from '../../../../lib/utils/object.ts';
import { mutateApplicationLoading, mutateApplicationPreparing } from '../../application.ts';
import BaseSimpleApplicationGenerator from '../../index.ts';

export default class BaseSimpleApplicationBootstrapGenerator extends BaseSimpleApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('project-name');
    await this.dependsOnJHipster('project-name');
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configuring() {
        this.jhipsterConfig.baseName ??= 'jhipster';
      },
    });
  }

  get [BaseSimpleApplicationGenerator.CONFIGURING]() {
    return this.configuring;
  }

  get loading() {
    return this.asLoadingTaskGroup({
      cleanup({ application }) {
        // Null values may be set by prompts, remove them.
        for (const key of Object.keys(application)) {
          if (application[key] === null) {
            delete application[key];
          }
        }
      },
      loadConfig({ applicationDefaults }) {
        applicationDefaults(
          removeFieldsWithNullishValues(this.config.getAll()),
          {
            commandName: this.options.commandName,
          },
          mutateApplicationLoading,
        );
      },
    });
  }

  get [BaseSimpleApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ applicationDefaults }) {
        if (this.useVersionPlaceholders) {
          applicationDefaults({
            jhipsterVersion: 'JHIPSTER_VERSION',
          });
        }

        applicationDefaults(mutateApplicationPreparing);
      },
      loadNodeDependencies({ application }) {
        this.loadNodeDependencies(application.nodeDependencies, {
          prettier: packageJson.dependencies.prettier,
          'prettier-plugin-java': packageJson.dependencies['prettier-plugin-java'],
          'prettier-plugin-packagejson': packageJson.dependencies['prettier-plugin-packagejson'],
        });

        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster('common', 'resources', 'package.json'),
        );
      },
      loadDefaults({ application, applicationDefaults }) {
        let { applyDefaults } = this.options;
        applyDefaults ??= getConfigWithDefaults as any;
        applicationDefaults(applyDefaults!(application));
      },
    });
  }

  get [BaseSimpleApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get postPreparing() {
    return this.asPostPreparingTaskGroup({
      finalizeApplicationMutations({ application }) {
        finalizeMutations(application);
      },
    });
  }

  get [BaseSimpleApplicationGenerator.POST_PREPARING]() {
    return this.postPreparing;
  }
}
