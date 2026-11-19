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
import { mutateData } from '../../../../lib/utils/object.ts';
import { ClientApplicationGenerator } from '../../generator.ts';
import { clientApplicationTemplatesBlock } from '../../support/files.ts';
import { filterEntitiesAndPropertiesForClient } from '../../support/filter-entities.ts';

import { getRestDomainNewProperties, mutateRestDomainField, mutateRestDomainRelationship } from './support/rest-domain-types.ts';

/**
 * Writes the types of the REST API of the entities, as their JSON is sent and received: the dates are the strings of the
 * server, the related entities their primary key and the field they are displayed by.
 */
export default class RestDomainGenerator extends ClientApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('client');
    }
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareRestDomainField({ application, field }) {
        // The command of the client gives the prefix its default.
        mutateData(field, mutateRestDomainField({ restDomainPrefix: application.restDomainPrefix! }));
      },
    });
  }

  get [ClientApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      prepareRestDomainRelationships({ entity }) {
        for (const relationship of entity.relationships) {
          mutateData(relationship, mutateRestDomainRelationship);
        }
      },
      prepareRestDomainNewProperties({ entity }) {
        entity.restDomainNewProperties ??= getRestDomainNewProperties(entity);
      },
    });
  }

  get [ClientApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      // The entity command skips the writing priority: the types of the dates are written with the entities.
      async writeRestDomainFiles({ application, entities }) {
        await this.writeFiles({
          blocks: [clientApplicationTemplatesBlock({ templates: ['shared/jhipster/rest.model.ts'] })],
          context: application,
        });
        const clientEntities = (application.filterEntitiesAndPropertiesForClient ?? filterEntitiesAndPropertiesForClient)(entities);
        // The relationships with the built-in user need its type, even when the clients write no file of it, as React and Vue.
        const builtInUser = entities.find(
          entity => entity.builtInUser && !clientEntities.some(clientEntity => clientEntity.name === entity.name),
        );
        for (const entity of builtInUser ? [...clientEntities, builtInUser] : clientEntities) {
          await this.writeFiles({
            blocks: [
              clientApplicationTemplatesBlock({
                templates: [
                  'entities/_entityFolder_/_entityFile_.rest.model.ts',
                  'entities/_entityFolder_/_entityFile_.rest.model.spec.ts',
                ],
              }),
            ],
            context: {
              ...application,
              ...entity,
              // The built-in user is sent by the relationships as its id and its login only.
              ...(entity.builtInUser ?
                {
                  fields: entity.fields.filter(field => ['id', 'login'].includes(field.fieldName)),
                  relationships: [],
                  readOnly: true,
                }
              : {}),
            },
          });
        }
      },
    });
  }

  get [ClientApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }
}
