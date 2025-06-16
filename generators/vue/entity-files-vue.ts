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
import { asPostWritingEntitiesTask, asWritingEntitiesTask } from '../base-application/support/index.js';
import { clientApplicationTemplatesBlock, filterEntitiesForClient } from '../client/support/index.js';
import type { Application as ClientApplication, Entity as ClientEntity } from '../client/types.js';

export const entityFiles = {
  client: [
    clientApplicationTemplatesBlock({
      relativePath: 'shared/model/',
      templates: ['_entityModel_.model.ts'],
    }),
    {
      condition: generator => !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'entities/_entityFolder_/_entityFile_-details.vue',
        'entities/_entityFolder_/_entityFile_-details.component.ts',
        'entities/_entityFolder_/_entityFile_-details.component.spec.ts',
        'entities/_entityFolder_/_entityFile_.vue',
        'entities/_entityFolder_/_entityFile_.component.ts',
        'entities/_entityFolder_/_entityFile_.component.spec.ts',
        'entities/_entityFolder_/_entityFile_.service.ts',
        'entities/_entityFolder_/_entityFile_.service.spec.ts',
      ],
    },
    {
      condition: generator => !generator.readOnly && !generator.embedded,
      ...clientApplicationTemplatesBlock(),
      templates: [
        'entities/_entityFolder_/_entityFile_-update.vue',
        'entities/_entityFolder_/_entityFile_-update.component.ts',
        'entities/_entityFolder_/_entityFile_-update.component.spec.ts',
      ],
    },
  ],
};

export const writeEntityFiles = asWritingEntitiesTask<ClientEntity, ClientApplication<ClientEntity>>(async function writeEntityFiles({
  application,
  entities,
}) {
  for (const entity of (application.filterEntitiesAndPropertiesForClient ?? filterEntitiesForClient)(entities).filter(
    entity => !entity.skipClient && !entity.builtInUser,
  )) {
    await this.writeFiles({
      sections: entityFiles,
      context: { ...application, ...entity },
    });
  }
});

export const postWriteEntityFiles = asPostWritingEntitiesTask<ClientEntity, ClientApplication<ClientEntity>>(
  async function postWriteEntityFiles({ application, entities, source }) {
    source.addEntitiesToClient({
      application,
      entities: (application.filterEntitiesForClient ?? (entities => entities))(entities).filter(
        entity => !entity.builtInUser && !entity.embedded,
      ),
    });
  },
);

export const cleanupEntitiesFiles = asWritingEntitiesTask<ClientEntity, ClientApplication<ClientEntity>>(function cleanupEntitiesFiles({
  application,
  control,
  entities,
}) {
  for (const entity of (application.filterEntitiesForClient ?? (entities => entities))(entities).filter(
    entity => !entity.builtInUser && !entity.embedded,
  )) {
    const { entityFolderName, entityFileName } = entity;
    if (control.isJhipsterVersionLessThan('8.0.0-beta.3')) {
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}.component.spec.ts`);
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}-detail.component.spec.ts`);
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}-update.component.spec.ts`);
      this.removeFile(`${application.clientTestDir}/spec/app/entities/${entityFolderName}/${entityFileName}.service.spec.ts`);
    }
  }
});
