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
import { mutateDefaults } from '../../../../lib/utils/index.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { isContentTypeField } from '../../../base-application/internal/content-type-fields.ts';
import { type EntitySample, formatEntitySample, generateEntitySamples } from '../../../base-application/support/index.ts';
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
        const { fields } = entity;
        // The JSON samples give each blob the content type of its file, without its content type field.
        const jsonFields = fields.filter(field => !field.autoGenerate && !isContentTypeField(field));
        const [[testEntitySample], [testEntity], [fakeData]]: (EntitySample | undefined)[][] = generateEntitySamples(entity, {
          seed: 'e2e',
          batches: [
            { fields: jsonFields.filter(field => !(field as { nullable?: boolean }).nullable) },
            { fields: jsonFields },
            { fields: fields.filter(field => !field.id || !field.autoGenerate) },
          ],
        });
        const e2eFakeData = fakeData && formatEntitySample(fields, fakeData, 'cypress');
        mutateDefaults(entity, {
          e2eTestEntitySample: testEntitySample && formatEntitySample(fields, testEntitySample, 'json-serializable'),
          e2eTestEntity: testEntity && formatEntitySample(fields, testEntity, 'json-serializable'),
          e2eFakeData,
          e2eFieldsFakeData: e2eFakeData,
        });
      },
      prepareTestPlan({ entity }) {
        // The relationships of the entity by other entity, prepared by the base application.
        const { differentRelationships = {} } = entity as E2eEntity & {
          differentRelationships?: Record<string, E2eEntity['relationships']>;
        };
        mutateDefaults(entity, {
          e2eRequiredOtherEntities: ({ requiredRelationships }) => [...new Set(requiredRelationships!.map(rel => rel.otherEntity))],
          e2eOtherEntities: () => [
            ...new Set(
              Object.values(differentRelationships)
                .filter(rels => rels.length > 0)
                .map(rels => rels[0].otherEntity),
            ),
          ],
          e2eSkipCreateTest: ({ requiredRelationships, e2eRequiredOtherEntities, e2eFakeData }) =>
            // Cannot create a required relationship with itself.
            requiredRelationships!.some(rel => rel.otherEntity.builtInUser) ||
            // Required relationships that contain another required relationship are complex to handle.
            e2eRequiredOtherEntities!.some(otherEntity => otherEntity.relationships.some(rel => rel.relationshipRequired)) ||
            // Same as above.
            e2eRequiredOtherEntities!.some(otherEntity => otherEntity.primaryKey?.derived) ||
            // Cannot generate the required data to test.
            !e2eFakeData,
          e2eCreateTestFields: ({ fields }) =>
            fields.filter(field => (!field.id || !field.autoGenerate) && !field.hidden && !field.readonly),
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }
}
