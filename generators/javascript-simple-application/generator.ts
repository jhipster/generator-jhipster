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

import { packageJson } from '../../lib/index.ts';
import BaseSimpleApplicationGenerator from '../base-simple-application/index.ts';

import type {
  Application as JavascriptApplication,
  Config as JavascriptConfig,
  Options as JavascriptOptions,
  Source as JavascriptSource,
} from './types.ts';

/**
 * Utility class with types.
 */
export class JavascriptSimpleApplicationGenerator extends BaseSimpleApplicationGenerator<
  JavascriptApplication,
  JavascriptConfig,
  JavascriptOptions,
  JavascriptSource
> {}

export default class JavascriptGenerator extends JavascriptSimpleApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('javascript-simple-application');
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      migrate() {
        // @ts-expect-error migrate removed config
        const { clientPackageManager } = this.jhipsterConfig;
        if (clientPackageManager) {
          this.jhipsterConfig.nodePackageManager ??= clientPackageManager;
          // @ts-expect-error migrate removed config
          this.jhipsterConfig.clientPackageManager = undefined;
        }
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
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

  get [JavascriptSimpleApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      mergePackageJson({ application, source }) {
        const { packageJsonNodeEngine, dasherizedBaseName, projectDescription, packageJsonScripts, clientPackageJsonScripts } = application;

        this.packageJson.merge({ scripts: packageJsonScripts! });

        this.packageJson.defaults({
          name: dasherizedBaseName,
          version: '0.0.0',
          description: projectDescription,
          license: 'UNLICENSED',
        });

        if (packageJsonNodeEngine) {
          const packageJsonEngines: any = this.packageJson.get('engines') ?? {};
          this.packageJson.set('engines', {
            ...packageJsonEngines,
            node: typeof packageJsonNodeEngine === 'string' ? packageJsonNodeEngine : packageJson.engines.node,
          });
        }

        if (clientPackageJsonScripts && Object.keys(clientPackageJsonScripts).length > 0) {
          source.mergeClientPackageJson!({ scripts: clientPackageJsonScripts });
        }
      },
    });
  }

  get [JavascriptSimpleApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
