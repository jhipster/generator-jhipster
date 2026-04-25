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
import type { Config as BaseApplicationConfig } from '../base-application/types.d.ts';
import BaseApplicationGenerator from '../base-simple-application/index.ts';

import { applyCiCdDeployConfiguration } from './support/generator.ts';
import { ciCdGeneratorNamespace } from './support/providers.ts';
import type { Application as CiCdApplication } from './types.ts';

export default class CiCdGenerator extends BaseApplicationGenerator<CiCdApplication> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('ci-cd');

    if (!this.delegateToBlueprint && this.options.commandName === 'ci-cd') {
      const { backendType = 'Java' } = this.jhipsterConfig as BaseApplicationConfig;
      if (['Java', 'SpringBoot'].includes(backendType)) {
        await this.dependsOnBootstrap('java');
      }
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ applicationDefaults }) {
        applicationDefaults({
          gitLabIndent: ({ sendBuildToGitlab }) => (sendBuildToGitlab ? '    ' : ''),
          indent: ({ insideDocker, gitLabIndent }) => {
            let indent = insideDocker ? '    ' : '';
            indent += gitLabIndent;
            return indent;
          },
          cypressTests: ({ testFrameworks }) => testFrameworks?.includes('cypress') ?? false,
        });
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composeProviders() {
        for (const ciCd of this.context.ciCd ?? []) {
          await this.composeWithJHipster(ciCdGeneratorNamespace(ciCd));
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      postWriting({ application }) {
        applyCiCdDeployConfiguration(this, application);
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  shouldAskForPrompts() {
    return true;
  }
}
