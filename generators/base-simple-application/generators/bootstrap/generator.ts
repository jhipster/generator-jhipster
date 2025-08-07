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
import { packageJson } from '../../../../lib/index.ts';
import { removeFieldsWithNullishValues } from '../../../../lib/utils/object.ts';
import { RECOMMENDED_NODE_VERSION } from '../../../generator-constants.js';
import { baseNameProperties } from '../../../project-name/support/index.ts';
import BaseSimpleApplicationGenerator from '../../index.ts';

export default class BaseSimpleApplicationBootstrapGenerator extends BaseSimpleApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnJHipster('project-name');
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configuring() {
        if (this.jhipsterConfig.baseName === undefined) {
          this.jhipsterConfig.baseName = 'jhipster';
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.CONFIGURING]() {
    return this.configuring;
  }

  get bootstrapApplication() {
    return this.asBootstrapApplicationTaskGroup({
      loadConfig({ applicationDefaults }) {
        applicationDefaults(removeFieldsWithNullishValues(this.config.getAll()));
      },
    });
  }

  get [BaseSimpleApplicationGenerator.BOOTSTRAP_APPLICATION]() {
    return this.bootstrapApplication;
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loading({ applicationDefaults }) {
        applicationDefaults({
          jhipsterVersion: this.useVersionPlaceholders ? 'JHIPSTER_VERSION' : packageJson.version,
          jhipsterPackageJson: packageJson,
          nodeDependencies: {},
          customizeTemplatePaths: [],
        });
      },
    });
  }

  get [BaseSimpleApplicationGenerator.LOADING]() {
    return this.loading;
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareApplication({ applicationDefaults }) {
        applicationDefaults({
          ...baseNameProperties,
          nodeVersion: this.useVersionPlaceholders ? 'NODE_VERSION' : RECOMMENDED_NODE_VERSION,
          nodePackageManager: 'npm',
          nodePackageManagerCommand: ({ nodePackageManager }) => nodePackageManager,
          hipsterName: 'Java Hipster',
          hipsterProductName: 'JHipster',
          hipsterHomePageProductName: 'JHipster',
          hipsterStackOverflowProductName: 'JHipster',
          hipsterBugTrackerProductName: 'JHipster',
          hipsterChatProductName: 'JHipster',
          hipsterTwitterUsername: '@jhipster',
          hipsterDocumentationLink: 'https://www.jhipster.tech/',
          hipsterTwitterLink: 'https://twitter.com/jhipster',
          hipsterProjectLink: 'https://github.com/jhipster/generator-jhipster',
          hipsterStackoverflowLink: 'https://stackoverflow.com/tags/jhipster/info',
          hipsterBugTrackerLink: 'https://github.com/jhipster/generator-jhipster/issues?state=open',
          hipsterChatLink: 'https://gitter.im/jhipster/generator-jhipster',
          projectDescription: ({ projectDescription, humanizedBaseName }) => projectDescription ?? `Description for ${humanizedBaseName}`,
        });
      },
    });
  }

  get [BaseSimpleApplicationGenerator.PREPARING]() {
    return this.preparing;
  }
}
