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
import { mutateData } from '../../../../lib/utils/index.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { generateTestEntity } from '../../../client/support/index.ts';
import { mutateApplication } from '../../application.ts';
import type { Application as E2eApplication, Entity as E2eEntity } from '../../types.ts';

/** The properties of the application the e2e test frameworks share. */
export default class E2eBootstrapGenerator extends BaseApplicationGenerator<E2eEntity, E2eApplication> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('client');
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadApplicationDefaults({ applicationDefaults }) {
        applicationDefaults(mutateApplication);
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      prepareTestEntities({ entity }) {
        entity.resetFakerSeed?.('e2e');
        mutateData(entity, {
          __override__: false,
          e2eTestEntitySample: ({ fields }) =>
            generateTestEntity(fields.filter(field => !field.autoGenerate && !(field as { nullable?: boolean }).nullable)),
          e2eTestEntity: ({ fields }) => generateTestEntity(fields.filter(field => !field.autoGenerate)),
          e2eFakeData: () => entity.generateFakeData?.('cypress'),
          e2eFieldsFakeData: ({ e2eFakeData, fields }) =>
            e2eFakeData ??
            Object.fromEntries(
              fields.filter(field => !field.id || !field.autoGenerate).map(field => [field.fieldName, field.generateFakeData?.('cypress')]),
            ),
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }
}
