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
import { passthrough } from '@yeoman/transform';
import { isFileStateModified } from 'mem-fs-editor/state';

import BaseApplicationGenerator from '../../../base-application/index.ts';
import { createJhiTransformTranslateStringifyReplacer } from '../../../languages/support/translate.ts';
import { clientApplicationTemplatesBlock } from '../../support/index.ts';

/** Client code bound to the Spring Boot backend, composed by the client frameworks for that backend only. */
export default class ClientSpringBootGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('client');
    }
  }

  get default() {
    return this.asDefaultTaskGroup({
      queueTranslateTransform({ application }) {
        if (application.enableTranslation) return;

        // The translations are loaded after the files are written, the texts are replaced when the generation ends.
        const translate = createJhiTransformTranslateStringifyReplacer(application.getWebappTranslation);
        this.queueTransformStream(
          {
            name: 'translating the Spring Boot client files',
            filter: file =>
              isFileStateModified(file) && file.path.startsWith(this.destinationPath()) && /shared\/jhipster\/metrics\.ts$/.test(file.path),
            refresh: false,
          },
          passthrough(file => {
            file.contents = Buffer.from(translate(file.contents.toString()));
          }),
        );
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [
            clientApplicationTemplatesBlock({
              condition: ctx => ctx.withAdminUi,
              templates: ['shared/jhipster/label.ts', 'shared/jhipster/logs.ts', 'shared/jhipster/metrics.ts'],
            }),
            clientApplicationTemplatesBlock({
              condition: ctx => ctx.withAdminUi && ctx.clientTestFrameworkVitest,
              templates: ['shared/jhipster/logs.spec.ts', 'shared/jhipster/metrics.spec.ts'],
            }),
          ],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }
}
